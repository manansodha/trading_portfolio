// frontend/src/services/auth.js
import { api, setAuthToken } from './api';

const auth = {
  login: async (credentials) => {
    try {
      const response = await api.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, credentials);
      setAuthToken(response.token);
      console.log(response);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    setAuthToken(null);
    localStorage.removeItem('token');
  },

  refreshToken: async () => {
    try {
      const response = await api.post('/api/auth/refresh');
      setAuthToken(response.data.token);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }
};

export default auth;