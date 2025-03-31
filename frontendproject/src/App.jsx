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
        <Route path="/" element={<Content></Content>}>
        <Route path='/home' element={<Home></Home>}></Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path='/login' element={<LoginPage></LoginPage>}></Route>
          <Route path='/kitchen' element={<Kitchen></Kitchen>}></Route>
          <Route path='/forgot' element={<ForgotPassword></ForgotPassword>}></Route>
          <Route path='/order' element={<OrderHistory></OrderHistory>}></Route>
        </Route>
      </Routes>

    </div>
  );
}

export default App;
