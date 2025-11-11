import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Home = ({ cartId, updateCartId, cartItemsCount, fetchCartCount }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(`${API}/cart/add`, {
        cart_id: cartId,
        product_id: productId,
        quantity: 1
      });
      
      const newCartId = response.data.cart_id;
      updateCartId(newCartId);
      toast.success("Added to cart!");
      fetchCartCount(newCartId);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                ShopZen
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                data-testid="nav-home-btn"
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/admin")}
                data-testid="nav-admin-btn"
              >
                Admin
              </Button>
              <Button 
                onClick={() => navigate("/cart")} 
                className="relative bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full"
                data-testid="nav-cart-btn"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold" data-testid="cart-items-count">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col space-y-2">
              <Button 
                variant="ghost" 
                onClick={() => { navigate("/"); setMobileMenuOpen(false); }}
                data-testid="mobile-nav-home-btn"
              >
                Home
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                data-testid="mobile-nav-admin-btn"
              >
                Admin
              </Button>
              <Button 
                onClick={() => { navigate("/cart"); setMobileMenuOpen(false); }} 
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full"
                data-testid="mobile-nav-cart-btn"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cartItemsCount})
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent" data-testid="hero-title">
            Discover Amazing Products
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto" data-testid="hero-subtitle">
            Shop the latest electronics and accessories with exclusive discounts on every 10th order!
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64" data-testid="loading-spinner">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-200 bg-white/90 backdrop-blur"
                data-testid={`product-card-${product.id}`}
              >
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      data-testid={`product-image-${product.id}`}
                    />
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ${product.price}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl mb-2 text-gray-800" data-testid={`product-name-${product.id}`}>{product.name}</CardTitle>
                  <CardDescription className="text-gray-600 line-clamp-2" data-testid={`product-description-${product.id}`}>
                    {product.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    onClick={() => addToCart(product.id)} 
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg"
                    data-testid={`add-to-cart-btn-${product.id}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600" data-testid="footer-text">
            © 2025 ShopZen. Get 10% off on every 10th order!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
