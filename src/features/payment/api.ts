import axios from '../../shared/api/axios';
import { Payment, PaginatedResponse } from '../../shared/types';

export const paymentApi = {
    getPayments: async (userId: number): Promise<PaginatedResponse<Payment> | Payment[]> => {
        const response = await axios.get(`/api/payments?userId=${userId}`);
        return response.data;
    },
    
    getPaymentById: async (paymentId: number): Promise<Payment> => {
        const response = await axios.get(`/api/payments/${paymentId}`);
        return response.data;
    },
    
    createPayment: async (orderId: number): Promise<Payment> => {
        const response = await axios.post(`/api/payments`, { orderId });
        return response.data;
    },
    
    updatePaymentStatus: async (paymentId: number, status: 'COMPLETED' | 'FAILED'): Promise<Payment> => {
        const response = await axios.put(`/api/payments/${paymentId}/status`, { status });
        return response.data;
    },
    
    getPaymentsFromConfirmedOrders: async (userId: number): Promise<Payment[]> => {
        const response = await axios.get(`/api/payments/confirmed-orders?userId=${userId}`);
        return response.data;
    }
};
