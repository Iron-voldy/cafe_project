// axios api service configuration
import axios from 'axios';

// create axios instance with base url
const API = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' }
});

// request interceptor to add auth token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
