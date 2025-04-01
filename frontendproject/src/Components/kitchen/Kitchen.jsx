import React, { useState, useEffect } from "react";
import "../kitchen/kitchenCss.scss";
import socket from "../../socket";

const BACKEND_API=import.meta.env.VITE_BACKEND_API_URL

function KitchenScreen() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch orders from the backend
  useEffect(() => {
    fetch(`${BACKEND_API}/order/orders`) // Replace with your API endpoint
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));

    // Listen for real-time order updates
    socket.on("orderPlaced", (newOrder) => {
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

   

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("orderPlaced");
      socket.off("orderUpdated");
    };
  }, []);

  // Function to update order status
  const updateOrderStatus = (orderId, newStatus) => {
    if (!user || user.role !== "kitchen-staff") return;
    fetch(`${BACKEND_API}/order/update-status/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((updatedOrder) => {
        if (updatedOrder.success) {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === updatedOrder.order._id ? updatedOrder.order : order
            )
          );
          socket.emit("orderUpdated", updatedOrder.order);
        }
      })
      .catch((err) => console.error("Error updating order:", err));
  };

  return (
    <div className="content-wrapper pt-3">
      <section className="content-header ps-2">
        <h1>Kitchen Orders</h1>
      </section>
      <section className="container-fluid">
        <div className="box">
          <div className="box-header text-center">
            <h3 className="box-title">Real-time Orders</h3>
          </div>
          <div className="box-body table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                 {/* <th>Cook</th> */}
                  <th>Status</th>
                  <th>Items</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    style={{
                      backgroundColor:
                        order.status === "Pending"
                          ? "#ffc107" // Warning color (yellow)
                          : order.status === "Cooking"
                          ? "#17a2b8" // Info color (blue)
                          : order.status === "Ready"
                          ? "#28a745" // Success color (green)
                          : "white",
                    }}
                  >
                    <td>{order._id}</td>
                    <td>{order.userId?.name || "Unknown"}</td>
                    {/* <td>{order.cookId?.name || "Not Assigned"}</td> */}
                    <td>
                      <span className={`label label-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <ul style={{ listStyle: "none" }}>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.name} x {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {order.status === "Pending" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => updateOrderStatus(order._id, "Cooking")}
                        >
                          Start Cooking
                        </button>
                      )}
                      {order.status === "Cooking" && (
                        <button
                          className="btn btn-success"
                          onClick={() => updateOrderStatus(order._id, "Ready")}
                        >
                          Mark as Ready
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default KitchenScreen;
