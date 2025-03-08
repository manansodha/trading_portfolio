// frontend/src/services/api.js
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001';


export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Registration Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};


export const uploadTrades = (file, user) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user?.username || '');
    return axios.post(`${API_BASE_URL}/api/upload/trades`, formData);
};

export const uploadDividends = (file, user) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user?.username || '');
    return axios.post(`${API_BASE_URL}/api/upload/dividends`, formData);
};

export const getPortfolio = async (username) => {
    try {
        if (!username) throw new Error("Username is required");
        const response = await axios.get(`${API_BASE_URL}/api/portfolio`, { params: { username } });
        return response.data;  
    } catch (error) {
        console.error("Error fetching portfolio:", error.response?.data || error.message);
        throw error;
    }
};

export const getStockDetails = async (symbol, username) => {
  try {
      // const response = await axios.get(`${API_BASE_URL}/api/portfolio/${symbol}`, { params: { username } });
      return axios.get(`${API_BASE_URL}/api/portfolio/${symbol}?username=${username}`);
  } catch (error) {
      console.error("Error fetching stock details:", error);
      throw error;
  }
};

export const addTrade = async (tradeData) => {
  try {
    const controller = new AbortController(); 
    const timeoutId = setTimeout(() => controller.abort(), 20000); 

    const response = await axios.post(`${API_BASE_URL}/api/upload/add-trade`, tradeData, {
        headers: { "Content-Type": "application/json" },
        signal: controller.signal, 
    });

    clearTimeout(timeoutId);  

    console.log("Trade added successfully:", response.data);
    alert("Trade added successfully!");
} catch (error) {
    if (axios.isCancel(error)) {
        console.error("Request was canceled (timeout reached)");
    } else {
        console.error("Error adding trade:", error.response?.data || error.message);
    }
    alert("Trade request failed. Check console.");
}
};

export const addStock = async (tradeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/upload/add-stock`, { tradeData });
    return response.data;
  } catch (error) {
    console.error("Error adding stock:", error.response?.data || error.message);
    throw error;
  }
}

export const deleteTrade = async (tradeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/upload/delete-trade`, { tradeData });
    return response.data;
  } catch (error) {
    console.error("Error deleting trade:", error.response?.data || error.message);
    throw error;
  }
}

// Admin API functions
export const changeName = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/change-stock-name`, data);
    return response.data;
  } catch (error) {
    console.error("Error changing stock name:", error.response?.data || error.message);
    throw error;
  }
};

export const stockSplit = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/stock-split`, data);
    return response.data;
  } catch (error) {
    console.error("Error processing stock split:", error.response?.data || error.message);
    throw error;
  }
}

export const bonusIssue = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/bonus-issue`, data);
    return response.data;
  } catch (error) {
    console.error("Error processing bonus issue:", error.response?.data || error.message);
    throw error;
  }
}

export { api, setAuthToken };