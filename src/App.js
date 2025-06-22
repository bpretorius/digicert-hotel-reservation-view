// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Callback from './Callback';
import ReservationTable from './components/ReservationTable/ReservationTable';

function Home() {
  return (
    <Grid container>      
      <ReservationTable />
    </Grid>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Router>
  );
}

export default App;
