const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    totalPrice: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);
