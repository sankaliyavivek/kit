const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modal/user");
const { getIo } = require("../socket");
const dotenv = require("dotenv");
const { limitKitchenStaff } = require("../auth/auth");
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET)

// User Registration
router.post('/register',limitKitchenStaff, async (req, res) => {
    const { name, email, password,role } = req.body;
     

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, password: hashedPassword,role  });

    res.json({ message: 'User created successfully', user });
});

// User Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT Secret is missing" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id,role: user.role  }, JWT_SECRET, { expiresIn: "24h" });

        user.token = token;
        await user.save();

        // Emit logout event to previous session
        if (getIo()) {
            getIo().to(user._id.toString()).emit("forceLogout");
        }

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
        });

        res.json({ message: "Login successful", token, name: user.name, userId: user._id ,role: user.role});

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});


// User Logout
router.post("/logout", async (req, res) => {
    try {
        const token = req.cookies.token;

        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/",
            expires: new Date(0),
        });

        if (!token) {
            return res.status(200).json({ message: "User already logged out" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                console.warn("Token expired, but proceeding with logout...");
                return res.status(200).json({ message: "User logged out successfully" });
            } else {
                return res.status(400).json({ message: "Invalid token" });
            }
        }

        await User.findByIdAndUpdate(decoded.userId, { token: null });

        return res.json({ message: "User logged out successfully" });

    } catch (err) {
        console.error("Logout Error:", err);
        res.status(500).json({ message: "Logout failed", error: err.message });
    }
});



module.exports = router;
