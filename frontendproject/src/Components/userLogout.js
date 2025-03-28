
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import axios from "axios";


const BACKEND_API=import.meta.env.BACKEND_API_URL
const useAutoLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        socket.on("forceLogout", async () => {
            alert("You have been logged out due to login from another device.");
            
            localStorage.clear();
            await axios.post(`${BACKEND_API}/user/logout`, {}, { withCredentials: true });

            navigate("/login");
        });

        return () => socket.off("forceLogout"); 
    }, [navigate]);

    return null;
};

export default useAutoLogout;
