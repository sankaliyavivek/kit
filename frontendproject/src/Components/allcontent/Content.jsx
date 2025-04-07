import { Outlet, Link, useNavigate } from "react-router-dom";
import {  useEffect, useState } from "react";
import "../allcontent/contentCss.scss";
import axios from 'axios';
import useAutoLogout from "../userLogout";



const BACKEND_API = import.meta.env.VITE_BACKEND_API_URL
function Content() {
    useAutoLogout();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const name = localStorage.getItem("username");
    const role = localStorage.getItem("role")
    const navigate = useNavigate();


     // ✅ Auto logout when tab or window is closed
     useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);



    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.warn("User already logged out or token missing");
                navigate("/login");
                return;
            }

            console.log("Logging out... Checking cookies before request:");
            console.log(document.cookie);  // Debugging: Check if cookies exist

            await axios.post(`${BACKEND_API}/user/logout`, {}, { withCredentials: true });

            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error.response?.data || error.message);
        }
    };


    return (
        <div>
            <div>
                <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    <i className="bi bi-list"></i>
                </button>
            </div>

            <aside className={`sidebar text-white p-3 ${isSidebarOpen ? "open" : ""}`}>
                <h3 className="text-center">Kitchen Panel</h3>
                {name && <p className="text-center">Welcome, {name}!</p>}
                <nav>
                    <ul className="nav flex-column">
                        {/* Show Dashboard link for 'user' role */}
                        {role === "user" && (
                            <>
                               <li className="nav-item">
                               <Link className="nav-link" to={'/home'} onClick={() => setSidebarOpen(false)}>Home</Link>
                           </li>
              
                            <li className="nav-item">
                                <Link className="nav-link" to={'/dashboard'} onClick={() => setSidebarOpen(false)}>Dashboard</Link>
                            </li>
                            </>


                        )}

                        {/* Show Order History link for User role */}
                        {role === "user" && (
                            <li className="nav-item">
                                <Link className="nav-link" to={'/order'} onClick={() => setSidebarOpen(false)}>Order History</Link>
                            </li>
                        )}

                        {/* Show Kitchen link and Logout button for Kitchen Staff */}
                        {role === "kitchen-staff" && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to={'/kitchen'} onClick={() => setSidebarOpen(false)}>Kitchen</Link>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link text-start text-white w-100" onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        )}

                        {/* Show Logout button for User role */}
                        {role === "user" && (
                            <li className="nav-item">
                                <button className="nav-link text-start text-white w-100" onClick={handleLogout}>Logout</button>
                            </li>
                        )}

                        {/* Show Register and Login links for Guests (no role) */}
                        {!role && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to={'/register'} onClick={() => setSidebarOpen(false)}>Register</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to={'/login'} onClick={() => setSidebarOpen(false)}>Login</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

export default Content;
