import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password);
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors || [];
      
      // Show specific validation errors if available
      if (errors.length > 0) {
        errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(message);
      }
      
      return { success: false, error: message, errors };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully!');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  // Helper functions for role-based access control
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isUser = () => {
    return user?.role === 'user';
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Define user permissions
    const userPermissions = [
      'view_products',
      'view_categories', 
      'view_brands',
      'add_to_cart',
      'remove_from_cart',
      'make_payment'
    ];
    
    const adminPermissions = [
      ...userPermissions,
      'create_product',
      'edit_product', 
      'delete_product',
      'create_category',
      'edit_category',
      'delete_category',
      'create_brand',
      'edit_brand',
      'delete_brand'
    ];
    
    const permissions = user.role === 'admin' ? adminPermissions : userPermissions;
    return permissions.includes(permission);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
