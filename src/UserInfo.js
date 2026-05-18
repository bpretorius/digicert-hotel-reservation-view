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

  useEffect(() => {
    userManager.getUser().then(setUser);
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

  const roles = user.profile.roles || user.profile.role;
  const aud = user.profile.aud;
  const roleLabel = Array.isArray(roles) ? roles.join(', ') : (roles || 'N/A');
  const audienceLabel = Array.isArray(aud) ? aud.join(', ') : (aud || 'N/A');

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
          <Chip size="small" label={`Roles: ${roleLabel}`} />
          <Chip size="small" label={`Aud: ${audienceLabel}`} />
        </Box>
      </Stack>
    </Paper>
  );
};
