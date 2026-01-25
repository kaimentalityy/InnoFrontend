import React, { useState } from 'react';
import { authApi } from './api';
import { Button } from '../../shared/ui/Button';

interface LoginPageProps {
    onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
        name: '',
        surname: '',
        email: '',
        birthDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let data;
            if (isLogin) {
                data = await authApi.login({ username: credentials.username, password: credentials.password });
            } else {
                data = await authApi.register(credentials);
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            onLoginSuccess(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px', border: 'none' }}>
                <h2 className="text-center mb-4 text-primary">{isLogin ? 'Login' : 'Register'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <>
                            <div className="row">
                                <div className="col mb-3">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="form-control" value={credentials.name} onChange={(e) => setCredentials({ ...credentials, name: e.target.value })} required />
                                </div>
                                <div className="col mb-3">
                                    <label className="form-label">Surname</label>
                                    <input type="text" className="form-control" value={credentials.surname} onChange={(e) => setCredentials({ ...credentials, surname: e.target.value })} required />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" value={credentials.email} onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Birth Date</label>
                                <input type="date" className="form-control" value={credentials.birthDate} onChange={(e) => setCredentials({ ...credentials, birthDate: e.target.value })} required />
                            </div>
                        </>
                    )}
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                    <Button type="submit" className="w-100 mb-3" isLoading={loading}>
                        {isLogin ? 'Sign In' : 'Register'}
                    </Button>
                    <p className="text-center small">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <a href="#" onClick={() => setIsLogin(!isLogin)} className="text-decoration-none fw-bold">
                            {isLogin ? 'Register' : 'Login'}
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};
