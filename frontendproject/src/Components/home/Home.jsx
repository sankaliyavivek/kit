import React, { useState, useEffect } from "react";
import axios from "axios";
import "../home/homeCss.scss";
import socket from "../../socket";

const BACKEND_API = import.meta.env.VITE_BACKEND_API_URL;

function Home() {
  const [foodItems, setFoodItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userId = localStorage.getItem("userId");
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // 🔥 For modal toggle

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
    if (!userId) {
      setCart([]);
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_API}/cart/${userId}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      setCart(response.data.items?.length ? response.data.items : []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (item) => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      alert("Please log in to add items to your cart!");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_API}/cart/add`,
        {
          userId,
          foodId: item._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCart(response.data.items);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong. Reverting cart.");
      fetchCart();
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
      console.error("Error updating cart:", error);
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
    if (!token || !userId) {
      alert("Please log in to place an order!");
      return;
    }

    const totalPrice = getSubtotal();
    if (totalPrice === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_API}/order/place-order`,
        { userId, totalPrice, items: cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setIsCheckedOut(true);
        setCart([]);
        // socket.emit("orderPlaced", response.data.order);
        alert(response.data.message);
        setTimeout(() => fetchCart(), 500);
      } else {
        alert("Order failed. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
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
          <button className="cart-toggle-btn" onClick={() => setIsCartOpen(true)}>
            View Cart
          </button>
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

      {/* Cart Section - Side or Modal */}
      <div className={`side-cart ${isCartOpen ? "open" : ""}`}>
        <h2>
        <span className="close-btn" onClick={() => setIsCartOpen(false)}>
            &times;
          </span>
          <br></br>
          Cart
          
        </h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.foodId} className="cart-item">
                <div className="cart-details">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">
                    ${item.price} x {item.quantity}
                  </p>
                </div>

                <div className="cart-controls">
                  <button
                    onClick={() => updateQuantity(item.foodId, -1)}
                    className="cart-btn"
                    disabled={isCheckedOut}
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateQuantity(item.foodId, 1)}
                    className="cart-btn1"
                    disabled={isCheckedOut}
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.foodId)}
                    className="remove-btn"
                    disabled={isCheckedOut}
                  >
                    X
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        )}

        <h4>Subtotal: ${getSubtotal().toFixed(2)}</h4>
        {cart.length > 0 && !isCheckedOut && (
          <button className="checkout-btn btn bg-info mt-2" onClick={checkout}>
            Proceed to Checkout
          </button>
        )}
        {isCheckedOut && <p className="checkout-message">✔ Order placed successfully! Items are locked.</p>}
      </div>
    </div>
  );
}

export default Home;
