import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "../dashboard/dashboardCss.scss";
import socket from "../../socket";

const BACKEND_API=import.meta.env.VITE_BACKEND_API_URL

function Dashboard() {
  const [orders, setOrders] = useState([]);

  // ✅ Fetch Orders on Load
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${BACKEND_API}/order/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };


      console.log("Socket instance:", socket);

      
      socket.on("orderPlaced", (newOrder) => {
        console.log("📢 New order received:", newOrder);
      
        // ✅ Ensure userId is populated before updating state
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
      });
      

    socket.on("orderUpdated", (updatedOrder) => {
      console.log("🔄 Order updated:", updatedOrder);
      setOrders((prevOrders) =>
          prevOrders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order
          )
      );
  });

  fetchOrders();

    return () => {
      socket.off("orderPlaced");
      socket.off("orderUpdated");
    };
  }, []);


  const formatOrderTime = (orderDate) => {
    const date = new Date(orderDate);
    const now = new Date();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday = date.toDateString() === yesterday.toDateString();
    const isToday = date.toDateString() === now.toDateString();

    if (isYesterday) {
      return "Yesterday";
    } else if (isToday) {
      return date.toLocaleTimeString(); // Show time for today's orders
    } else {
      return date.toLocaleDateString(); // Show full date for older orders
    }
  };

  return (
    <div className="container-fluid dashboard-main pt-3">
      <h1 className="mb-4 ps-2">Kitchen Dashboard</h1>

      {/* Cards Section */}
      <div className="dashboard-card-wrapper">
        <div className="dashboard-card mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="card-title">Today's Orders</h4>
              <h3>{orders.length}</h3>
            </div>
          </div>
        </div>

        <div className="dashboard-card mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="card-title">Pending Orders</h4>
              <h3>{orders.filter((order) => order.status === "Pending").length}</h3>
            </div>
          </div>
        </div>

        <div className="dashboard-card mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center">
              <h4 className="card-title">Revenue</h4>
              <h3>
                ${orders.reduce((total, order) => total + order.totalPrice, 0).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card shadow-sm mt-4">
        <div className="card-header bg-dark text-white">
          <h5>Recent Orders</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={index}
                  className={
                    order.status === "Pending"
                      ? "table-danger"
                      : order.status === "Completed"
                        ? "table-success"
                        : order.status === "Cooking"
                          ? "table-warning"
                          : ""
                  }
                >
                 <td>{order._id ? order._id.slice(-6).toUpperCase() : "N/A"}</td>

                  <td>{order.userId?.name || "Unknown"}</td>
                  <td>
                    <span
                      className={`badge ${order.status === "Completed"
                          ? "bg-success"
                          : order.status === "Pending"
                            ? "bg-danger"
                            : order.status === "Cooking"
                              ? "bg-warning"
                              : "bg-secondary"
                        }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>{formatOrderTime(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
