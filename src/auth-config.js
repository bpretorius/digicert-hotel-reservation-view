// src/auth-config.js
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const settings = {
  authority: 'http://localhost:9001',
  client_id: 'hotel_reservation',
  redirect_uri: 'http://localhost:3000/callback',
  post_logout_redirect_uri: 'http://localhost:3000',
  response_type: 'code',
  scope: 'openid profile',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(settings);
