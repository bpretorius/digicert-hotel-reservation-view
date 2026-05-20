import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DataTable from '../common/DataTable/DataTable';
import moment from 'moment';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import NewReservationModal from '../Modals/NewReservationModal';
import EditReservationModal from '../Modals/EditReservationModal';
import AlertDialog from '../common/AlertDialog/AlertDialog';
import { Login } from './../../Login';
import { Logout } from './../../Logout';
import { UserInfo } from './../../UserInfo';
import { userManager } from './../../auth-config';

// This field is used to store the selected reservation id for deletion. 
let selectedDeleteId;

// This field is used to store the selected reservation to be passed to the edit modal. 
let updateReservationDTO;

const ReservationTable = ({ onError }) => {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);   
    const [reservations, setReservations] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // ← Added
    const [backendError, setBackendError] = useState('');
    const [tenantId, setTenantId] = useState('');

    const [canUpdateReservation, setCanUpdateReservation] = useState(false);
    const [canDeleteReservation, setCanDeleteReservation] = useState(false);

    const UPDATE_RESERVATION_PERMISSIONS = [
        'update:hotel_reservation',
        'ROLE_ADMIN'
    ];

    const DELETE_RESERVATION_PERMISSIONS = [
        'delete:hotel_reservation',
        'ROLE_ADMIN'
    ];

    const extractUserClaims = (profile) => {
        const claimBuckets = [
            profile?.permission,
            profile?.permissions,
            profile?.scope,
            profile?.scp,
            profile?.roles,
            profile?.role,
            profile?.authorities,
            profile?.authority
        ];

        return claimBuckets
            .flatMap((value) => {
                if (!value) return [];
                if (Array.isArray(value)) return value;
                if (typeof value === 'string') return value.split(' ');
                return [];
            })
            .map((value) => String(value).trim())
            .filter(Boolean);
    };

    const hasAnyPermission = (userClaims, acceptedPermissions) => {
        const normalizedClaims = new Set(userClaims.map((claim) => claim.toLowerCase()));
        return acceptedPermissions.some((permission) => normalizedClaims.has(permission.toLowerCase()));
    };

    const clearBackendError = () => {
        setBackendError('');
    };

    const showBackendError = (message) => {
        setBackendError(message);
        if (onError) onError(message);
    };

    const buildBackendErrorMessage = async (response, fallbackMessage) => {
        const statusText = response.statusText ? ` ${response.statusText}` : '';
        let details = '';

        try {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const payload = await response.json();
                details = payload?.message
                    || payload?.error
                    || (Array.isArray(payload?.errors) ? payload.errors.join(', ') : '')
                    || '';
            } else {
                details = (await response.text()).trim();
            }
        } catch (error) {
            // Keep fallback when response body cannot be parsed.
        }

        if (details) {
            return `${fallbackMessage} (${response.status}${statusText}): ${details}`;
        }

        return `${fallbackMessage} (${response.status}${statusText}).`;
    };

    const columns = [
        { field: 'hotel_name', headerName: 'Hotel Name', width: 150, valueGetter: params => params.row.hotel.name },
        { field: 'customer_name', headerName: 'Customer Name', width: 150, valueGetter: params => params.row.customer.name },
        { field: 'reservationReference',headerName: 'Reservation Reference', width: 200 },
        { field: 'fromDate', headerName: 'From Date', width: 150, valueFormatter: params => moment(params?.value).format('YYYY-MM-DD') },
        { field: 'toDate', headerName: 'To Date', width: 150, valueFormatter: params => moment(params?.value).format('YYYY-MM-DD') },
        ...(canUpdateReservation ? [{ field: 'edit', headerName: '', sortable: false, renderCell: (params) => (
            <Button
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                onClick={(e) => onRowEditButtonClick(e, params.row)}
            >
                Edit
            </Button>
        ) }] : []),
        ...(canDeleteReservation ? [{ field: 'delete', headerName: '', sortable: false, renderCell: (params) => (
            <Button
                size="small"
                color="error"
                variant="outlined"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                onClick={(e) => onRowDeleteButtonClick(e, params.row)}
            >
                Delete
            </Button>
        ) }] : [])
    ];

    const reservationTableStyles = {
        height: '650px',
    };

    useEffect(() => {
        getReservations();
        checkAuth();

        userManager.events.addUserLoaded(checkAuth);
        userManager.events.addUserUnloaded(() => setIsAuthenticated(false));

        return () => {
            userManager.events.removeUserLoaded(checkAuth);
            userManager.events.removeUserUnloaded(() => setIsAuthenticated(false));
        };
    }, []);

    const checkAuth = async () => {
        const user = await userManager.getUser();
        const authenticated = !!user && !user.expired;
        setIsAuthenticated(authenticated);

        if (!authenticated) {
            setCanUpdateReservation(false);
            setCanDeleteReservation(false);
            setTenantId('');
            return;
        }

        // Extract tenant ID from common claim names
        const tenant = user.profile.tenant_id || user.profile.tenantId || user.profile.tid || user.profile.tenantid || '';
        setTenantId(tenant);

        const userClaims = extractUserClaims(user.profile);
        setCanUpdateReservation(hasAnyPermission(userClaims, UPDATE_RESERVATION_PERMISSIONS));
        setCanDeleteReservation(hasAnyPermission(userClaims, DELETE_RESERVATION_PERMISSIONS));
    };

    const getAccessToken = async () => {
        const user = await userManager.getUser();
        if (!user || user.expired) {
            console.warn('User is not authenticated or token is expired. Redirecting to login...');
            await userManager.signinRedirect();
            return null;
        }
        return user.access_token;
    };

    const getReservations = async () => {
        try {
            clearBackendError();
            const user = await userManager.getUser();
            if (!user || user.expired) {
                console.log('User not authenticated or token expired');
            //    await userManager.signinRedirect();
                setReservations([]);
                return [];
            }

            const response = await fetch("http://localhost:8080/hotel/reservation/list", {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(await buildBackendErrorMessage(response, 'Failed to load reservations'));
            }

            const data = await response.json();
            setReservations(data.reservations);
        } catch (error) {
            console.log('Failed to fetch reservations:', error);
            showBackendError(error.message || 'Failed to load reservations.');
        }
    };

    const addReservation = async (reservation) => {
        const token = await getAccessToken();
        if (!token) return false;

        clearBackendError();

        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(reservation)
        };

        try {
            const response = await fetch('http://localhost:8080/hotel/reservation', requestOptions);
            if (!response.ok) {
                throw new Error(await buildBackendErrorMessage(response, 'Failed to add reservation'));
            }
            await getReservations();
            return true;
        } catch (error) {
            console.error('Failed to add reservation:', error);
            showBackendError(error.message || 'Failed to add reservation.');
            return false;
        }
    };

    const updateReservation = async (reservation) => {
        const token = await getAccessToken();
        if (!token) return false;

        clearBackendError();

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(reservation)
        };

        try {
            const response = await fetch('http://localhost:8080/hotel/reservation', requestOptions);
            if (!response.ok) {
                throw new Error(await buildBackendErrorMessage(response, 'Failed to update reservation'));
            }
            await getReservations();
            return true;
        } catch (error) {
            console.error('Failed to update reservation:', error);
            showBackendError(error.message || 'Failed to update reservation.');
            return false;
        }
    };

    const deleteReservation = async (id) => {
        const token = await getAccessToken();
        if (!token) return;

        clearBackendError();

        const requestOptions = {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            const response = await fetch(`http://localhost:8080/hotel/reservation/${id}`, requestOptions);
            if (!response.ok) {
                throw new Error(await buildBackendErrorMessage(response, 'Failed to delete reservation'));
            }
            await getReservations();
        } catch (error) {
            console.error('Failed to delete reservation:', error);
            showBackendError(error.message || 'Failed to delete reservation.');
        }

        setAlertDialogOpen(false);
    };

    const getDataTable = () => {
        return (
            <DataTable
                rows={reservations}
                columns={columns}            
                sx={reservationTableStyles}
            />
        );
    };

    const getHeader = () => {
        const addReservation = () => {
            setOpen(true);
        };

        return (
            <Paper
                elevation={0}
                sx={{
                    mb: 2,
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #f7fafc 0%, #f3f6ff 100%)'
                }}
            >
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={1.5}
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                                Hotel Reservations
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage bookings and account access in one place.
                                {tenantId && ` • Tenant: ${tenantId}`}
                            </Typography>
                        </Box>

                        {isAuthenticated && (
                            <Button
                                variant="contained"
                                onClick={addReservation}
                                size="large"
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
                            >
                                New Reservation
                            </Button>
                        )}
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        justifyContent="space-between"
                    >
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                            <Login />
                            <Logout />
                        </Stack>

                        <UserInfo />
                    </Stack>
                </Stack>
            </Paper>
        );
    };

    const onRowEditButtonClick = (e, row) => {
        updateReservationDTO = row;
        setEditOpen(true);
    };

    const onRowDeleteButtonClick = (e, row) => {
        selectedDeleteId = row.id;
        setAlertDialogOpen(true);        
    };

    const addNewReservation = async (data) => {
        const reservation = {
            hotel: { id: 1, name: data.hotel_name },
            customer: { id: 1, name: data.customer_name },
            reservationReference: data.reservationReference,
            numberOfAdults: data.numberOfAdults,
            numberOfChildren: data.numberOfChildren,
            fromDate: new Date(data.fromDate).toISOString(),
            toDate: new Date(data.toDate).toISOString()
        };

        const isSaved = await addReservation(reservation);
        if (isSaved) setOpen(false);
    };

    const updateEditReservation = async (data) => {
        const reservation = {
            id: data.id,
            hotel: { id: 1, name: data.hotel_name },
            customer: { id: 1, name: data.customer_name },
            reservationReference: data.reservationReference,
            numberOfAdults: data.numberOfAdults,
            numberOfChildren: data.numberOfChildren,
            fromDate: new Date(data.fromDate).toISOString(),
            toDate: new Date(data.toDate).toISOString()
        };

        const isUpdated = await updateReservation(reservation);
        if (isUpdated) setEditOpen(false);
    };

    return (
        <Container maxWidth="lg">
            {getHeader()}

            {backendError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={clearBackendError}
                >
                    <AlertTitle>Backend Request Failed</AlertTitle>
                    {backendError}
                </Alert>
            )}

            <NewReservationModal
                open={open}
                onClose={() => setOpen(false)}
                addNewReservation={addNewReservation}
            />

            <EditReservationModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                reservation={updateReservationDTO}
                updateEditReservation={updateEditReservation}
            />

            {getDataTable()}

            <AlertDialog
                open={alertDialogOpen}
                dialogTitle={'Delete Reservation'} 
                dialogContentText={'Are you sure?'} 
                handleClose={() => setAlertDialogOpen(false)} 
                handleYes={() => deleteReservation(selectedDeleteId)}                    
            />
        </Container>
    );
};

export default ReservationTable;
