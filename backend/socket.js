const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

let io;
const activeUsers = new Map();

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["https://sankaliyavivek.github.io" , "http://localhost:5173" ],
            credentials: true,
            methods: ["GET", "POST","PUT","DELETE"],
            allowedHeaders: ["Authorization", "Content-Type"]
        },
        transports: ["websocket", "polling"]
    });

    console.log("✅ Socket.IO initialized");

    io.on("connection", (socket) => {
        console.log("🔗 Client connected");
    
        const token = socket.handshake.auth?.token;  // ✅ Read from headers
    
        if (!token) {
            console.log("🚫 No token provided, disconnecting...");
            return socket.disconnect();
        }
    
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.userId;
    
            console.log(`👤 User Connected: ${userId}`);
            socket.join(userId);
    
            // if (activeUsers.has(userId)) {
            //     io.to(activeUsers.get(userId)).emit("forceLogout");
            // }
    

            if (activeUsers.has(userId)) {
                io.to(activeUsers.get(userId)).emit("forceLogout");
            }
            activeUsers.set(userId, socket.id);
    
            socket.on("cartUpdated", (cart) => {
                console.log("📢 Cart updated:", cart);
                io.to(cart.userId).emit("cartUpdated", cart);
            });
    
            socket.on("orderUpdated", (order) => {
                console.log("📦 New order placed:", order);
                io.emit("orderUpdated", order);  // Broadcast to all users
            });
            
            socket.on("disconnect", () => {
                console.log(`❌ User Disconnected: ${userId}`);
                activeUsers.delete(userId);
            });
    
        } catch (error) {
            console.log("❌ Invalid token, disconnecting...");
            socket.disconnect();
        }
    });
    
};

const getIo = () => {
    if (!io) throw new Error("❌ Socket.IO is not initialized");
    return io;
};

module.exports = { initializeSocket, getIo };
