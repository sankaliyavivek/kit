import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../login/loginCss.scss';
import socket, { connectSocket } from '../../socket';

// let socket = null;

const BACKEND_API = import.meta.env.VITE_BACKEND_API_URL


// const socket = io("http://localhost:9090", {
//     withCredentials: true,
//     transports: ["websocket", "polling"], // Add fallback transport
// });
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        try {
            const response = await axios.post(
                `${BACKEND_API}/user/login`,
                { email, password },
                { withCredentials: true } // Ensure credentials are sent
            );

            if (response.data.token) {
                localStorage.setItem('username', response.data.name);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("role", response.data.role);

                alert("Login successful!");

                // socket = io(`${BACKEND_API}`, {
                //     withCredentials: true,
                //     transports: ["websocket", "polling"],
                //     auth: {
                //         token: response.data.token, // Pass token in headers
                //     },
                // });
                
                    connectSocket();

                    socket.emit("userLoggedIn", response.data.userId);

                    // Redirect based on role
                    if (response.data.role === "kitchen-staff") {
                        navigate("/kitchen");
                    } else if (response.data.role === "user") {
                        navigate("/home");
                    } else {
                        navigate("/login");
                    }
               // 100ms delay to ensure token is stored before connectSocket


            }
        } catch (error) {
            console.error("Login Error:", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className='login-main' style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div className="login-box">
                <div className="card-login">
                    <div className="card-body-login login-card-body">
                        <div className="login-logo">
                            <b>Login</b>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div className='input-group-text' onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                                    <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </div>
                            </div>

                            <div className="d-flex justify-content-center align-items-center">

                                <button className="btn login-btn">Log In</button>

                            </div>
                        </form>
                        <div className="social-auth-links text-center mb-3 d-grid gap-3">
                            <p>- OR -</p>
                            <button className="btn facebook-btn">
                                <i className="bi bi-facebook me-2"></i> Sign in using Facebook
                            </button>
                            <button className="btn google-btn">
                                <i className="bi bi-google me-2"></i> Sign in using Google+
                            </button>
                        </div>
                        <p className="mb-0 have text-center">
                            <Link to={'/register'} className='text-dark under'>Don't have an account? Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;