import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Components/dashboard/Dashboard';
import Register from './Components/register/Register';
import LoginPage from './Components/login/LoginPage';
import './App.css';
import Kitchen from './Components/kitchen/Kitchen';
import Content from './Components/allcontent/Content';
import Home from './Components/home/Home';
import ForgotPassword from './Components/forgotpassword/ForgotPassword';
import OrderHistory from './Components/orderhistory/OrderHistory';
import socket from './socket';


function App() {

  // Helper function for private routing
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};


  useEffect(()=>{
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server!");
  });

  socket.on('disconnect',()=>{
    console.log('Disconnected from server')
  })

  return ()=>{
    socket.off('connect')
    socket.off('disconnect')

  }
  })
  return (
    <div className='layout-fixed sidebar-expand-lg '>
       <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Content /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kitchen" element={<Kitchen />} />
          <Route path="/order" element={<OrderHistory />} />
          {/* Default redirect to /home when logged in */}
          <Route index element={<Navigate to="/home" />} />
        </Route>

        {/* Catch-all: redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

    </div>
  );
}

export default App;
