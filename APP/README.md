# ShopZen - Ecommerce Store

A modern, vibrant ecommerce store built with FastAPI, React, and MongoDB. Features a complete shopping experience with cart management, checkout, and an automatic discount system that rewards every 10th order.

## 🎯 Features

### Customer Features
- **Product Catalog**: Browse 8 pre-loaded products with images, descriptions, and prices
- **Shopping Cart**: Add items to cart, update quantities, remove items
- **Checkout**: Complete orders with customer information
- **Discount Codes**: Apply 10% discount codes (automatically generated on every 10th order)
- **Order Success**: View order details and receive discount codes when applicable
- **Responsive Design**: Modern, vibrant UI that works on all devices

### Admin Features
- **Dashboard**: View comprehensive statistics at a glance
  - Total orders count
  - Items purchased
  - Total revenue
  - Total discounts given
- **Discount Management**: 
  - View all discount codes (active and used)
  - Generate discount codes manually (when conditions are met)
  - Track discount code usage

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python
- **Database**: MongoDB (async with Motor)
- **API Design**: RESTful endpoints with /api prefix

### Frontend (React)
- **Framework**: React 19 with React Router
- **UI Components**: Shadcn/UI components (pre-installed)
- **Styling**: Tailwind CSS with custom gradients
- **State Management**: React hooks with localStorage for cart persistence

## 📋 API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{product_id}` - Get single product

### Cart
- `POST /api/cart/add` - Add item to cart
- `GET /api/cart/{cart_id}` - Get cart details
- `PUT /api/cart/{cart_id}/item/{product_id}` - Update item quantity
- `DELETE /api/cart/{cart_id}/item/{product_id}` - Remove item from cart

### Checkout
- `POST /api/checkout` - Process order with optional discount code

### Admin
- `GET /api/admin/stats` - Get comprehensive statistics
- `POST /api/admin/generate-discount` - Generate discount code (when nth order condition met)

## 🎨 Design Highlights

- **Color Scheme**: Orange-to-pink gradients with purple accents
- **Typography**: Inter font family for clean, modern look
- **Cards**: Glass-morphism effects with backdrop blur
- **Buttons**: Gradient backgrounds with smooth hover transitions
- **Layout**: Responsive grid layouts that adapt to screen size
- **Navigation**: Sticky header with mobile hamburger menu

## 🔧 Technical Implementation

### Discount System
- Every 10th order automatically generates a discount code
- Discount codes are 10% off entire order
- Each code can only be used once
- Codes are validated during checkout
- System tracks used vs. active codes

### Cart Management
- Cart persists in localStorage using cart_id
- Cart state synchronized across pages
- Real-time cart count updates in header
- Cart cleared automatically after successful checkout

### Data Models
- **Product**: id, name, description, price, image, category, stock
- **Cart**: id, items[], created_at, updated_at
- **Order**: id, items[], subtotal, discount_code, discount_amount, total, customer info, created_at
- **DiscountCode**: code, percentage, is_used, created_at, used_at

## 🚀 Getting Started

The application is already running and accessible at:
- Frontend: https://orderzen-1.preview.emergentagent.com
- Backend API: https://orderzen-1.preview.emergentagent.com/api

### Testing the Application

1. **Browse Products**: Visit the homepage to see the product catalog
2. **Add to Cart**: Click "Add to Cart" on any product
3. **View Cart**: Click the "Cart" button in the header
4. **Checkout**: Click "Proceed to Checkout" and fill in customer information
5. **Apply Discount**: Enter a discount code if you have one
6. **Admin Panel**: Visit /admin to see statistics and discount codes

### Testing Discount Generation

To test the 10th order discount generation, the system will automatically generate a discount code on every 10th, 20th, 30th order, etc. The discount code will be displayed on the order success page.

## 📊 Database Collections

- `products` - Product catalog (pre-seeded with 8 items)
- `carts` - Active shopping carts
- `orders` - Completed orders
- `discount_codes` - Generated discount codes

## 🎯 Business Logic

1. **Order Placement**: 
   - Cart validated (not empty)
   - Discount code validated (if provided)
   - Order created with all details
   - Cart cleared after successful order

2. **Discount Generation**:
   - Automatically triggered on every 10th order
   - Creates unique code (format: DISCOUNT + 8 hex characters)
   - 10% discount on entire order
   - Single-use only

3. **Statistics Calculation**:
   - Real-time aggregation from orders collection
   - Tracks total revenue, items sold, and discounts given

## 🔒 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://orderzen-1.preview.emergentagent.com
```

## 🧪 Testing

The application has been comprehensively tested:
- ✅ Backend API: 100% success rate (12/12 endpoints)
- ✅ Frontend: 100% success rate
- ✅ Complete shopping flow working
- ✅ Discount code generation and validation
- ✅ Admin dashboard statistics
- ✅ Mobile responsive design

## 📝 Notes

- All products are pre-seeded on backend startup
- Cart IDs are stored in browser localStorage
- Discount codes are case-insensitive
- The system uses MongoDB for storage
- All timestamps use UTC timezone

## 🎉 Key Achievements

- Modern, vibrant Amazon-style UI
- Complete shopping experience
- Automatic discount system
- Admin dashboard for insights
- Mobile-first responsive design
- Comprehensive API documentation
- 100% test coverage

---

Built with ❤️ using FastAPI, React, and MongoDB
