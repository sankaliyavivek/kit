import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../home/homeCss.scss";
import socket from "../../socket";


// const socket = io("http://localhost:9090", {
//   withCredentials: true,
//   transports: ["websocket", "polling"], // Add fallback transport
// });

const BACKEND_API=import.meta.env.VITE_BACKEND_API_URL


function Home() {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userId = localStorage.getItem("userId");
  const [isCheckedOut, setIsCheckedOut] = useState(false); // Track if checkout is completed

  useEffect(() => {
    fetchCart();
    axios
      .get(`${BACKEND_API}/food/getfood`)
      .then((response) => setFoodItems(response.data))
      .catch((error) => console.error("Error fetching food:", error));

      const handleCartUpdate = (data) => {
        if (data.userId === userId) {
            setCart(data.items);
        }
    };

    const handleOrderUpdated = (order) => {
      console.log("🔔 New order received:", order);
      fetchCart(); 
  };

    socket.on("cartUpdated", handleCartUpdate);
    socket.on("orderPlaced", handleOrderUpdated);
    return () => {
      socket.off("cartUpdated");
      socket.off("orderPlaced");
    };

  }, []);

  const fetchCart = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setCart([]); // Clear cart if no user
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_API}/cart/${userId}`, {
        headers: { "Cache-Control": "no-cache" }, // 🔥 Prevents old cached response
      });

      // Check if cart is really empty in the response
      setCart(response.data.items?.length ? response.data.items : []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };



  const addToCart = async (item) => {

    const token = localStorage.getItem("token"); // Retrieve the token

    if (!token) {
      alert("Please log in to add items to your cart!");
      return;
    }

    if (!userId) {
      alert("Please log in to add items to your cart!");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_API}/cart/add` , {
        userId,
        foodId: item._id,
        quantity: 1,
      },
        {
          headers: {
            "Authorization": `Bearer ${token}`, // 🔥 Send token in Authorization header
            "Content-Type": "application/json"
          }
        }
      );

      setCart(response.data.items);
      console.log(response.data.items)
      socket.emit("orderPlaced", response.data.order);

    } catch (error) {
      console.error("Error adding to cart:", error.response?.data || error.message);
    }
  };

  const updateQuantity = async (foodId, change) => {
    if (!userId) {
      alert("Please log in to update your cart!");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_API}/cart/update`, {
        userId,
        foodId,
        quantity: change,
      });

      setCart(response.data.items);
    } catch (error) {
      console.error("Error updating cart:", error.response?.data || error.message);
    }
  };

  const removeFromCart = async (foodId) => {
    try {
      const response = await axios.post(`${BACKEND_API}/cart/remove`, {
        userId,
        foodId: foodId.toString(),
      });

      setCart(response.data.items);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const getSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const filteredFoodItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to place an order!");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    const totalPrice = getSubtotal();
    if (totalPrice === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_API}/order/place-order`, { userId, totalPrice, items: cart }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.success) {
        alert(response.data.message);
        setIsCheckedOut(true);
        setCart([]); // ✅ Clear frontend cart immediately
        socket.emit("orderUpdated", response.data.order);

        // ✅ Force refetch to ensure backend cart is cleared
        setTimeout(() => fetchCart(), 500);
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error.message);
      alert("Something went wrong. Please try again.");
    }
  };



  return (
    <div className="container">
      {/* Food Menu */}
      <div className="food-menu-container">
        <header className="food-menu-header">
          <h1>Food Menu</h1>
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </header>

        <div className="food-items-list">
          {filteredFoodItems.map((item, index) => (
            <div key={`${item._id}-${index}`} className="food-item">
              <h4>{item.name}</h4>
              <p>${item.price}</p>
              <button onClick={() => addToCart(item)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="side-cart">
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.foodId} className="cart-item">
                <div className="cart-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">${item.price} x {item.quantity}</p>
                </div>

                <div className="cart-controls">
                  <button
                    onClick={() => updateQuantity(item.foodId, -1)}
                    className="cart-btn"
                    disabled={isCheckedOut} // 🔥 Disable after checkout
                  >
                    -
                  </button>

                  <button
                    onClick={() => updateQuantity(item.foodId, 1)}
                    className="cart-btn1"
                    disabled={isCheckedOut} // 🔥 Disable after checkout
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.foodId)}
                    className="remove-btn"
                    disabled={isCheckedOut} // 🔥 Disable after checkout
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h4>Subtotal: ${getSubtotal().toFixed(2)}</h4>

        {/* Checkout Button */}
        {cart.length > 0 && !isCheckedOut && (
          <button className="checkout-btn btn bg-info mt-2" onClick={checkout}>
            Proceed to Checkout
          </button>
        )}

        {/* Show confirmation message if checked out */}
        {isCheckedOut && <p className="checkout-message">✔ Order placed successfully! Items are locked.</p>}
      </div>
    </div>
  );
}

export default Home;
