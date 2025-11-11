import requests
import sys
import json
from datetime import datetime

class EcommerceAPITester:
    def __init__(self, base_url="https://orderzen-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.cart_id = None
        self.product_ids = []
        self.discount_code = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, params=params)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        if success and response:
            self.product_ids = [product['id'] for product in response[:3]]  # Store first 3 product IDs
            print(f"Found {len(response)} products")
        return success

    def test_get_single_product(self):
        """Test getting a single product"""
        if not self.product_ids:
            print("❌ No product IDs available for single product test")
            return False
            
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"products/{self.product_ids[0]}",
            200
        )
        return success

    def test_add_to_cart(self):
        """Test adding items to cart"""
        if not self.product_ids:
            print("❌ No product IDs available for cart test")
            return False
            
        success, response = self.run_test(
            "Add to Cart (New Cart)",
            "POST",
            "cart/add",
            200,
            data={
                "product_id": self.product_ids[0],
                "quantity": 2
            }
        )
        if success and response:
            self.cart_id = response.get('cart_id')
            print(f"Created cart with ID: {self.cart_id}")
        return success

    def test_add_more_to_cart(self):
        """Test adding more items to existing cart"""
        if not self.cart_id or len(self.product_ids) < 2:
            print("❌ No cart ID or insufficient products for additional cart test")
            return False
            
        success, response = self.run_test(
            "Add to Cart (Existing Cart)",
            "POST",
            "cart/add",
            200,
            data={
                "cart_id": self.cart_id,
                "product_id": self.product_ids[1],
                "quantity": 1
            }
        )
        return success

    def test_get_cart(self):
        """Test getting cart contents"""
        if not self.cart_id:
            print("❌ No cart ID available for get cart test")
            return False
            
        success, response = self.run_test(
            "Get Cart",
            "GET",
            f"cart/{self.cart_id}",
            200
        )
        if success and response:
            print(f"Cart has {len(response.get('items', []))} items")
        return success

    def test_update_cart_quantity(self):
        """Test updating item quantity in cart"""
        if not self.cart_id or not self.product_ids:
            print("❌ No cart ID or product IDs available for quantity update test")
            return False
            
        success, response = self.run_test(
            "Update Cart Quantity",
            "PUT",
            f"cart/{self.cart_id}/item/{self.product_ids[0]}",
            200,
            params={"quantity": 3}
        )
        return success

    def test_remove_from_cart(self):
        """Test removing item from cart"""
        if not self.cart_id or len(self.product_ids) < 2:
            print("❌ No cart ID or insufficient products for remove test")
            return False
            
        success, response = self.run_test(
            "Remove from Cart",
            "DELETE",
            f"cart/{self.cart_id}/item/{self.product_ids[1]}",
            200
        )
        return success

    def test_checkout_without_discount(self):
        """Test checkout without discount code"""
        if not self.cart_id:
            print("❌ No cart ID available for checkout test")
            return False
            
        success, response = self.run_test(
            "Checkout without Discount",
            "POST",
            "checkout",
            200,
            data={
                "cart_id": self.cart_id,
                "customer_name": "Test Customer",
                "customer_email": "test@example.com"
            }
        )
        if success and response:
            print(f"Order created with ID: {response.get('id')}")
            if response.get('generated_discount_code'):
                self.discount_code = response.get('generated_discount_code')
                print(f"Generated discount code: {self.discount_code}")
        return success

    def test_checkout_with_invalid_discount(self):
        """Test checkout with invalid discount code"""
        # First create a new cart for this test
        if not self.product_ids:
            print("❌ No product IDs available for discount test")
            return False
            
        # Add item to new cart
        add_success, add_response = self.run_test(
            "Add to Cart for Discount Test",
            "POST",
            "cart/add",
            200,
            data={
                "product_id": self.product_ids[0],
                "quantity": 1
            }
        )
        
        if not add_success:
            return False
            
        test_cart_id = add_response.get('cart_id')
        
        success, response = self.run_test(
            "Checkout with Invalid Discount",
            "POST",
            "checkout",
            400,  # Expecting 400 for invalid discount
            data={
                "cart_id": test_cart_id,
                "customer_name": "Test Customer 2",
                "customer_email": "test2@example.com",
                "discount_code": "INVALID123"
            }
        )
        return success

    def test_checkout_with_valid_discount(self):
        """Test checkout with valid discount code"""
        if not self.discount_code or not self.product_ids:
            print("❌ No valid discount code or product IDs available for valid discount test")
            return False
            
        # Add item to new cart
        add_success, add_response = self.run_test(
            "Add to Cart for Valid Discount Test",
            "POST",
            "cart/add",
            200,
            data={
                "product_id": self.product_ids[0],
                "quantity": 1
            }
        )
        
        if not add_success:
            return False
            
        test_cart_id = add_response.get('cart_id')
        
        success, response = self.run_test(
            "Checkout with Valid Discount",
            "POST",
            "checkout",
            200,
            data={
                "cart_id": test_cart_id,
                "customer_name": "Test Customer 3",
                "customer_email": "test3@example.com",
                "discount_code": self.discount_code
            }
        )
        if success and response:
            print(f"Discount applied: ${response.get('discount_amount', 0)}")
        return success

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        if success and response:
            print(f"Total orders: {response.get('total_orders', 0)}")
            print(f"Total revenue: ${response.get('total_purchase_amount', 0)}")
            print(f"Discount codes: {len(response.get('discount_codes', []))}")
        return success

    def test_admin_generate_discount_invalid(self):
        """Test admin generate discount when conditions not met"""
        success, response = self.run_test(
            "Admin Generate Discount (Invalid Condition)",
            "POST",
            "admin/generate-discount",
            400  # Should fail if not 10th order
        )
        return success

def main():
    print("🚀 Starting Ecommerce API Tests...")
    tester = EcommerceAPITester()
    
    # Run all tests in sequence
    tests = [
        tester.test_get_products,
        tester.test_get_single_product,
        tester.test_add_to_cart,
        tester.test_add_more_to_cart,
        tester.test_get_cart,
        tester.test_update_cart_quantity,
        tester.test_remove_from_cart,
        tester.test_checkout_without_discount,
        tester.test_checkout_with_invalid_discount,
        tester.test_checkout_with_valid_discount,
        tester.test_admin_stats,
        tester.test_admin_generate_discount_invalid
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
            tester.tests_run += 1
    
    # Print final results
    print(f"\n📊 Final Results:")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
