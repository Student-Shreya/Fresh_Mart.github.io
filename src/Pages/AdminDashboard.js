
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Activity, DollarSign, Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AdminGuard from '../Components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from './Components/ui/card';
import { Order } from './Entities/Order';
import { Product } from './Entities/Product';
import { User } from './Entities/User';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [ordersData, productsData, usersData] = await Promise.all([
                    Order.list('-created_date'),
                    Product.list(),
                    User.list()
                ]);

                const totalRevenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
                
                setStats({
                    revenue: totalRevenue,
                    orders: ordersData.length,
                    products: productsData.length,
                    customers: usersData.length,
                });

                setRecentOrders(ordersData.slice(0, 5));
                setTopProducts(productsData.filter(p => p.is_featured).slice(0, 4));
                
                // Process sales data for chart
                const salesByDay = ordersData.reduce((acc, order) => {
                    const day = format(new Date(order.created_date), 'yyyy-MM-dd');
                    if (!acc[day]) acc[day] = 0;
                    acc[day] += order.total_amount;
                    return acc;
                }, {});

                const chartData = Object.keys(salesByDay).map(day => ({
                    name: format(new Date(day), 'MMM d'),
                    sales: salesByDay[day]
                })).slice(-7); // last 7 days
                
                setSalesData(chartData);

            } catch (error) {
                console.error("Failed to load admin dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Overview of your store performance</p>
                </motion.div>
                
                {/* Enhanced Stats Cards */}
                <motion.div 
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {[
                        { title: "Total Revenue", value: `₹${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
                        { title: "Total Orders", value: `+${stats.orders}`, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
                        { title: "Products", value: stats.products, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
                        { title: "Customers", value: stats.customers, icon: Users, color: "text-orange-600", bg: "bg-orange-50" }
                    ].map((stat, index) => (
                        <motion.div key={stat.title} variants={itemVariants}>
                            <Card className="shadow-lg border-0 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                            <motion.p 
                                                className="text-3xl font-bold text-gray-900"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                            >
                                                {stat.value}
                                            </motion.p>
                                        </div>
                                        <motion.div 
                                            className={`${stat.bg} ${stat.color} p-3 rounded-full`}
                                            whileHover={{ scale: 1.1, rotate: 360 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <stat.icon className="h-6 w-6" />
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-7">
                    {/* Enhanced Sales Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-4"
                    >
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    Sales Overview (Last 7 Days)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#f8fafc', 
                                                border: 'none', 
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Enhanced Recent Orders */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="lg:col-span-3"
                    >
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Recent Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentOrders.map((order, index) => (
                                        <motion.div 
                                            key={order.id} 
                                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">{order.user_email}</p>
                                                <p className="text-sm text-gray-600">Order #{order.id.slice(-6)}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-green-600">₹{order.total_amount.toFixed(2)}</div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Top Products with Images */}
                {topProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl">Featured Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {topProducts.map((product, index) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="bg-white p-4 rounded-xl shadow-md border"
                                        >
                                            <motion.img
                                                src={product.image_url || "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=200&h=200&fit=crop"}
                                                alt={product.name}
                                                className="w-full h-32 object-cover rounded-lg mb-3"
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                            <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                                            <p className="text-lg font-bold text-green-600">₹{product.price.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </AdminGuard>
    );
}
