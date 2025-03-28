import React, { useState, useEffect } from "react";
import axios from "axios";
import '../orderhistory/orderCss.scss'

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:9090/order/history/${userId}`);
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching order history:", error);
        }
    };

 

    const hideOrder = async (orderId) => {
        try {
            const response = await axios.put(`http://localhost:9090/order/hide/${orderId}`);
            if (response.data.success) {
                setOrders(orders.filter(order => order._id !== orderId)); // Update UI without removing from database
                alert("Order removed from history");
            }
        } catch (error) {
            console.error("Error hiding order:", error);
            alert("Failed to remove order from history");
        }
    };

    return (
        <div className="order-history">
            <h2>Order History</h2>
            {orders.length === 0 ? <p>No past orders.</p> : (
                <ul>
                    {orders.map((order, index) => (
                        <li key={index}>
                            <p>Order ID: {order._id}</p>
                            <p>Total Price: ${order.totalPrice}</p>
                            <p>Items:</p>
                            <ul>
                                {order.items.map((item, idx) => (
                                    <li key={idx}>{item.name} - {item.quantity}x</li>
                                ))}
                            </ul>
                            <p>Date: {new Date(order.createdAt).toLocaleString()}</p>

                            <button onClick={() => hideOrder(order._id)} className="remove-order-btn">🗑 Remove from History</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default OrderHistory;
