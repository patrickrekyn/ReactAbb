/* eslint-disable no-unused-vars */
import React from 'react';
import UtilisateurTable from './components/UtilisateurTable';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import DashboardLayoutBasic from './components/Demo';

function App() {

    return (
        <Router>
            <div className="container mt-4">
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/utilisateurtable' element={<UtilisateurTable />} />
                    <Route path='/signup' element={<Signup />} />
                    {/*<Route path='/dashboardlayoutbasic' element={<DashboardLayoutBasic />} />*/}
                    <Route
                        path="/dashboardlayoutbasic"
                        element={
                            localStorage.getItem('token') ?
                                <DashboardLayoutBasic /> :
                                <Navigate to="/login" />
                        }/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;