const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../modal/user");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const auth = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.token !== token) {
            return res.status(401).json({ message: "Session expired, please log in again." });
        }

        
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token." });
    }
};


const limitKitchenStaff = async (req, res, next) => {
    try {
        const { role } = req.body;

        // If user is not registering as 'kitchen-staff', allow registration
        if (role !== "kitchen-staff") {
            return next();
        }

        // Count existing kitchen-staff users
        const kitchenStaffCount = await User.countDocuments({ role: "kitchen-staff" });

        // Allow registration if less than 2 kitchen-staff exist
        if (kitchenStaffCount < 2) {
            return next();
        }

        // If limit reached, block registration
        return res.status(403).json({ message: "Maximum kitchen-staff limit reached (2 users allowed)." });

    } catch (error) {
        console.error("Error in kitchen-staff limit middleware:", error);
        res.status(500).json({ message: "Server error while checking kitchen-staff limit." });
    }
};

module.exports = { auth,limitKitchenStaff };
