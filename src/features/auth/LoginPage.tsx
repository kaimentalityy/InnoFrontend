import React, { useState } from 'react';
import { authApi, LoginCredentials, RegisterData, parseJwt } from './api';
import { userApi } from '../user/api';
import axios from '../../shared/api/axios';

interface LoginPageProps {
    onLoginSuccess: (user: any) => void;
}


export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [form, setForm] = useState({
        email: '',
        password: '',
        name: '',
        surname: '',
        birthDate: '',
    });

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (isLogin) {
                const credentials: LoginCredentials = {
                    email: form.email,
                    password: form.password,
                };
                const tokenData = await authApi.login(credentials);

                const claims = parseJwt(tokenData.access_token);

                const user = {
                    id: claims.sub,
                    email: claims.email || claims.sub || form.email,
                    name: claims.given_name || '',
                    surname: claims.family_name || '',
                    roles: claims.realm_access?.roles || [],
                };

                try {
                    const response = await axios.get(`/api/users/email/${user.email}`);
                    const userData = response.data;
                    console.log('Fetched user data from backend:', userData);
                } catch (error) {
                    console.warn('Could not fetch user data from backend, using UUID:', error);
                }

                localStorage.setItem('token', tokenData.access_token);
                localStorage.setItem('refresh_token', tokenData.refresh_token);
                localStorage.setItem('user', JSON.stringify(user));

                onLoginSuccess(user);

            } else {
                const registerData: RegisterData = {
                    email: form.email,
                    password: form.password,
                    name: form.name,
                    surname: form.surname,
                    birthDate: form.birthDate,
                };

                console.log('[Register] Calling authApi.register...');
                const result = await authApi.register(registerData);
                console.log('[Register] SUCCESS - result:', result);

                setError('');
                setSuccessMessage('Registration successful! Please sign in with your new account.');
                setIsLogin(true);
                return;
            }
        } catch (err: any) {
            console.error('[Register] CAUGHT ERROR:', err);
            console.error('[Register] err.message:', err?.message);
            console.error('[Register] err.response:', err?.response);
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                }}
            >
                {/* Logo / Title */}
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            marginBottom: '16px',
                            fontSize: '24px',
                        }}
                    >
                        🛒
                    </div>
                    <h1
                        style={{
                            color: '#fff',
                            fontSize: '28px',
                            fontWeight: '700',
                            margin: 0,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', fontSize: '14px' }}>
                        {isLogin ? 'Sign in to your INNO SHOP account' : 'Join INNO SHOP today'}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div
                    style={{
                        display: 'flex',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        padding: '4px',
                        marginBottom: '28px',
                    }}
                >
                    {['Sign In', 'Register'].map((tab, i) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => { setIsLogin(i === 0); setError(''); setSuccessMessage(''); }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: isLogin === (i === 0)
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'transparent',
                                color: isLogin === (i === 0) ? '#fff' : 'rgba(255,255,255,0.5)',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email */}
                    <InputField
                        label="Email"
                        type="email"
                        id="auth-email"
                        value={form.email}
                        onChange={handleChange('email')}
                        placeholder="you@example.com"
                        required
                    />

                    {/* Password */}
                    <InputField
                        label="Password"
                        type="password"
                        id="auth-password"
                        value={form.password}
                        onChange={handleChange('password')}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                    />

                    {/* Register-only fields */}
                    {!isLogin && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <InputField
                                    label="First Name"
                                    type="text"
                                    id="auth-name"
                                    value={form.name}
                                    onChange={handleChange('name')}
                                    placeholder="John"
                                    required
                                />
                                <InputField
                                    label="Last Name"
                                    type="text"
                                    id="auth-surname"
                                    value={form.surname}
                                    onChange={handleChange('surname')}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                            <InputField
                                label="Date of Birth"
                                type="date"
                                id="auth-birthdate"
                                value={form.birthDate}
                                onChange={handleChange('birthDate')}
                                required
                            />
                        </>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div
                            style={{
                                background: 'rgba(34,197,94,0.15)',
                                border: '1px solid rgba(34,197,94,0.4)',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                color: '#86efac',
                                fontSize: '13px',
                                marginBottom: '20px',
                            }}
                        >
                            ✅ {successMessage}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div
                            style={{
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: '10px',
                                padding: '12px 16px',
                                color: '#fca5a5',
                                fontSize: '13px',
                                marginBottom: '20px',
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        id="auth-submit"
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: 'none',
                            borderRadius: '12px',
                            background: loading
                                ? 'rgba(99,102,241,0.5)'
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            letterSpacing: '0.3px',
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff',
                                        animation: 'spin 0.7s linear infinite',
                                        display: 'inline-block',
                                    }}
                                />
                                {isLogin ? 'Signing in...' : 'Creating account...'}
                            </span>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>

                    {isLogin && (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                margin: '20px 0',
                            }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
                                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>or</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.12)' }} />
                            </div>
                            <button
                                id="auth-google"
                                type="button"
                                onClick={() => authApi.loginWithGoogle()}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#fff',
                                    fontWeight: '600',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    transition: 'background 0.2s, border-color 0.2s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.11)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                            >
                                <svg width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
                                    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
                                    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
                                    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
                                </svg>
                                Continue with Google
                            </button>
                        </>
                    )}

                    {/* Switch mode link */}
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginTop: '20px' }}>
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#a78bfa',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontSize: '13px',
                                padding: 0,
                            }}
                        >
                            {isLogin ? 'Register' : 'Sign in'}
                        </button>
                    </p>
                </form>

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                    input:focus { outline: none; }
                `}</style>
            </div>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    type: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
    label, type, id, value, onChange, placeholder, required, minLength,
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{ marginBottom: '16px' }}>
            <label
                htmlFor={id}
                style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    fontWeight: '500',
                    marginBottom: '6px',
                }}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${focused ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
                    background: 'rgba(255,255,255,0.07)',
                    color: '#fff',
                    fontSize: '14px',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
                    boxSizing: 'border-box',
                }}
            />
        </div>
    );
};
