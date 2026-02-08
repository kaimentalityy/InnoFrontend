import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { LoginPage } from '../features/auth/LoginPage';
import { OrdersPage } from '../features/order/OrdersPage';
import { PaymentPage } from '../features/payment/PaymentPage';
import { ProfilePage } from '../features/user/ProfilePage';

const isAuthenticated = () => !!localStorage.getItem('token');

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: isAuthenticated() ? <Navigate to="/orders" /> : <Navigate to="/login" />,
            },
            {
                path: 'login',
                element: <LoginPage onLoginSuccess={() => window.location.href = '/orders'} />,
            },
            {
                path: 'orders',
                element: isAuthenticated() ? <OrdersPage /> : <Navigate to="/login" />,
            },
            {
                path: 'payments',
                element: isAuthenticated() ? <PaymentPage /> : <Navigate to="/login" />,
            },
            {
                path: 'profile',
                element: isAuthenticated() ? <ProfilePage /> : <Navigate to="/login" />,
            },
        ],
    },
]);
