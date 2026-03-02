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

/** Decode a JWT payload without verifying the signature (client-side display only). */
export function parseJwt(token: string): Record<string, any> {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return {};
    }
}

export const authApi = {
    /**
     * Login directly against Keycloak's token endpoint using Resource Owner
     * Password Credentials grant. Returns raw Keycloak token response.
     */
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

    /**
     * Register directly against the User Service, which creates the Keycloak
     * user and the local DB profile in one step.
     */
    register: async (data: RegisterData): Promise<RegisterResponse> => {
        try {
            console.log('[api.register] Sending request...');
            const response = await axios.post('/api/users/register', {
                email: data.email,
                password: data.password,
                name: data.name,
                surname: data.surname,
                birthDate: data.birthDate,
            });
            console.log('[api.register] Response status:', response.status, 'data:', response.data);
            return response.data;
        } catch (err: any) {
            console.error('[api.register] Axios error - status:', err?.response?.status, 'data:', err?.response?.data, 'message:', err?.message);
            if (err.response?.status === 409) {
                throw new Error('An account with this email already exists. Please sign in instead.');
            }
            throw new Error(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    },

    /**
     * Fetch a new access token using a refresh token.
     */
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

    /**
     * Logout from Keycloak session.
     */
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
        ).catch(() => { }); // Best-effort
    },

    /**
     * Redirect the browser to Keycloak's authorization endpoint.
     * Keycloak will show a "Login with Google" button because you've
     * configured the Google identity provider there.
     *
     * A PKCE `state` value is saved to sessionStorage so the callback
     * page can verify the response is legitimate.
     */
    loginWithGoogle: (): void => {
        const state = crypto.randomUUID();
        sessionStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: KEYCLOAK_CLIENT_ID,
            redirect_uri: OAUTH_REDIRECT_URI,
            scope: 'openid email profile',
            state,
            kc_idp_hint: GOOGLE_IDP_ALIAS,
        });

        window.location.href =
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?${params}`;
    },

    /**
     * Exchange the authorization code (from the OAuth callback URL) for tokens.
     * Call this from your /oauth/callback route after verifying `state`.
     */
    exchangeCodeForToken: async (code: string): Promise<KeycloakTokenResponse> => {
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', KEYCLOAK_CLIENT_ID);
        if (KEYCLOAK_CLIENT_SECRET) {
            params.append('client_secret', KEYCLOAK_CLIENT_SECRET);
        }
        params.append('code', code);
        params.append('redirect_uri', OAUTH_REDIRECT_URI);

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
            const msg = (err as any)?.error_description || 'Google login failed';
            throw new Error(msg);
        }

        return response.json();
    },
};
