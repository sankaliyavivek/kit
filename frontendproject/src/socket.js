
import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const SOCKET_API = import.meta.env.VITE_SOCKET_API_URL;
const socket = io(SOCKET_API, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  // secure: true,
  auth: { token },  // ✅ Use auth instead of extraHeaders
});


socket.on("reconnect_attempt", () => {
  const newToken = localStorage.getItem("token");
  socket.auth.token = newToken;
});

export default socket;

