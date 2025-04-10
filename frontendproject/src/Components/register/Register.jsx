import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../register/registerCss.scss';


const BACKEND_API=import.meta.env.VITE_BACKEND_API_URL



function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('user'); // Default role
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password || password.length < 5) {
            alert("Please enter valid details");
            return;
        }

        try {
            const response = await axios.post(`${BACKEND_API}/user/register`, {
               name,
                email,
                password ,
                role, // Send role in request
            },{withCredentials: true});
            
            alert(response.data.message);
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className='register-main' style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="register-box">
                <div className="card-register">
                    <div className="card-body-register register-card-body">
                        <div className="register-logo">
                            <b>Register</b>
                        </div>
                        <form onSubmit={handleSubmit}>
                        <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <div className="input-group-text">
                                    <span className="bi bi-envelope" />
                                </div>
                            </div>
                            <div className="input-group mb-3">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className='input-group-text'>
                                    <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                    </span>
                                </div>
                            </div>

                              {/* Role Selection */}
                              <div className="input-group mb-3">
                                <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} required>
                                    <option value="user">User</option>
                                    <option value="kitchen-staff">Kitchen Staff</option>
                                </select>
                            </div>

                            <div className="d-flex justify-content-center align-items-center">
                               
                                    <button type="submit" className="btn reg-btn d-grid gap-2">Sign Up</button>
                            
                            </div>
                        </form>
                        <div className="social-auth-links text-center mb-3 d-grid gap-3">
                            <p>- OR -</p>
                            <button className="btn facebook-btn">
                                <i className="bi bi-facebook me-2"></i>   Sign in using Facebook
                            </button>
                            <button className="btn google-btn">
                                <i className="bi bi-google me-2"></i>  Sign in using Google+
                            </button>
                        </div>
                        <p className="mb-0 text-center have">
                            <Link to={'/login'} className='text-dark under'>Already have an account? Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;