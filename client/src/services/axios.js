// client/src/services/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://edutalks.onrender.com/api', // Update this if backend is hosted
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
