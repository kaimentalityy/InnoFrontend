import React, { useState, useEffect } from 'react';
import { paymentApi } from './api';
import { orderApi } from '../order/api';
import { Payment } from '../../shared/types';
import { Button } from '../../shared/ui/Button';

export const PaymentPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchPayments = async () => {
        console.log('User from localStorage:', user);
        if (!user.id) {
            console.log('No user ID found');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            try {
                console.log('Trying payment API for user:', user.id);
                const paymentData = await paymentApi.getPaymentsFromConfirmedOrders(user.id);
                console.log('Payment API response:', paymentData);
                const paymentsArray = Array.isArray(paymentData) ? paymentData : [];
                setPayments(paymentsArray);
            } catch (paymentApiError) {
                console.log('Payment API error:', paymentApiError);
                console.log('Payment API not available, falling back to order data');
                console.log('Trying order API for user:', user.id);
                const orderData = await orderApi.getOrders(user.id);
                console.log('Order API response:', orderData);
                const orders = Array.isArray(orderData) ? orderData : orderData.content;
                const confirmedOrders = orders.filter((o: any) => o.status === 'CONFIRMED');
                console.log('Confirmed orders:', confirmedOrders);
                
                let allItems: any[] = [];
                try {
                    const itemsData = await orderApi.getItems();
                    allItems = Array.isArray(itemsData) ? itemsData : itemsData.content;
                    console.log('Available items:', allItems);
                } catch (error) {
                    console.error('Failed to fetch items:', error);
                }
                
                const transformedPayments: Payment[] = confirmedOrders.map((order: any) => {
                    console.log('Processing order:', order);
                    console.log('Order items:', order.items);
                    
                    let amount = 0;
                    if (order.items && order.items.length > 0 && allItems.length > 0) {
                        amount = order.items.reduce((sum: number, orderItem: any) => {
                            const itemId = orderItem.item?.id || orderItem.itemId;
                            const itemDetails = allItems.find((item: any) => item.id === itemId);
                            const itemPrice = itemDetails?.price || 0;
                            const quantity = orderItem.quantity || 1;
                            console.log(`Item ${itemId}: ${itemDetails?.name || 'Unknown'} - $${itemPrice} x ${quantity} = $${itemPrice * quantity}`);
                            return sum + (itemPrice * quantity);
                        }, 0);
                    }
                    
                    console.log('Final calculated amount for order', order.id, ':', amount);
                    
                    return {
                        id: order.id,
                        orderId: order.id,
                        userId: order.userId,
                        amount: amount,
                        status: 'COMPLETED' as const,
                        paymentDate: order.createdDate,
                        order: order
                    };
                });
                
                console.log('Transformed payments:', transformedPayments);
                setPayments(transformedPayments);
            }
        } catch (err) {
            console.error('Failed to fetch payments:', err);
            setError('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };
    
    const refreshPayments = async () => {
        setRefreshing(true);
        await fetchPayments();
        setRefreshing(false);
    };
    
    useEffect(() => {
        fetchPayments();
        
        const interval = setInterval(fetchPayments, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <span className="badge bg-success">PAID</span>;
            case 'PENDING':
                return <span className="badge bg-warning">PENDING</span>;
            case 'FAILED':
                return <span className="badge bg-danger">FAILED</span>;
            default:
                return <span className="badge bg-secondary">{status}</span>;
        }
    };
    
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-secondary mb-0">Payment History</h2>
                <Button 
                    variant="outline" 
                    onClick={refreshPayments}
                    disabled={refreshing}
                    className="d-flex align-items-center gap-2"
                >
                    {refreshing ? (
                        <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-arrow-clockwise"></i>
                            Refresh
                        </>
                    )}
                </Button>
            </div>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading payment history...</p>
                        </div>
                    ) : (
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Order ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment Date</th>
                                    <th>Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>#{payment.id}</td>
                                        <td>#{payment.orderId}</td>
                                        <td className="fw-bold text-success">
                                            ${payment.amount.toFixed(2)}
                                        </td>
                                        <td>
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td>{new Date(payment.paymentDate).toLocaleString()}</td>
                                        <td>
                                            {payment.order?.items ? (
                                                <span className="text-muted">
                                                    {payment.order.items.length} item{payment.order.items.length !== 1 ? 's' : ''}
                                                </span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">
                                            No payments found. Payments will appear here when orders are confirmed.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
