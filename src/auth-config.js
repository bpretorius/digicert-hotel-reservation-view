// src/auth-config.js
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const settings = {
  authority: 'http://localhost:8080/realms/dev',   // ✅ KEY CHANGE (Keycloak, not SAS)
  client_id: 'hotel-reservation-spa-client',       // ✅ your Keycloak client
  redirect_uri: 'http://localhost:3000/callback',
  post_logout_redirect_uri: 'http://localhost:3000',
  response_type: 'code',
  scope: 'openid profile email',                  // ✅ include email
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};

export const userManager = new UserManager(settings);