
import { Badge } from './Components/ui/badge';
import { Card } from './Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Components/ui/table';
import { Order } from './Entities/Order';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AdminGuard from '../Components/AdminGuard';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const ordersData = await Order.list('-created_date');
            setOrders(ordersData);
        } catch (error) {
            toast.error("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await Order.update(orderId, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success("Order status updated.");
        } catch (error) {
            toast.error("Failed to update order status.");
        }
    };

    const statusOptions = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

    return (
        <AdminGuard>
            <div className="p-4 sm:p-8">
                <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan="5" className="text-center">Loading orders...</TableCell></TableRow>
                            ) : (
                                orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                                        <TableCell>{order.user_email}</TableCell>
                                        <TableCell>{format(new Date(order.created_date), 'PP')}</TableCell>
                                        <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Select value={order.status} onValueChange={(value) => handleStatusChange(order.id, value)}>
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map(status => (
                                                        <SelectItem key={status} value={status}>
                                                            <Badge variant={status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{status}</Badge>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AdminGuard>
    );
}
