import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid2 as Grid,
  CardHeader,
  Stack,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const ProfileUser = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Profile';
  }, []);

  const maskMail = (email) => {
    if (!email) return 'Not provided';
    const [localPart, domain] = email.split('@');
    const maskedLocalPart =
      localPart.length > 2
        ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart.slice(-1)
        : localPart;
    return `${maskedLocalPart}@${domain}`;
  };

  const maskPhone = (phone) =>
    phone ? phone.replace(/\d(?=\d{4})/g, '*') : 'Not provided';

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 5, px: 3 }}>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Personal Information"
              titleTypographyProps={{ fontWeight: 'bold' }}
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.fname || '-'} {user?.lname || ''}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.username || '-'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    UID
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.id || '-'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Contact Details"
              titleTypographyProps={{ fontWeight: 'bold' }}
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {maskMail(user?.email)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {maskPhone(user?.phone)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        


      </Grid>
    </Box>
  );
};

export default ProfileUser;
