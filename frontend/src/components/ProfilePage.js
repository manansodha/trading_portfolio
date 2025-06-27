import ProfileSettings from "./ProfileSettings";
import ProfileUser from "./ProfileUser";
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Box, ButtonGroup, Button, Fab } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';





const ProfilePage = () => {
  const [view, setView] = useState('profile');
  
  const { user } = useAuth();
  
  const navigate = useNavigate();
  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent:'space-between', mb: 2 }}>
        <Fab size="small" variant="contained" color="primary" align='left' onClick={() => navigate('/')}>
            <HomeIcon /> 
        </Fab>
        <ButtonGroup variant="contained" >
          <Button
            color={view === 'profile' ? 'primary' : 'inherit'}
            onClick={() => setView('profile')}
          >
            Profile
          </Button>
          <Button
            color={view === 'settings' ? 'primary' : 'inherit'}
            onClick={() => setView('settings')}
          >
            Settings
          </Button>
        </ButtonGroup>
        </Box>


      {view === 'profile' && <ProfileUser />}
      {view === 'settings' && <ProfileSettings />}

        
      
    </div>
  );
}

export default ProfilePage;