import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import DataTable from '../common/DataTable/DataTable';
import moment from 'moment';
import Container from '@mui/material/Container';
import NewReservationModal from '../Modals/NewReservationModal';
import EditReservationModal from '../Modals/EditReservationModal';
import AlertDialog from '../common/AlertDialog/AlertDialog'

// This field is used to store the selected reservation id for deletion. 
// If user confirms the deletion then this value is passed to the backend API
let selectedDeleteId;

// This field is used to store the selected reservation to be passed to the edit modal. 
let updateReservationDTO;

const ReservationTable = ({ onError }) => {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);   
    const [reservations, setReservations] = useState([]);    

    const columns = [
        { field: 'hotel_name', headerName: 'Hotel Name', width: 150, valueGetter: params => params.row.hotel.name },
        { field: 'customer_name', headerName: 'Customer Name', width: 150, valueGetter: params => params.row.customer.name },
        { field: 'reservationReference',headerName: 'Reservation Reference', width: 200 },
        { field: 'fromDate', headerName: 'From Date', width: 150, valueFormatter: params => moment(params?.value).format('YYYY-MM-DD') },
        { field: 'toDate', headerName: 'To Date', width: 150, valueFormatter: params => moment(params?.value).format('YYYY-MM-DD') },
        { field: 'edit', headerName: '', sortable: false, renderCell: (params) => {
            return (
              <Button
                onClick={(e) => onRowEditButtonClick(e, params.row)}            
              >
                Edit
              </Button>
                );
            } 
        },
        { field: 'delete', headerName: '', sortable: false, renderCell: (params) => {
            return (
              <Button
                onClick={(e) => onRowDeleteButtonClick(e, params.row)}            
              >
                Delete
              </Button>
                );
            } 
        }
    ];
    
    const reservationTableStyles = {
        height: '650px',
    };

    useEffect(() => {
        getReservations();
    }, []);

    const getReservations = async () => {
        try {
            const data = await (
                await fetch(
                "http://localhost:8080/reservation/list"
                )
            ).json();
                    
            setReservations(data.reservations);
        } catch (error) {
            console.log(error);
        }
    }

    const addReservation = async (reservation) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        };
        await fetch('http://localhost:8080/reservation', requestOptions)
            .then(() => getReservations())      
            .catch((error) => console.log(error));
    }

    const updateReservation = async (reservation) => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservation)
        };
        await fetch('http://localhost:8080/reservation', requestOptions)
            .then(() => getReservations())      
            .catch((error) => console.log(error));
    }

    const deleteReservation = async (id) => {
               
        const requestOptions = {
            method: 'DELETE'
        };
        await fetch(`http://localhost:8080/reservation/${id}`, requestOptions)
            .then(() => getReservations())      
            .catch(() => (error) => console.log(error));

        setAlertDialogOpen(false)

    }

    const getDataTable = () => {
        return (
            <DataTable
                rows={reservations}
                columns={columns}            
                sx={reservationTableStyles}
            />
        )
    }

    const getHeader = () => {
   
        const addReservation = () => {
            setOpen(true);
        };

        return (
          <>
            <Button 
                variant="contained"
                onClick={addReservation}
                size="large"
                
            >
                New Reservation
            </Button>           
          </>
        )
    };

    const onRowEditButtonClick = (e, row) => {
        updateReservationDTO = row;
        setEditOpen(true);
    }

    const onRowDeleteButtonClick = (e, row) => {
        selectedDeleteId = row.id
        setAlertDialogOpen(true);        
    }

    const addNewReservation = (data) => {
        const reservation = {};
        reservation.hotel = {};
        reservation.hotel.id = 1; // Hard coded for this demo, should be a drop down list of hotels in the modal
        reservation.hotel.name = data.hotel_name;
        reservation.customer = {};
        reservation.customer.id = 1; // Hard coded for this demo, should be a drop down list of customers in the modal
        reservation.customer.name = data.hotel_name;
        reservation.reservationReference = data.reservationReference;
        reservation.numberOfAdults = data.numberOfAdults;
        reservation.numberOfChildren = data.numberOfChildren;   
        reservation.fromDate = new Date(data.fromDate).toISOString();
        reservation.toDate = new Date(data.toDate).toISOString();
        
        addReservation(reservation);       
       
        setOpen(false);
    };

    const updateEditReservation = (data) => {
        const reservation = {};
        reservation.id = data.id;
        reservation.hotel = {};
        reservation.hotel.id = 1;
        reservation.hotel.name = data.hotel_name;
        reservation.customer = {};
        reservation.customer.id = 1;
        reservation.customer.name = data.hotel_name;
        reservation.reservationReference = data.reservationReference;
        reservation.numberOfAdults = data.numberOfAdults;
        reservation.numberOfChildren = data.numberOfChildren;   
        reservation.fromDate = new Date(data.fromDate).toISOString();
        reservation.toDate = new Date(data.toDate).toISOString();
        
        updateReservation(reservation);       
       
        setEditOpen(false);
    };

    
    return (
        <Container maxWidth="lg">
            {getHeader()}
            
            <NewReservationModal open={open} onClose={() => setOpen(false)} addNewReservation={addNewReservation}/>
            <EditReservationModal open={editOpen} onClose={() => setEditOpen(false)} reservation={updateReservationDTO} updateEditReservation={updateEditReservation}/>

            {getDataTable()}

            <AlertDialog open={alertDialogOpen}                    
                    dialogTitle={'Delete Reservation'} 
                    dialogContentText={'Are you sure?'} 
                    handleClose={() => setAlertDialogOpen(false)} 
                    handleYes={() => deleteReservation(selectedDeleteId)}                    
            />
            
        </Container>
        
    )

    
}

export default ReservationTable