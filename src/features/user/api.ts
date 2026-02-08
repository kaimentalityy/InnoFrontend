import axios from '../../shared/api/axios';
import { User } from '../../shared/types';

export const userApi = {
    getProfile: async (): Promise<User> => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!userData.id) {
            throw new Error('User ID not found in localStorage');
        }
        
        const response = await axios.get(`/api/users/${userData.id}`);
        
        return response.data;
    },

    updateProfile: async (userId: number, userData: Partial<User>): Promise<User> => {
        const response = await axios.put(`/api/users/${userId}`, userData);
        
        return response.data;
    },
};
