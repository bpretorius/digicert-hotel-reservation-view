// src/Callback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from './auth-config';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    userManager.signinRedirectCallback()
      .then(user => {
        console.log('User signed in:', user);
        navigate('/');
      })
      .catch(err => {
        console.error('Callback error:', err);
        //userManager.signoutRedirect();
        //userManager.signinRedirect();
        navigate('/');
      });
  }, [navigate]);

  return <p>Redirecting...</p>;
}
