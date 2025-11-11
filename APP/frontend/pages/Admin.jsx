import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, Package, DollarSign, Tag, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load statistics");
      setLoading(false);
    }
  };

  const generateDiscount = async () => {
    try {
      const response = await axios.post(`${API}/admin/generate-discount`);
      toast.success(`Discount code generated: ${response.data.code}`);
      fetchStats();
    } catch (error) {
      console.error("Error generating discount:", error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to generate discount code");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500" data-testid="loading-spinner"></div>
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
              data-testid="back-to-home-btn"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent" data-testid="admin-page-title">
              Admin Dashboard
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-shadow" data-testid="total-orders-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <Package className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800" data-testid="total-orders-value">{stats.total_orders}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-shadow" data-testid="total-items-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Items Purchased</CardTitle>
              <TrendingUp className="w-5 h-5 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800" data-testid="total-items-value">{stats.total_items_purchased}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-shadow" data-testid="total-revenue-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800" data-testid="total-revenue-value">${stats.total_purchase_amount.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-shadow" data-testid="total-discount-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Discounts</CardTitle>
              <Tag className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800" data-testid="total-discount-value">${stats.total_discount_amount.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Discount Codes Section */}
        <Card className="bg-white/90 backdrop-blur shadow-xl" data-testid="discount-codes-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Discount Codes</CardTitle>
                <CardDescription className="mt-1">Manage and generate discount codes</CardDescription>
              </div>
              <Button 
                onClick={generateDiscount}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full"
                data-testid="generate-discount-btn"
              >
                Generate Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.discount_codes.length === 0 ? (
              <div className="text-center py-12 text-gray-500" data-testid="no-discount-codes-message">
                <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No discount codes generated yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Discount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created At</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Used At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.discount_codes.map((code, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50" data-testid={`discount-code-row-${index}`}>
                        <td className="py-3 px-4 font-mono font-semibold text-orange-600" data-testid={`discount-code-${index}`}>{code.code}</td>
                        <td className="py-3 px-4" data-testid={`discount-percentage-${index}`}>{code.percentage}%</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            code.is_used 
                              ? 'bg-gray-200 text-gray-700' 
                              : 'bg-green-100 text-green-700'
                          }`} data-testid={`discount-status-${index}`}>
                            {code.is_used ? 'Used' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600" data-testid={`discount-created-${index}`}>
                          {new Date(code.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600" data-testid={`discount-used-${index}`}>
                          {code.used_at ? new Date(code.used_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
