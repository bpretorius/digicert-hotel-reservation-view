import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from './auth-config';

export default function LogoutCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogout = async () => {
      try {
        await userManager.signoutRedirectCallback();
      } catch (error) {
        // Keep going even when provider response is missing/invalid.
        console.error('Logout callback error:', error);
      } finally {
        await userManager.removeUser();
        navigate('/');
      }
    };

    completeLogout();
  }, [navigate]);

  return <p>Signing out...</p>;
}
