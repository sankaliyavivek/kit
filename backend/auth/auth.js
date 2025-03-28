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

module.exports = { auth };
