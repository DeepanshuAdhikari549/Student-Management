import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.startsWith('192.168.');

    if (isLocal) {
        return 'http://localhost:5000/api';
    }
    return 'https://student-management-1-s6jd.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000, // 15s timeout for all requests
});

// Add a request interceptor to include the auth token
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;
  
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export default API;
