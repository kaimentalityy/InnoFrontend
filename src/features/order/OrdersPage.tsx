import React, { useState, useEffect } from 'react';
import { orderApi } from './api';
import { Button } from '../../shared/ui/Button';
import { Order, CreateOrderRequest } from '../../shared/types';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
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

    const fetchItems = async () => {
        setLoadingItems(true);
        try {
            console.log('Starting to fetch items...');
            const data = await orderApi.getItems();
            console.log('Raw items data received:', data);
            const itemsArray = Array.isArray(data) ? data : data.content;
            console.log('Processed items array:', itemsArray);
            setItems(itemsArray);
        } catch (err: any) {
            console.error('Failed to fetch items:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
        } finally {
            setLoadingItems(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchItems();
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

    const handleCreateOrder = async (item: any) => {
        const token = localStorage.getItem('token');
        console.log('Current token:', token);
        
        if (!user.id) {
            alert('User not found');
            return;
        }
        
        if (!token) {
            alert('No authentication token found');
            return;
        }
        
        console.log('Creating order with item:', item);
        console.log('User ID:', user.id);
        
        try {
            const orderData: CreateOrderRequest = {
                userId: user.id,
                status: 'PAYMENT_PENDING',
                items: [{
                    itemId: item.id,
                    quantity: 1
                }]
            };
            
            console.log('Order data to send:', orderData);
            const response = await orderApi.createOrder(orderData);
            console.log('Order creation response:', response);
            
            fetchOrders();
        } catch (err: any) {
            console.error('Failed to create order:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            
            if (err.response?.status === 403) {
                alert('Failed to create order: Access denied. Your token may be expired or you may not have permission to create orders.');
            } else {
                alert(`Failed to create order: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-secondary mb-4">My Orders</h2>
            
            {/* Available Items Section */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Available Items</h5>
                </div>
                <div className="card-body p-0">
                    {loadingItems ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading items...</span>
                            </div>
                        </div>
                    ) : (
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td>#{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>${item.price}</td>
                                        <td>
                                            <Button 
                                                variant="primary" 
                                                size="sm" 
                                                onClick={() => handleCreateOrder(item)}
                                            >
                                                Order
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-4 text-muted">No items available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Orders Section */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Your Orders</h5>
                </div>
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
