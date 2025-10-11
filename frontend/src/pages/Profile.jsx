import { useState, useEffect, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip
} from "@mui/material";
import { userAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setDataLoading(true);
        const res = await userAPI.get('/me');
        setProfile(res.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Account Information
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Username
          </Typography>
          <Typography variant="h6">
            {profile?.username}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Role
          </Typography>
          <Chip 
            label={profile?.role} 
            color={profile?.role === 'admin' ? 'error' : 'primary'}
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Account Created
          </Typography>
          <Typography variant="body1">
            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB') : 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            User ID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            {profile?._id}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;