import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.10:8000/api/auth';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                        refresh: refreshToken,
                    });

                    localStorage.setItem('access_token', response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export const authService = {
    // Login with username and password
    login: async (username, password) => {
        const response = await api.post('/login/', { username, password });
        return response.data;
    },

    // Setup 2FA - Get QR Code
    setup2FA: async () => {
        const response = await api.get('/setup-2fa/');
        return response.data;
    },

    // Verify 2FA Setup
    verify2FASetup: async (otpCode) => {
        const response = await api.post('/setup-2fa/', { otp_code: otpCode });
        return response.data;
    },

    // Verify OTP during login
    verifyOTP: async (otpCode) => {
        const response = await api.post('/verify-2fa/', { otp_code: otpCode });
        return response.data;
    },

    // Get user devices
    getDevices: async () => {
        const response = await api.get('/devices/');
        return response.data;
    },

    // Delete a device
    deleteDevice: async (deviceId) => {
        const response = await api.delete(`/devices/${deviceId}/`);
        return response.data;
    },

    // Initiate Push Auth
    initiatePushAuth: async () => {
        const response = await api.post('/push-auth/initiate/');
        return response.data;
    },

    // Check Push Auth Status
    checkPushAuthStatus: async (requestId) => {
        const response = await api.get(`/push-auth/status/${requestId}/`);
        return response.data;
    },

    // Respond to Push Auth (Called from Mobile, but keeping it here for completeness if needed)
    respondPushAuth: async (requestId, action) => {
        const response = await api.post('/push-auth/respond/', { request_id: requestId, action });
        return response.data;
    },

    // Get Pending Push Auth (Called from Mobile)
    getPendingPushAuth: async () => {
        const response = await api.get('/push-auth/pending/');
        return response.data;
    },

    // Save tokens
    saveTokens: (tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    },

    // Clear tokens
    logout: () => {
        localStorage.clear();
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    },
};

export default api;
