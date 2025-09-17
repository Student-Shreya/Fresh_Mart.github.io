import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { CartItem } from "../Entities/CartItem";
import { Product } from "../Entities/Product";
import User from "../Entities/User";
import { createPageUrl } from "../utils";
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadCart = React.useCallback(async () => {
        setLoading(true);
        try {
            const user = await User.me();
            const items = await CartItem.filter({ user_email: user.email });
            setCartItems(items);

            if (items.length > 0) {
                const productIds = items.map(item => item.product_id);
                const productsData = await Product.filter({ id: { $in: productIds } });
                const productsMap = productsData.reduce((map, product) => {
                    map[product.id] = product;
                    return map;
                }, {});
                setProducts(productsMap);
            }
        } catch (error) {
            // If not logged in, redirect to login
            await User.loginWithRedirect(window.location.href);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            await CartItem.delete(itemId);
        } else {
            await CartItem.update(itemId, { quantity: newQuantity });
        }
        loadCart();
        window.dispatchEvent(new Event('cartUpdated')); // To update layout count
    };

    const removeItem = async (itemId) => {
        await CartItem.delete(itemId);
        loadCart();
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const subtotal = cartItems.reduce((sum, item) => {
        const product = products[item.product_id];
        return sum + (product?.price || 0) * item.quantity;
    }, 0);

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    if (loading) {
        return <div className="text-center py-20">Loading your cart...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
            {cartItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4"/>
                    <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-4">Looks like you haven't added anything to your cart yet.</p>
                    <Link to={createPageUrl("Products")}>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <ArrowLeft className="w-4 h-4 mr-2"/>
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map(item => {
                            const product = products[item.product_id];
                            if (!product) return null;
                            return (
                                <Card key={item.id}>
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-md"/>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{product.name}</h3>
                                            <p className="text-sm text-gray-500">{product.brand}</p>
                                            <p className="text-lg font-bold mt-1">₹{product.price?.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center border rounded-lg">
                                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-4 h-4"/></Button>
                                            <span className="w-12 text-center">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-4 h-4"/></Button>
                                        </div>
                                        <p className="font-bold w-24 text-right">₹{(product.price * item.quantity).toFixed(2)}</p>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-5 h-5 text-red-500"/></Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Est. Taxes</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(createPageUrl('Checkout'))}>
                                    Proceed to Checkout
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
