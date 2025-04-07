  import React, { useEffect } from 'react';
  import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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

     // Private route wrapper
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
  };

    return (
      <div className='layout-fixed sidebar-expand-lg '>
         <Router>
        <Content>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/kitchen" element={<PrivateRoute><Kitchen /></PrivateRoute>} />
            <Route path="/order" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Content>
      </Router>

      </div>
    );
  }

  export default App;
