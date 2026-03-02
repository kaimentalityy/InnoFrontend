import React, { useEffect, useState } from 'react';
import { authApi, parseJwt } from './api';
import axios from '../../shared/api/axios';


/**
 * This page lives at /oauth/callback.
 * Keycloak (and Google Cloud Console) must have this URL registered as a valid redirect URI.
 *
 * Flow:
 *  1. User clicks "Continue with Google" on LoginPage.
 *  2. Browser redirects to Keycloak → Google.
 *  3. Google redirects back to Keycloak.
 *  4. Keycloak redirects to THIS page with ?code=...&state=...
 *  5. We exchange the code for tokens, store them, and navigate to /orders.
 */
export const OAuthCallbackPage: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
            setErrorMsg(errorDescription || error);
            setStatus('error');
            return;
        }

        if (!code) {
            setErrorMsg('No authorization code received from Google.');
            setStatus('error');
            return;
        }

        const savedState = sessionStorage.getItem('oauth_state');
        sessionStorage.removeItem('oauth_state');
        if (state !== savedState) {
            setErrorMsg('Security check failed (state mismatch). Please try again.');
            setStatus('error');
            return;
        }

        authApi
            .exchangeCodeForToken(code)
            .then(tokenData => {
                const claims = parseJwt(tokenData.access_token);

                const user: any = {
                    email: claims.email || claims.sub || '',
                    name: claims.given_name || '',
                    surname: claims.family_name || '',
                    roles: claims.realm_access?.roles || [],
                    id: claims.sub
                };

                axios.get(`/api/users/email/${user.email}`)
                    .then((response: any) => {
                        const userData = response.data;
                        user.id = userData.id;
                        console.log('Fetched user data from backend:', userData);

                        localStorage.setItem('token', tokenData.access_token);
                        localStorage.setItem('refresh_token', tokenData.refresh_token);
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.href = '/orders';
                    })
                    .catch((error: any) => {
                        console.warn('Could not fetch user data from backend, using UUID:', error);
                        localStorage.setItem('token', tokenData.access_token);
                        localStorage.setItem('refresh_token', tokenData.refresh_token);
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.href = '/orders';
                    });
            })
            .catch((err: Error) => {
                setErrorMsg(err.message || 'Google login failed. Please try again.');
                setStatus('error');
            });
    }, []);

    if (status === 'loading') {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                color: '#fff',
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#6366f1',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
                    Completing Google sign-in…
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '400px',
                textAlign: 'center',
                color: '#fff',
            }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
                <h2 style={{ margin: '0 0 12px', fontWeight: 700 }}>Sign-in failed</h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: '0 0 24px' }}>
                    {errorMsg}
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{
                        padding: '12px 28px',
                        border: 'none',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};
