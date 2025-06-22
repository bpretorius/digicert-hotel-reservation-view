// src/Login.tsx
import React, { useEffect, useState } from 'react';
import { userManager } from './auth-config';
import Button from '@mui/material/Button';

export const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true to avoid flashing

  useEffect(() => {
    const checkUser = async () => {
      const user = await userManager.getUser();
      setIsAuthenticated(!!user && !user.expired);
    };

    checkUser();

    userManager.events.addUserLoaded(checkUser);
    userManager.events.addUserUnloaded(() => setIsAuthenticated(false));

    return () => {
      userManager.events.removeUserLoaded(checkUser);
      userManager.events.removeUserUnloaded(() => setIsAuthenticated(false));
    };
  }, []);

  if (isAuthenticated) return null;

  return (
    <Button onClick={() => userManager.signinRedirect()}>
      Login
    </Button>
  );
};
