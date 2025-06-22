// src/UserInfo.js
import React, { useState, useEffect } from 'react';
import { userManager } from './auth-config';

export const UserInfo = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userManager.getUser().then(setUser);
  }, []);

  if (!user) return <p>Not logged in</p>;

  const roles = user.profile.roles || user.profile.role;

  return (
    <div>
      <p><strong>Username:</strong> {user.profile.sub}</p>
      <p><strong>Name:</strong> {user.profile.name}</p>
      <p><strong>Aud:</strong> {user.profile.aud}</p>
      <p><strong>Roles:</strong> {Array.isArray(roles) ? roles.join(', ') : roles}</p>
    </div>
  );
};
