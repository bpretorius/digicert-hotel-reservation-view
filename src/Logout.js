// src/Logout.tsx
import React, { useEffect, useState } from 'react';
import { userManager } from './auth-config';
import Button from '@mui/material/Button';

const CLIENT_ID = 'hotel-reservation-spa-client';

export const Logout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = async () => {
    try {
      const user = await userManager.getUser();

      // Clear local OIDC state before redirecting to the provider logout.
      await userManager.removeUser();
      await userManager.clearStaleState();
      setIsAuthenticated(false);

      await userManager.signoutRedirect({
        id_token_hint: user?.id_token,
        post_logout_redirect_uri: window.location.origin,
        extraQueryParams: {
          client_id: CLIENT_ID,
        },
      });
    } catch (error) {
      console.error('Logout redirect failed, clearing local session only:', error);
      await userManager.removeUser();
      setIsAuthenticated(false);
    }
  };

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
    <Button
      variant="outlined"
      color="error"
      size="large"
      onClick={handleLogout}
      sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
    >
      Logout
    </Button>
  );
};
