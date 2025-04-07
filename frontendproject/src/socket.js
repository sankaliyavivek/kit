
// import { io } from "socket.io-client";

// const token = localStorage.getItem("token");

// const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL ;
// const socket = io(SOCKET_API, {
//   withCredentials: true,
//   transports: ["websocket", "polling"],
//   // secure: true,
//   auth: { token },  // ✅ Use auth instead of extraHeaders
// });


// socket.on("reconnect_attempt", () => {
//   const updatedToken = localStorage.getItem("token");
//   socket.auth.token = updatedToken;
// });
// export const getSocket = () => socket;
// export default socket;



// src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  if (!socket) {
    const SOCKET_API = import.meta.env.VITE_BACKEND_API_URL;

    socket = io(SOCKET_API, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token },
    });

    socket.on("reconnect_attempt", () => {
      const updatedToken = localStorage.getItem("token");
      socket.auth.token = updatedToken;
    });
  }

  return socket;
};

export const getSocket = () => socket;
