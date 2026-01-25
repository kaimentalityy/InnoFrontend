import React, { useState, useEffect } from 'react';
import { orderApi } from './api';
import { Button } from '../../shared/ui/Button';
import { Order } from '../../shared/types';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchOrders = async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const data = await orderApi.getOrders(user.id);
            setOrders(Array.isArray(data) ? data : data.content);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await orderApi.deleteOrder(orderId);
            fetchOrders();
        } catch (err) {
            alert('Failed to delete order');
        }
    };

    const handlePayOrder = async (order: any) => {
        try {
            await orderApi.updateOrder(order.id, { ...order, status: 'CONFIRMED' });
            fetchOrders();
        } catch (err) {
            alert('Failed to process payment');
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-secondary mb-4">My Orders</h2>
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <span className={`badge ${order.status === 'CONFIRMED' ? 'bg-success' : 'bg-info'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.createdDate || Date.now()).toLocaleDateString()}</td>
                                    <td>
                                        <div className="btn-group btn-group-sm">
                                            {order.status === 'PAYMENT_PENDING' && (
                                                <Button variant="success" size="sm" onClick={() => handlePayOrder(order)}>Pay</Button>
                                            )}
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteOrder(order.id)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-muted">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
