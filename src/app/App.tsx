import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../features/auth/api';

export const App: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refresh_token') || '';
        await authApi.logout(refreshToken);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!token) {
        return <Outlet />;
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
            <nav
                style={{
                    background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
                    padding: '0 24px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    height: '60px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <Link
                    to="/"
                    style={{
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '18px',
                        textDecoration: 'none',
                        letterSpacing: '-0.5px',
                        marginRight: '40px',
                    }}
                >
                    🛒 INNO SHOP
                </Link>

                <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                        { to: '/orders', label: 'Orders' },
                        { to: '/payments', label: 'Payments' },
                        { to: '/profile', label: 'Profile' },
                    ].map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            style={{
                                color: 'rgba(255,255,255,0.7)',
                                textDecoration: 'none',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => {
                                (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                                (e.target as HTMLElement).style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLElement).style.background = 'transparent';
                                (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                        {user?.email || user?.name || 'User'}
                    </span>
                    <button
                        id="logout-btn"
                        onClick={handleLogout}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff',
                            padding: '7px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main>
                <Outlet />
            </main>
        </div>
    );
};
