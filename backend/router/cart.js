const express = require("express");
const Cart = require('../modal/cart');
const Food = require("../modal/food");
const router = express.Router();
const mongoose = require('mongoose');
const { auth } = require("../auth/auth");
const {getIo} = require('../socket')

// Add item to cart
router.post("/add", auth,async (req, res) => {
    try {
        const { userId, foodId, quantity } = req.body;
        console.log(userId)

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({ message: "Invalid User ID or Food ID" });
        }

        const foodItem = await Food.findById(foodId);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex((item) => item.foodId.toString() === foodId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                foodId,
                name: foodItem.name,
                price: foodItem.price,
                quantity,
            });
        }

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        await cart.save();
        const io = getIo()
        io.emit("cartUpdated", { userId, items: cart.items, totalPrice: cart.totalPrice }); // Emit real-time update
        res.json({ items: cart.items, totalPrice: cart.totalPrice });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
// Get user's cart
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const cart = await Cart.findOne({ userId }).populate("items.foodId");
        if (!cart) return res.json({ items: [], totalPrice: 0 });

        // Ensure response structure includes populated food details
        const updatedItems = cart.items.map(item => ({
            foodId: item.foodId._id, 
            name: item.foodId.name, 
            price: item.foodId.price, 
            quantity: item.quantity
        }));

        res.json({ items: updatedItems, totalPrice: cart.totalPrice });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.post("/update", async (req, res) => {
    try {
        const { userId, foodId, quantity } = req.body; // quantity should be 1 or -1

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodId)) {
            return res.status(400).json({ message: "Invalid User ID or Food ID" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const itemIndex = cart.items.findIndex(item => item.foodId.toString() === foodId);

        if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

        cart.items[itemIndex].quantity += quantity;

        // Remove item if quantity reaches 0
        if (cart.items[itemIndex].quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }

        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const io = getIo()
        io.emit("cartUpdated", { userId, items: cart.items }); 

        await cart.save();
        res.json({ items: cart.items, totalPrice: cart.totalPrice });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Remove item from cart
router.post("/remove", async (req, res) => {
    try {
        const { userId, foodId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item.foodId.toString() !== foodId.toString());
        // cart.items = cart.items.filter(item => item.foodId.toString() !== foodId.toString());

        cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Clear cart
router.post("/clear", async (req, res) => {
    try {
        const { userId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = [];
        cart.totalPrice = 0;

        await cart.save();
        res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
