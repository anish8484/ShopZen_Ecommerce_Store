import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import { Toaster } from "./components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

function App() {
  const [cartId, setCartId] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    // Load cart ID from localStorage
    const savedCartId = localStorage.getItem("cartId");
    if (savedCartId) {
      setCartId(savedCartId);
      fetchCartCount(savedCartId);
    }
  }, []);

  const fetchCartCount = async (id) => {
    try {
      const response = await axios.get(`${API}/cart/${id}`);
      const count = response.data.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemsCount(count);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const updateCartId = (id) => {
    setCartId(id);
    if (id) {
      localStorage.setItem("cartId", id);
      fetchCartCount(id);
    } else {
      localStorage.removeItem("cartId");
      setCartItemsCount(0);
    }
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home cartId={cartId} updateCartId={updateCartId} cartItemsCount={cartItemsCount} fetchCartCount={fetchCartCount} />} />
          <Route path="/cart" element={<Cart cartId={cartId} updateCartId={updateCartId} cartItemsCount={cartItemsCount} fetchCartCount={fetchCartCount} />} />
          <Route path="/checkout" element={<Checkout cartId={cartId} updateCartId={updateCartId} />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
