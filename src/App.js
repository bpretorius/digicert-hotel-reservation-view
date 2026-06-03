// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Callback from './Callback';
import LogoutCallback from './LogoutCallback';
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
        <Route path="/logout-callback" element={<LogoutCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
