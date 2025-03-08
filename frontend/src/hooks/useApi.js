import { useState} from 'react';
import axios from 'axios';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const getTradingAccounts = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/accounts/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch accounts');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPortfolioMetrics = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/portfolio/${userId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch metrics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPortfolioHistory = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/portfolio/${userId}/history`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getTradingAccounts,
    getPortfolioMetrics,
    getPortfolioHistory
  };
};

export {useApi};