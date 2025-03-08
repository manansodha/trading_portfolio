import { useState, useEffect, useContext, createContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Error parsing user data:', error);}
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', credentials);
      if (response.status === 200) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return true;
      }
      console.log(response.data.user);
    } catch (error) {
      console.log(error)
      return false;
      // throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem("token");  
    sessionStorage.clear();    
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

