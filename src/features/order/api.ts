import axios from '../../shared/api/axios';
import { Order, Item, PaginatedResponse } from '../../shared/types';

export const orderApi = {
    getItems: async (): Promise<PaginatedResponse<Item> | Item[]> => {
        const response = await axios.get('/api/items');
        return response.data;
    },
    getOrders: async (userId: number): Promise<PaginatedResponse<Order> | Order[]> => {
        const response = await axios.get(`/api/orders?userId=${userId}`);
        return response.data;
    },
    createOrder: async (orderData: Partial<Order>): Promise<Order> => {
        const response = await axios.post('/api/orders', orderData);
        return response.data;
    },
    updateOrder: async (orderId: number, orderData: Partial<Order>): Promise<Order> => {
        const response = await axios.put(`/api/orders/${orderId}`, orderData);
        return response.data;
    },
    deleteOrder: async (orderId: number): Promise<void> => {
        await axios.delete(`/api/orders/${orderId}`);
    },
};
