// src/UserInfo.js
import React, { useState, useEffect } from 'react';
import { userManager } from './auth-config';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export const UserInfo = () => {
  const [user, setUser] = useState(null);

  const decodeJwtPayload = (token) => {
    if (!token) return {};

    try {
      const payload = token.split('.')[1];
      if (!payload) return {};

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );

      return JSON.parse(json);
    } catch (error) {
      return {};
    }
  };

  const normalizeClaimValues = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(' ');
    return [];
  };

  const extractRoles = (profile, tokenClaims) => {
    const directRoles = [profile?.roles, profile?.role, tokenClaims?.roles, tokenClaims?.role]
      .flatMap((value) => {
        return normalizeClaimValues(value);
      });

    const realmRoles = [
      ...(profile?.realm_access?.roles || []),
      ...(tokenClaims?.realm_access?.roles || [])
    ];

    const resourceRoles = [
      ...(Object.values(profile?.resource_access || {}).flatMap((resource) => resource?.roles || [])),
      ...(Object.values(tokenClaims?.resource_access || {}).flatMap((resource) => resource?.roles || []))
    ];

    return [...new Set([...directRoles, ...realmRoles, ...resourceRoles].filter(Boolean))];
  };

  useEffect(() => {
    const syncUser = async () => {
      const nextUser = await userManager.getUser();
      setUser(nextUser);
    };

    const onUserUnloaded = () => {
      setUser(null);
    };

    syncUser();
    userManager.events.addUserLoaded(syncUser);
    userManager.events.addUserUnloaded(onUserUnloaded);

    return () => {
      userManager.events.removeUserLoaded(syncUser);
      userManager.events.removeUserUnloaded(onUserUnloaded);
    };
  }, []);

  if (!user) {
    return (
      <Chip
        label="Not logged in"
        color="default"
        variant="outlined"
        sx={{ borderRadius: 2 }}
      />
    );
  }

  const tokenClaims = decodeJwtPayload(user.access_token);
  const roles = extractRoles(user.profile, tokenClaims);
  const aud = user.profile.aud;
  const audienceLabel = Array.isArray(aud) ? aud.join(', ') : (aud || 'N/A');

  // Extract tenant ID from common claim names
  const tenantId = user.profile.tenant_id || user.profile.tenantId || user.profile.tid || user.profile.tenantid;
  const tenantLabel = tenantId || 'N/A';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        minWidth: 260,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {user.profile.name || 'Signed in user'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
          {roles.length === 0 && <Chip size="small" label="Roles: N/A" />}
          {roles.map((role) => (
            <Chip key={role} size="small" label={`Role: ${role}`} />
          ))}
          <Chip size="small" label={`Aud: ${audienceLabel}`} />
          {tenantId && <Chip size="small" label={`Tenant: ${tenantLabel}`} />}
        </Box>
      </Stack>
    </Paper>
  );
};
