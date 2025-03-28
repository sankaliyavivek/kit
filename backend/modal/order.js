const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    status: { type: String, enum: ["Pending", "Preparing", "Completed"], default: "Pending" },
    totalPrice: { type: Number, required: true },
    hidden: { type: Boolean, default: false } ,
    placedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
