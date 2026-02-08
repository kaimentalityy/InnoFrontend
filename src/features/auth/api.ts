import axios from '../../shared/api/axios';
import { LoginCredentials, RegisterData, UpdateUserRequest, User } from '../../shared/types';

export const authApi = {
    login: async (credentials: LoginCredentials) => {
        const response = await axios.post('/api/auth/login', credentials);
        return response.data;
    },
    register: async (userData: RegisterData) => {
        const response = await axios.post('/api/auth/register', userData);
        return response.data;
    },
    updateUser: async (userData: UpdateUserRequest): Promise<User> => {
        const response = await axios.put('/api/auth/update', userData);
        return response.data;
    },
};
