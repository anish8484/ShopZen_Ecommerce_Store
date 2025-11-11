import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { CheckCircle, ArrowLeft, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Checkout = ({ cartId, updateCartId }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    discount_code: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (cartId && !orderComplete) {
      fetchCart();
    } else if (!cartId && !orderComplete) {
      navigate("/");
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
      navigate("/cart");
    }
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.customer_email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setProcessing(true);

    try {
      const response = await axios.post(`${API}/checkout`, {
        cart_id: cartId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        discount_code: formData.discount_code || null
      });
      
      setOrderDetails(response.data);
      setOrderComplete(true);
      updateCartId(null);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error during checkout:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to process order");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (orderComplete && orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4 shadow-2xl bg-white/90 backdrop-blur" data-testid="order-success-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl text-gray-800" data-testid="order-success-title">Order Placed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-t border-b py-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold" data-testid="order-id">{orderDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold" data-testid="customer-name">{orderDetails.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold" data-testid="customer-email">{orderDetails.customer_email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span data-testid="order-subtotal">${orderDetails.subtotal.toFixed(2)}</span>
              </div>
              {orderDetails.discount_amount > 0 && (
                <div className="flex justify-between text-lg text-green-600">
                  <span>Discount ({orderDetails.discount_code}):</span>
                  <span data-testid="order-discount">-${orderDetails.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-orange-600" data-testid="order-total">${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>

            {orderDetails.generated_discount_code && (
              <div className="bg-gradient-to-r from-orange-100 to-pink-100 p-6 rounded-lg text-center border-2 border-orange-300">
                <Tag className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm text-gray-600 mb-2">Congratulations! You've earned a discount code:</p>
                <p className="text-2xl font-bold text-orange-600 mb-1" data-testid="generated-discount-code">{orderDetails.generated_discount_code}</p>
                <p className="text-xs text-gray-500">Use this code on your next purchase for 10% off!</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button 
              onClick={() => navigate("/")} 
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full"
              data-testid="continue-shopping-success-btn"
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
              onClick={() => navigate("/cart")}
              data-testid="back-to-cart-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent" data-testid="checkout-page-title">
              Checkout
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Customer Info Form */}
          <Card className="bg-white/90 backdrop-blur shadow-xl" data-testid="customer-info-card">
            <CardHeader>
              <CardTitle className="text-2xl">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input 
                    id="customer_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="customer-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_email">Email Address *</Label>
                  <Input 
                    id="customer_email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    required
                    className="mt-1"
                    data-testid="customer-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_code">Discount Code (Optional)</Label>
                  <Input 
                    id="discount_code"
                    type="text"
                    placeholder="Enter discount code"
                    value={formData.discount_code}
                    onChange={(e) => setFormData({...formData, discount_code: e.target.value.toUpperCase()})}
                    className="mt-1"
                    data-testid="discount-code-input"
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-white/90 backdrop-blur shadow-xl" data-testid="checkout-summary-card">
            <CardHeader>
              <CardTitle className="text-2xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex items-center space-x-3 pb-3 border-b" data-testid={`checkout-item-${item.product_id}`}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded"
                      data-testid={`checkout-item-image-${item.product_id}`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm" data-testid={`checkout-item-name-${item.product_id}`}>{item.name}</p>
                      <p className="text-gray-600 text-sm" data-testid={`checkout-item-quantity-${item.product_id}`}>Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-orange-600" data-testid={`checkout-item-price-${item.product_id}`}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-orange-600" data-testid="checkout-total">${calculateSubtotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit}
                disabled={processing}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg py-6 rounded-full font-semibold"
                data-testid="place-order-btn"
              >
                {processing ? "Processing..." : "Place Order"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
