import React, { useEffect } from 'react'
import BasicModal from '../common/BasicModal/BasicModal'
import {Box, TextField} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import moment from 'moment';

const getDefaultInputValues = (reservation) => ({
    hotel_name: reservation?.hotel?.name ?? '',
    customer_name: reservation?.customer?.name ?? '',
    reservationReference: reservation?.reservationReference ?? '',
    numberOfAdults: reservation?.numberOfAdults ?? 0,
    numberOfChildren: reservation?.numberOfChildren ?? 0,
    fromDate: reservation?.fromDate ? moment(new Date(reservation.fromDate)).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD'),
    toDate: reservation?.toDate ? moment(new Date(reservation.toDate)).format('YYYY-MM-DD') : moment(new Date()).format('YYYY-MM-DD')
});

const EditReservationModal = ({ open, onClose, reservation, updateEditReservation }) => {
    const modalStyles = {
        inputFields: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: '20px',
            marginBottom: '15px',
            '.MuiFormControl-root': {
                marginBottom: '20px',
            },
        },
    };
    

    const validationSchema = Yup.object().shape({
        hotel_name: Yup.string()
            .required('Hotel Name is required'),
        customer_name: Yup.string()
            .required('Customer Name is required'),
        reservationReference: Yup.string()
            .required('Reservation Reference is required'),
        numberOfAdults: Yup.number()
            .required('Number of Adults is required'),
        numberOfChildren: Yup.number()
            .required('Number of Adults is required'),
        fromDate: Yup.string()
            .required('From Date is required'),
        toDate: Yup.string()
            .required('To Date is required')   
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: getDefaultInputValues(reservation)
    });

    const updateReservation = (data) => {
        data.id = reservation.id;
        updateEditReservation(data);
    };

    useEffect(() => {
        if (open) {
            reset(getDefaultInputValues(reservation));
        }
    }, [open, reservation, reset]);

    const getContent = () => (
        <Box sx={modalStyles.inputFields}>
            <TextField
                placeholder="Hotel Name"
                name="hotel_name"
                label="Hotel Name"
                required
                {...register('hotel_name')}
                error={errors.hotel_name ? true : false}
                helperText={errors.hotel_name?.message}
            />
           <TextField
                placeholder="Customer Name"
                name="customer_name"
                label="Customer Name"
                required
                {...register('customer_name')}
                error={errors.customer_name ? true : false}
                helperText={errors.customer_name?.message}
            />
            <TextField
                placeholder="Reservation Reference"
                name="reservationReference"
                label="Reservation Reference"
                required
                {...register('reservationReference')}
                error={errors.reservationReference ? true : false}
                helperText={errors.reservationReference?.message}
            />
            <TextField
                placeholder="Number Of Adults"
                name="numberOfAdults"
                label="Number Of Adults"
                required
                {...register('numberOfAdults')}
                error={errors.numberOfAdults ? true : false}
                helperText={errors.numberOfAdults?.message}
            />
            <TextField
                placeholder="Number Of Children"
                name="numberOfChildren"
                label="Number Of Children"
                required
                {...register('numberOfChildren')}
                error={errors.numberOfChildren ? true : false}
                helperText={errors.numberOfChildren?.message}
            />
             <TextField
                placeholder="From Date "
                name="fromDate"
                label="From Date"
                required
                {...register('fromDate')}
                error={errors.fromDate ? true : false}
                helperText={errors.fromDate?.message}
            />
            <TextField
                placeholder="To Date "
                name="toDate"
                label="To Date"
                required
                {...register('toDate')}
                error={errors.toDate ? true : false}
                helperText={errors.toDate?.message}
            />
        </Box>
    );
    
    return (
        <BasicModal
            open={open}
            onClose={onClose}
            title="Edit Reservation"
            subTitle="Fill out inputs and hit 'submit' button."
            content={getContent()}
            onSubmit={handleSubmit(updateReservation)}
        />
            
    )
}

export default EditReservationModal
