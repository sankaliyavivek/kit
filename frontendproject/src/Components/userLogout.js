// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import socket from "../socket"; // ✅ Import shared socket instance
// import axios from "axios";

// const useAutoLogout = () => {
//     const navigate = useNavigate();

//     useEffect(() => {
//         if (!localStorage.getItem("token")) return;

//         socket.on("forceLogout", async () => {
//             alert("You have been logged out due to login from another device.");
            
//             localStorage.clear();
//             await axios.post("http://localhost:9090/user/logout", {}, { withCredentials: true });

//             navigate("/login");
//         });

//         return () => socket.off("forceLogout"); // ✅ Remove listener to avoid memory leaks
//     }, [navigate]);

//     return null;
// };

// export default useAutoLogout;



import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import axios from "axios";

const useAutoLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) return;

        socket.on("forceLogout", async () => {
            alert("You have been logged out due to login from another device.");
            
            localStorage.clear();
            await axios.post("http://localhost:9090/user/logout", {}, { withCredentials: true });

            navigate("/login");
        });

        return () => socket.off("forceLogout"); 
    }, [navigate]);

    return null;
};

export default useAutoLogout;
