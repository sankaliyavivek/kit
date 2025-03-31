const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['kitchen-staff', 'user'],
        default: 'user'
    },
    token: { type: String, default: null }, // Stores the latest active token
});

module.exports = mongoose.model("User", UserSchema);
