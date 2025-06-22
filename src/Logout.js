// src/Logout.tsx
import React, { useEffect, useState } from 'react';
import { userManager } from './auth-config';
import Button from '@mui/material/Button';

export const Logout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = await userManager.getUser();
      setIsAuthenticated(!!user && !user.expired);
    };

    checkUser();

    // Optional: listen for user changes if needed
    const onUserLoaded = () => checkUser();
    const onUserUnloaded = () => setIsAuthenticated(false);

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);

    return () => {
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
    };
  }, []);

  if (!isAuthenticated) return null;

  return (
    <Button onClick={() => userManager.signoutRedirect()}>
      Logout
    </Button>
  );
};
