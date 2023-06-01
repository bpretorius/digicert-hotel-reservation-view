import React, { useState, useEffect } from 'react'
import BasicModal from '../common/BasicModal/BasicModal'
import {Box, TextField} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import moment from 'moment';

const defaultInputValues = {
    hotel_name: 'Hotel',
    customer_name: 'Customer',
    reservationReference: 'REf',
    numberOfAdults: 0,
    numberOfChildren: 0,
    fromDate: moment(new Date()).format('YYYY-MM-DD'),
    toDate:  moment(new Date()).format('YYYY-MM-DD')
};

const NewReservationModal = ({ open, onClose, addNewReservation }) => {
    const [values, setValues] = useState(defaultInputValues);

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
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema)
    });

    const addReservation = (data) => {
        addNewReservation(data);
    };

    const handleChange = (value) => {
        setValues(value)
    };

    useEffect(() => {
        if (open) setValues(defaultInputValues);
    }, [open])

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
                value={values.hotel_name}
                onChange={(event) => handleChange({ ...values, hotel_name: event.target.value })}
            />
           <TextField
                placeholder="Customer Name"
                name="customer_name"
                label="Customer Name"
                required
                {...register('customer_name')}
                error={errors.customer_name ? true : false}
                helperText={errors.customer_name?.message}
                value={values.customer_name}
                onChange={(event) => handleChange({ ...values, customer_name: event.target.value })}
            />
            <TextField
                placeholder="Reservation Reference"
                name="customer_name"
                label="Reservation Reference"
                required
                {...register('reservationReference')}
                error={errors.reservationReference ? true : false}
                helperText={errors.reservationReference?.message}
                value={values.reservationReference}
                onChange={(event) => handleChange({ ...values, reservationReference: event.target.value })}
            />
            <TextField
                placeholder="Number Of Adults"
                name="numberOfAdults"
                label="Number Of Adults"
                required
                {...register('numberOfAdults')}
                error={errors.numberOfAdults ? true : false}
                helperText={errors.numberOfAdults?.message}
                value={values.numberOfAdults}
                onChange={(event) => handleChange({ ...values, numberOfAdults: event.target.value })}
            />
            <TextField
                placeholder="Number Of Children"
                name="numberOfChildren"
                label="Number Of Children"
                required
                {...register('numberOfChildren')}
                error={errors.numberOfChildren ? true : false}
                helperText={errors.numberOfChildren?.message}
                value={values.numberOfChildren}
                onChange={(event) => handleChange({ ...values, numberOfChildren: event.target.value })}
            />
             <TextField
                placeholder="From Date "
                name="fromDate"
                label="From Date"
                required
                {...register('fromDate')}
                error={errors.fromDate ? true : false}
                helperText={errors.fromDate?.message}
                value={values.fromDate}
                onChange={(event) => handleChange({ ...values, fromDate: event.target.value })}
            />
            <TextField
                placeholder="To Date "
                name="toDate"
                label="To Date"
                required
                {...register('toDate')}
                error={errors.toDate ? true : false}
                helperText={errors.toDate?.message}
                value={values.toDate}
                onChange={(event) => handleChange({ ...values, toDate: event.target.value })}
            />
        </Box>
    );
    
    return (
        <BasicModal
            open={open}
            onClose={onClose}
            title="New Reservation"
            subTitle="Fill out inputs and hit 'submit' button."
            content={getContent()}
            onSubmit={handleSubmit(addReservation)}
        />
            
    )
}

export default NewReservationModal
