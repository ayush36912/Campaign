import React, { createContext, useState, useContext, useEffect } from 'react';
import { setLoggedIn, setLoggedOut } from '../store/AuthSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const URL_SERV = 'http://localhost:3000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const dispatch = useDispatch();

  const user = useSelector(state => { 
    return state.user;
  });

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        const response = await fetch(`${URL_SERV}/checkAuthStatus`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching authentication status:', error);
      }
    };

    fetchAuthStatus();
  }, [dispatch]);


  const login = async (email, password) => {
    try {
      const response = await fetch(`${URL_SERV}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok){
      console.log(data.user);
      dispatch(setLoggedIn(data.user));
      console.log('email login',data.user.email);
      setIsLoggedIn(true);
      console.log('user logged in:', data);
      toast.success('Login successful');

      }else{
        throw new Error(data.message || 'Failed to log in');
      }

    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('Failed to log in. Invaild credentials.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${URL_SERV}/logout`, {
        method: 'POST',
        credentials: 'include', 
      });
      if (response.ok) {
        dispatch(setLoggedOut());
        setIsLoggedIn(false); 
        console.log('user logged out successfully');
        toast.success('Logout successfully');
      } else {
        console.error('Error logging out:', response.statusText);
        toast.error('Error logging out.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out.');
    }
  };
  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
