const express = require("express");
const Order = require("../modal/order");
const Cart = require("../modal/cart");
const router = express.Router();
const { getIo } = require("../socket"); // Import Socket.IO from your main server

// Place an order from the cart
router.post("/place-order", async (req, res) => {
    try {
        const { userId, totalPrice, items } = req.body;

        if (!userId || totalPrice === undefined) {
            return res.status(400).json({ message: "Missing required fields: userId or totalPrice" });
        }

        const newOrder = new Order({
            userId,
            totalPrice,
            items: items.map(item => ({
                foodId: item.foodId, // Store food ID
                name: item.name, // Store name
                price: item.price, // Store price
                quantity: item.quantity // Store quantity
            })),
            createdAt: new Date()
        });

        await newOrder.save();

        // ✅ Clear the cart after order is placed
        await Cart.findOneAndUpdate({ userId }, { items: [] });

        // ✅ Ensure orderPlaced event is emitted correctly
        // ✅ Emit event for real-time updates (ensure `io` is correctly initialized)
        const io = getIo();
        if (io) {
            const populatedOrder = await newOrder.populate("userId", "name"); // ✅ Populate customer name
            console.log("🚀 Broadcasting new order with user:", populatedOrder);
            io.emit("orderPlaced", populatedOrder); // ✅ Send the full populated order
        }

        res.status(201).json({ success: true, message: "Order placed successfully!", order: newOrder });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// ✅ Fetch all orders for the kitchen dashboard
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("userId", "name"); // Get the customer name

        res.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Get all orders for the kitchen dashboard
router.get("/history/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId, hidden: false }).sort({ createdAt: -1 }); // 👈 Only fetch visible orders
        res.json(orders);
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put("/hide/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { hidden: true }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ success: true, message: "Order removed from history", orderId });
    } catch (error) {
        console.error("Error hiding order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Delete an order by ID
router.delete("/remove/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find and delete the order
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ success: true, message: "Order removed successfully!", orderId });
    } catch (error) {
        console.error("Error removing order:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.put("/update-status/:orderId", async (req, res) => {
    try {

        const { orderId } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        ).populate("userId", "name");

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        const io = getIo();
        if (io) {
            io.emit("orderUpdated", updatedOrder); // Broadcast order update
        }
        res.json({ success: true, message: "Order status updated", order: updatedOrder });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



module.exports = router;
