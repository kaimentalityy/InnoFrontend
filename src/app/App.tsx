import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { User } from '../shared/types';

export const App: React.FC = () => {
    const navigate = useNavigate();
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!token) {
        return <Outlet />;
    }

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
                <div className="container">
                    <Link className="navbar-brand fw-bold" to="/">INNO SHOP</Link>
                    <div className="navbar-nav me-auto">
                        <Link className="nav-link" to="/orders">Orders</Link>
                        <Link className="nav-link" to="/payments">Payments</Link>
                        <Link className="nav-link" to="/profile">Profile</Link>
                    </div>
                    <div className="d-flex align-items-center">
                        <span className="text-white me-3 small">Hello, {user?.username}</span>
                        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
};
