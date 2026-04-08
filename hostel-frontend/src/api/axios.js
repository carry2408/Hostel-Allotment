import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hostel-allotment-ynbv.onrender.com/api',
});

export const API_BASE_URL = API.defaults.baseURL.replace(/\/api$/, '');

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
