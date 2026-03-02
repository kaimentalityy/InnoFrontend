import React, { useState, useEffect } from 'react';
import { orderApi } from './api';
import { Button } from '../../shared/ui/Button';
import { Order, CreateOrderRequest } from '../../shared/types';
import axios from '../../shared/api/axios';

export const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [showCreateItem, setShowCreateItem] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '' });
    const [creatingItem, setCreatingItem] = useState(false);
    const user = (() => {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                console.warn('No user data found in localStorage');
                return {};
            }
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user data:', parsedUser);
            if (!parsedUser.id) {
                console.warn('User ID not found in user data:', parsedUser);
            }
            return parsedUser;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return {};
        }
    })();

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
            console.log('Current token:', localStorage.getItem('token'));
            const data = await orderApi.getItems();
            console.log('Raw items data received:', data);
            const itemsArray = Array.isArray(data) ? data : data.content;
            console.log('Processed items array:', itemsArray);
            console.log('Items array length:', itemsArray?.length);
            setItems(itemsArray);
        } catch (err: any) {
            console.error('Failed to fetch items:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            console.error('Full error object:', err);
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

        if (!user.id) {
            alert('User ID not found. Please log in again.');
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

    const handleCreateItem = async () => {
        if (!newItem.name.trim() || !newItem.price.trim()) {
            alert('Please fill in all fields');
            return;
        }

        const price = parseFloat(newItem.price);
        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        setCreatingItem(true);
        try {
            const itemData = {
                name: newItem.name.trim(),
                price: price
            };

            console.log('Creating item:', itemData);
            const response = await orderApi.createItem(itemData);
            console.log('Item creation response:', response);

            setNewItem({ name: '', price: '' });
            setShowCreateItem(false);
            fetchItems();

            alert('Item created successfully!');
        } catch (err: any) {
            console.error('Failed to create item:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);

            alert(`Failed to create item: ${err.response?.data?.message || err.message}`);
        } finally {
            setCreatingItem(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-secondary mb-4">My Orders</h2>

            {/* Available Items Section */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Available Items</h5>
                    <div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={fetchItems}
                            disabled={loadingItems}
                            className="me-2"
                        >
                            {loadingItems ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowCreateItem(true)}
                        >
                            Create Item
                        </Button>
                    </div>
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

            {/* Create Item Modal */}
            {showCreateItem && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Item</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCreateItem(false)}
                                    disabled={creatingItem}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="itemName" className="form-label">Item Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="itemName"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter item name"
                                        disabled={creatingItem}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="itemPrice" className="form-label">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-control"
                                        id="itemPrice"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="Enter price"
                                        disabled={creatingItem}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateItem(false)}
                                    disabled={creatingItem}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateItem}
                                    disabled={creatingItem}
                                >
                                    {creatingItem ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Item'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
