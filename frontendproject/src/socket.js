// import { io } from "socket.io-client";

// const token = localStorage.getItem("token");

// const socket = io("http://localhost:9090", {
//   withCredentials: true,
//   transports: ["websocket", "polling"],
//   extraHeaders: token ? { Authorization: `Bearer ${token}` } : {} // ✅ Use extraHeaders instead of auth
// });

// export default socket;


import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io("http://localhost:9090", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  auth: { token },  // ✅ Use auth instead of extraHeaders
});

export default socket;
