
  import { io } from "socket.io-client";

  const token = localStorage.getItem("token");

  const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL;
  const socket = io(SOCKET_API, {
    withCredentials: true,
    autoConnect:false,
    transports: ["websocket", "polling"],
    // secure: true,
    auth: { token },  // ✅ Use auth instead of extraHeaders
  });

  export const connectSocket = () => {
    const token = localStorage.getItem("token");
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
  };


  socket.on("reconnect_attempt", () => {
    const token = localStorage.getItem("token");
    socket.auth.token = token;
  });

  export default socket;

