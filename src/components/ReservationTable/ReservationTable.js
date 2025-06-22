import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DataTable from '../common/DataTable/DataTable';
import moment from 'moment';
import Container from '@mui/material/Container';
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

    const columns = [
        { field: 'hotel_name', headerName: 'Hotel Name', width: 150, valueGetter: params => params.row.hotel.name },
        { field: 'customer_name', headerName: 'Customer Name', width: 150, valueGetter: params => params.row.customer.name },
        { field: 'reservationReference',headerName: 'Reservation Reference', width: 200 },
        { field: 'fromDate', headerName: 'From Date', width: 150, valueFormatter: params => moment(params?.value).format('YYYY-MM-DD') },
        { field: 'toDate', headerName: 'To Date', width: 150, valueFormatter: params => moment(params?.value).format('YYYY-MM-DD') },
        { field: 'edit', headerName: '', sortable: false, renderCell: (params) => (
            <Button onClick={(e) => onRowEditButtonClick(e, params.row)}>Edit</Button>
        ) },
        { field: 'delete', headerName: '', sortable: false, renderCell: (params) => (
            <Button onClick={(e) => onRowDeleteButtonClick(e, params.row)}>Delete</Button>
        ) }
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
        setIsAuthenticated(!!user && !user.expired);
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
            const user = await userManager.getUser();
            if (!user || user.expired) {
                console.log('User not authenticated or token expired');
            //    await userManager.signinRedirect();
                return [];
            }

            const response = await fetch("http://localhost:8080/hotel/reservation/list", {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }

            const data = await response.json();
            setReservations(data.reservations);
        } catch (error) {
            console.log('Failed to fetch reservations:', error);
        }
    };

    const addReservation = async (reservation) => {
        const token = await getAccessToken();
        if (!token) return;

        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(reservation)
        };

        try {
            await fetch('http://localhost:8080/hotel/reservation', requestOptions);
            await getReservations();
        } catch (error) {
            console.error('Failed to add reservation:', error);
        }
    };

    const updateReservation = async (reservation) => {
        const token = await getAccessToken();
        if (!token) return;

        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(reservation)
        };

        try {
            await fetch('http://localhost:8080/hotel/reservation', requestOptions);
            await getReservations();
        } catch (error) {
            console.error('Failed to update reservation:', error);
        }
    };

    const deleteReservation = async (id) => {
        const token = await getAccessToken();
        if (!token) return;

        const requestOptions = {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            await fetch(`http://localhost:8080/hotel/reservation/${id}`, requestOptions);
            await getReservations();
        } catch (error) {
            console.error('Failed to delete reservation:', error);
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
            <>
                {isAuthenticated && (
                    <Button 
                        variant="contained"
                        onClick={addReservation}
                        size="large"
                    >
                        New Reservation
                    </Button>
                )}
                <Login />
                <Logout />
                <UserInfo />         
            </>
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

    const addNewReservation = (data) => {
        const reservation = {
            hotel: { id: 1, name: data.hotel_name },
            customer: { id: 1, name: data.hotel_name },
            reservationReference: data.reservationReference,
            numberOfAdults: data.numberOfAdults,
            numberOfChildren: data.numberOfChildren,
            fromDate: new Date(data.fromDate).toISOString(),
            toDate: new Date(data.toDate).toISOString()
        };

        addReservation(reservation);       
        setOpen(false);
    };

    const updateEditReservation = (data) => {
        const reservation = {
            id: data.id,
            hotel: { id: 1, name: data.hotel_name },
            customer: { id: 1, name: data.hotel_name },
            reservationReference: data.reservationReference,
            numberOfAdults: data.numberOfAdults,
            numberOfChildren: data.numberOfChildren,
            fromDate: new Date(data.fromDate).toISOString(),
            toDate: new Date(data.toDate).toISOString()
        };

        updateReservation(reservation);       
        setEditOpen(false);
    };

    return (
        <Container maxWidth="lg">
            {getHeader()}

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
