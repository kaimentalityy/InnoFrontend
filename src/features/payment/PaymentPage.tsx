import React, { useState, useEffect } from 'react';
import { orderApi } from '../order/api';
import { Order } from '../../shared/types';

export const PaymentPage: React.FC = () => {
    const [payments, setPayments] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user.id) return;
            setLoading(true);
            try {
                const data = await orderApi.getOrders(user.id);
                const orders = Array.isArray(data) ? data : data.content;
                const confirmedOrders = orders.filter((o: Order) => o.status === 'CONFIRMED');
                setPayments(confirmedOrders);
            } catch (err) {
                console.error('Failed to fetch payments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="text-secondary mb-4">Payment History</h2>
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Payment ID</th>
                                <th>Order ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((order) => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>#{order.id}</td>
                                    <td className="fw-bold text-success">
                                        ${order.items?.reduce((sum: number, item: any) => sum + (item.price || 0), 0) || 0}
                                    </td>
                                    <td>
                                        <span className="badge bg-success">PAID</span>
                                    </td>
                                    <td>{new Date(order.createdDate || Date.now()).toLocaleString()}</td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-muted">No payments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
