import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Cart = ({ cartId, updateCartId, fetchCartCount }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (cartId) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [cartId]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart/${cartId}`);
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.put(
        `${API}/cart/${cartId}/item/${productId}?quantity=${newQuantity}`
      );
      setCart(response.data.cart);
      fetchCartCount(cartId);
      if (newQuantity === 0) {
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart");
    }
  };

  const removeItem = async (productId) => {
    try {
      const response = await axios.delete(`${API}/cart/${cartId}/item/${productId}`);
      setCart(response.data.cart);
      fetchCartCount(cartId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (!cartId || !cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 shadow-xl bg-white/90 backdrop-blur" data-testid="empty-cart-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl" data-testid="empty-cart-title">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-6" data-testid="empty-cart-message">Start shopping to add items to your cart!</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full"
              data-testid="continue-shopping-btn"
            >
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              data-testid="back-to-shopping-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Shopping
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent" data-testid="cart-page-title">
              Shopping Cart
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.product_id} className="bg-white/90 backdrop-blur shadow-lg" data-testid={`cart-item-${item.product_id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-24 h-24 object-cover rounded-lg"
                      data-testid={`cart-item-image-${item.product_id}`}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800" data-testid={`cart-item-name-${item.product_id}`}>{item.name}</h3>
                      <p className="text-orange-600 font-bold mt-1" data-testid={`cart-item-price-${item.product_id}`}>${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="rounded-full"
                        data-testid={`decrease-quantity-btn-${item.product_id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-semibold w-8 text-center" data-testid={`cart-item-quantity-${item.product_id}`}>{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="rounded-full"
                        data-testid={`increase-quantity-btn-${item.product_id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => removeItem(item.product_id)}
                        className="rounded-full ml-4"
                        data-testid={`remove-item-btn-${item.product_id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur shadow-xl sticky top-24" data-testid="order-summary-card">
              <CardHeader>
                <CardTitle className="text-2xl" data-testid="order-summary-title">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold" data-testid="cart-subtotal">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-orange-600" data-testid="cart-total">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => navigate("/checkout")} 
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg py-6 rounded-full font-semibold"
                  data-testid="proceed-to-checkout-btn"
                >
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
