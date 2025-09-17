import React, { useState, useEffect } from 'react';
import User from '../Entities/User';
import { Order } from '../Entities/Order';
import { OrderItem } from '../Entities/OrderItem';
import { Product } from '../Entities/Product';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../Components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../Components/ui/accordion';
import { Badge } from '../Components/ui/badge';
import { format } from 'date-fns';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const user = await User.me();
                const userOrders = await Order.filter({ user_email: user.email }, '-created_date');
                setOrders(userOrders);

                if (userOrders.length > 0) {
                    const orderIds = userOrders.map(o => o.id);
                    const allItems = await OrderItem.filter({ order_id: { $in: orderIds } });
                    
                    const itemsByOrder = allItems.reduce((acc, item) => {
                        if (!acc[item.order_id]) acc[item.order_id] = [];
                        acc[item.order_id].push(item);
                        return acc;
                    }, {});
                    setOrderItems(itemsByOrder);
                    
                    const productIds = allItems.map(item => item.product_id);
                    const productsData = await Product.filter({ id: { $in: productIds }});
                    const productsMap = productsData.reduce((map, p) => ({...map, [p.id]: p}), {});
                    setProducts(productsMap);
                }
            } catch (error) {
                console.error("Failed to fetch order history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderHistory();
    }, []);

    if (loading) {
        return <div>Loading order history...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
            {orders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {orders.map(order => (
                        <Card key={order.id}>
                            <AccordionItem value={order.id} className="border-b-0">
                                <AccordionTrigger className="p-6">
                                    <div className="flex justify-between w-full pr-4">
                                        <div>
                                            <p className="font-semibold">Order #{order.id.slice(-6)}</p>
                                            <p className="text-sm text-gray-500">Placed on {format(new Date(order.created_date), 'MMMM d, yyyy')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">₹{order.total_amount.toFixed(2)}</p>
                                            <Badge>{order.status}</Badge>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-6 pt-0">
                                    <h4 className="font-semibold mb-2">Items:</h4>
                                    <div className="space-y-2">
                                        {orderItems[order.id]?.map(item => {
                                            const product = products[item.product_id];
                                            return (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <img src={product?.image_url} alt={item.product_name} className="w-12 h-12 rounded-md object-cover"/>
                                                    <div>
                                                        <p>{item.product_name}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        )})}
                                    </div>
                                    <div className="border-t mt-4 pt-4">
                                        <h4 className="font-semibold mb-2">Shipping To:</h4>
                                        <p className="text-sm text-gray-600">
                                            {order.shipping_address.street}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
