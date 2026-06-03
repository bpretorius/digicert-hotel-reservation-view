// src/Callback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from './auth-config';

const PROCESSED_CODE_KEY_PREFIX = 'oidc_processed_code:';
const IN_FLIGHT_CODES = new Set();

const getCodeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code') || '';
};

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignin = async () => {
      const code = getCodeFromUrl();
      const processedKey = `${PROCESSED_CODE_KEY_PREFIX}${code}`;

      if (code && sessionStorage.getItem(processedKey) === '1') {
        navigate('/', { replace: true });
        return;
      }

      if (code && IN_FLIGHT_CODES.has(code)) {
        return;
      }

      if (code) {
        IN_FLIGHT_CODES.add(code);
      }

      try {
        await userManager.signinRedirectCallback();
        if (code) {
          sessionStorage.setItem(processedKey, '1');
        }
      } catch (err) {
        console.error('Callback error:', err);
      } finally {
        if (code) {
          IN_FLIGHT_CODES.delete(code);
        }
        navigate('/', { replace: true });
      }
    };

    completeSignin();
  }, [navigate]);

  return <p>Redirecting...</p>;
}
