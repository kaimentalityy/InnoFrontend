import axios from '../../shared/api/axios';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8088';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'innowise-realm';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'innowise-client';
const KEYCLOAK_CLIENT_SECRET = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET || '';
const GOOGLE_IDP_ALIAS = import.meta.env.VITE_GOOGLE_IDP_ALIAS || 'google';

const OAUTH_REDIRECT_URI = `${window.location.origin}/oauth/callback`;

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    surname: string;
    birthDate: string;
}

export interface KeycloakTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    session_state: string;
    scope: string;
}

export interface RegisterResponse {
    id: string;
    email: string;
    name: string;
    surname: string;
    birthDate: string;
}

export function parseJwt(token: string): Record<string, any> {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return {};
    }
}

function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export const authApi = {
    redirectToLogin: async (): Promise<void> => {
        const state = crypto.randomUUID();
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);

        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('pkce_verifier', verifier);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: KEYCLOAK_CLIENT_ID,
            redirect_uri: OAUTH_REDIRECT_URI,
            scope: 'openid email profile',
            state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
        });

        window.location.href =
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?${params}`;
    },

    login: async (credentials: LoginCredentials): Promise<KeycloakTokenResponse> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'password');
        params.append('client_id', KEYCLOAK_CLIENT_ID);
        if (KEYCLOAK_CLIENT_SECRET) {
            params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
        }
        params.append('username', credentials.email);
        params.append('password', credentials.password);

        const response = await fetch(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg = (err as any)?.error_description || 'Invalid credentials';
            throw new Error(msg);
        }

        return response.json();
    },

    register: async (data: RegisterData): Promise<RegisterResponse> => {
        try {
            const response = await axios.post('/api/users/register', {
                email: data.email,
                password: data.password,
                name: data.name,
                surname: data.surname,
                birthDate: data.birthDate,
            });
            return response.data;
        } catch (err: any) {
            if (err.response?.status === 409) {
                throw new Error('An account with this email already exists. Please sign in instead.');
            }
            throw new Error(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    },

    refreshToken: async (refreshToken: string): Promise<KeycloakTokenResponse> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', KEYCLOAK_CLIENT_ID);
        if (KEYCLOAK_CLIENT_SECRET) {
            params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
        }
        params.append('refresh_token', refreshToken);

        const response = await fetch(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            }
        );

        if (!response.ok) {
            throw new Error('Session expired, please log in again');
        }

        return response.json();
    },

    logout: async (refreshToken: string): Promise<void> => {
        const params = new URLSearchParams();
        params.append('client_id', KEYCLOAK_CLIENT_ID);
        if (KEYCLOAK_CLIENT_SECRET) {
            params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
        }
        params.append('refresh_token', refreshToken);

        await fetch(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            }
        ).catch(() => { });
    },

    loginWithGoogle: async (): Promise<void> => {
        const state = crypto.randomUUID();
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);

        sessionStorage.setItem('oauth_state', state);
        sessionStorage.setItem('pkce_verifier', verifier);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: KEYCLOAK_CLIENT_ID,
            redirect_uri: OAUTH_REDIRECT_URI,
            scope: 'openid email profile',
            state,
            kc_idp_hint: GOOGLE_IDP_ALIAS,
            code_challenge: challenge,
            code_challenge_method: 'S256',
        });

        window.location.href =
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?${params}`;
    },

    exchangeCodeForToken: async (code: string): Promise<KeycloakTokenResponse> => {
        const verifier = sessionStorage.getItem('pkce_verifier');
        sessionStorage.removeItem('pkce_verifier');

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', KEYCLOAK_CLIENT_ID);
        if (KEYCLOAK_CLIENT_SECRET) {
            params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
        }
        params.append('code', code);
        params.append('redirect_uri', OAUTH_REDIRECT_URI);
        if (verifier) {
            params.append('code_verifier', verifier);
        }

        const response = await fetch(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const msg = (err as any)?.error_description || 'Login failed';
            throw new Error(msg);
        }

        return response.json();
    },
};
