
import { motion } from "framer-motion";
import { Building, CreditCard, Lock, Smartphone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./Components/ui/card";
import { Input } from "./Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Components/ui/select";
import { CartItem } from "./Entities/CartItem";
import { Order } from "./Entities/Order";
import { OrderItem } from "./Entities/OrderItem";
import { Product } from "./Entities/Product";
import { User } from "./Entities/User";
import { createPageUrl } from "./utils";

export default function CheckoutPage() {
    const [user, setUser] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: 'USA' });
    const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '' });
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser.address) {
                    setAddress(currentUser.address);
                }

                const items = await CartItem.filter({ user_email: currentUser.email });
                if (items.length === 0) {
                    navigate(createPageUrl("Cart"));
                    return;
                }
                setCartItems(items);

                const productIds = items.map(item => item.product_id);
                const productsData = await Product.filter({ id: { $in: productIds } });
                const productsMap = productsData.reduce((map, p) => ({ ...map, [p.id]: p }), {});
                setProducts(productsMap);
            } catch (error) {
                await User.loginWithRedirect(window.location.href);
            } finally {
                setLoading(false);
            }
        };
        loadCheckoutData();
    }, [navigate]);

    const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });
    const handlePaymentChange = (e) => setPayment({ ...payment, [e.target.name]: e.target.value });

    const subtotal = cartItems.reduce((sum, item) => sum + (products[item.product_id]?.price || 0) * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setPlacingOrder(true);
        try {
            // 1. Create Order
            const newOrder = await Order.create({
                user_email: user.email,
                total_amount: total,
                status: 'pending',
                delivery_address: address,
                payment_method: payment.method === 'razorpay' ? 'Razorpay' : `Card ending in ${payment.cardNumber.slice(-4)}`
            });

            // 2. Create OrderItems
            const orderItemsData = cartItems.map(item => ({
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: products[item.product_id].price,
                product_name: products[item.product_id].name,
                unit: products[item.product_id].unit
            }));
            await OrderItem.bulkCreate(orderItemsData);

            // 3. Clear Cart
            const itemIdsToDelete = cartItems.map(item => item.id);
            for (const id of itemIdsToDelete) {
                await CartItem.delete(id);
            }

            // 4. Update user address if it's new
            if (JSON.stringify(user.address) !== JSON.stringify(address)) {
                await User.updateMyUserData({ address });
            }

            // 5. Redirect to order history
            navigate(createPageUrl("OrderHistory"));

        } catch (error) {
            console.error("Error placing order:", error);
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Loading checkout...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.h1 
                className="text-4xl font-bold text-gray-900 mb-12 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                Secure Checkout
            </motion.h1>
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-8"
                >
                    {/* Shipping Address */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5 text-green-600" />
                                Delivery Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input name="street" placeholder="Street Address" value={address.street} onChange={handleAddressChange} required className="h-12" />
                            <Input name="city" placeholder="City" value={address.city} onChange={handleAddressChange} required className="h-12" />
                            <div className="flex gap-4">
                                <Input name="state" placeholder="State" value={address.state} onChange={handleAddressChange} required className="h-12" />
                                <Input name="zip" placeholder="ZIP Code" value={address.zip} onChange={handleAddressChange} required className="h-12" />
                            </div>
                            <Input name="country" placeholder="Country" value={address.country} onChange={handleAddressChange} required className="h-12" />
                        </CardContent>
                    </Card>

                    {/* Payment Method Selection */}
                    <Card className="shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-green-600" />
                                Payment Method
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Select value={payment.method} onValueChange={(value) => setPayment({...payment, method: value})}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="card">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            Credit/Debit Card
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="razorpay">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            Razorpay (UPI/Wallet)
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {payment.method === 'card' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div className="relative">
                                        <Input name="cardNumber" placeholder="Card Number" value={payment.cardNumber} onChange={handlePaymentChange} required className="h-12 pr-12" />
                                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                    </div>
                                    <div className="flex gap-4">
                                        <Input name="expiry" placeholder="MM/YY" value={payment.expiry} onChange={handlePaymentChange} required className="h-12" />
                                        <Input name="cvv" placeholder="CVV" value={payment.cvv} onChange={handlePaymentChange} required className="h-12" />
                                    </div>
                                </motion.div>
                            )}

                            {payment.method === 'razorpay' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-blue-50 p-4 rounded-lg"
                                >
                                    <p className="text-sm text-blue-800">
                                        You'll be redirected to Razorpay to complete your payment securely using UPI, wallets, or cards.
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Order Summary */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card className="sticky top-24 shadow-lg border-0">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mb-6">
                                {cartItems.map(item => (
                                    <motion.div 
                                        key={item.id} 
                                        className="flex items-center justify-between"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={products[item.product_id]?.image_url} 
                                                alt={products[item.product_id]?.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <div>
                                                <p className="font-medium text-sm">{products[item.product_id]?.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold">₹{(products[item.product_id]?.price * item.quantity).toFixed(2)}</span>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Taxes</span><span>₹{tax.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-xl border-t pt-3"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button type="submit" size="lg" className="w-full mt-8 bg-green-600 hover:bg-green-700 h-14 text-lg font-semibold" disabled={placingOrder}>
                                    <Lock className="w-5 h-5 mr-2"/>
                                    {placingOrder ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </form>
        </div>
    );
}
