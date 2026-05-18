// src/Login.tsx
import React, { useEffect, useState } from 'react';
import { userManager } from './auth-config';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';

export const Login = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true to avoid flashing
  const [loginError, setLoginError] = useState('');

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

  const handleLogin = async () => {
    setLoginError('');

    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error('Signin redirect failed:', error);
      setLoginError(
        'Unable to start secure sign-in. Trust the localhost identity certificate in Keychain Access, then fully restart your browser and try again.'
      );
    }
  };

  if (isAuthenticated) return null;

  return (
    <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 560 }}>
      <Button
        variant="contained"
        size="large"
        onClick={handleLogin}
        sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
      >
        Login
      </Button>

      {loginError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <AlertTitle>Secure sign-in setup needed</AlertTitle>
          {loginError}
          <ol style={{ marginTop: 8, marginBottom: 8, paddingLeft: 20 }}>
            <li>Open Keychain Access.</li>
            <li>Find the localhost certificate and open it.</li>
            <li>Set Trust -&gt; When using this certificate to Always Trust.</li>
          </ol>
          Retry login after restarting the browser.
        </Alert>
      )}
    </Stack>
  );
};
