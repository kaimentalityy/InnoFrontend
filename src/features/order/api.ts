import axios from '../../shared/api/axios';
import { Order, Item, CreateOrderRequest, PaginatedResponse } from '../../shared/types';

export const orderApi = {
    getItems: async (): Promise<PaginatedResponse<Item> | Item[]> => {
        console.log('Making GET request to /api/items');
        const response = await axios.get('/api/items');
        console.log('GET /api/items response:', response);
        console.log('Response data:', response.data);
        return response.data;
    },
    createItem: async (itemData: Omit<Item, 'id'>): Promise<Item> => {
        const response = await axios.post('/api/items', itemData);
        return response.data;
    },
    getOrders: async (userId: string): Promise<PaginatedResponse<Order> | Order[]> => {
        const response = await axios.get(`/api/orders?userId=${userId}`);
        return response.data;
    },
    createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
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
