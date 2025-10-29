import { useState, useEffect, useContext } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Divider,
  Grid,
} from "@mui/material";
import {
  Person,
  Badge,
  CalendarToday,
  Fingerprint,
  AdminPanelSettings,
  MenuBook,
} from "@mui/icons-material";
import { userAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setDataLoading(true);
        const res = await userAPI.get("/me");
        setProfile(res.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading || dataLoading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
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

  const getRoleConfig = (role) => {
    switch (role) {
      case "admin":
        return { color: "error", icon: "👑", label: "Administrator" };
      case "librarian":
        return { color: "warning", icon: "📖", label: "Librarian" };
      default:
        return { color: "primary", icon: "📚", label: "User" };
    }
  };

  const roleConfig = getRoleConfig(profile?.role);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)",
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            boxShadow: 2,
          }}
        >
          <MenuBook sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            My Profile
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            View your account information
          </Typography>
        </Box>

        {/* Profile Card */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Avatar Section */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: 3,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 70,
                height: 70,
                margin: "0 auto",
                fontSize: 32,
                fontWeight: 700,
                bgcolor: "white",
                color: "#667eea",
                boxShadow: 2,
              }}
            >
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Typography variant="h6" sx={{ mt: 1.5, color: "white", fontWeight: 700 }}>
              {profile?.username}
            </Typography>
            <Chip
              icon={roleConfig.icon}
              label={roleConfig.label}
              color={roleConfig.color}
              size="small"
              sx={{
                mt: 1.5,
                fontWeight: 600,
                bgcolor: "rgba(255,255,255,0.9)",
              }}
            />
          </Box>

          {/* Account Information */}
          <Box sx={{ p: 3 }}>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(102, 126, 234, 0.05)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(102, 126, 234, 0.08)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Badge sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Role
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2">{roleConfig.icon}</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {roleConfig.label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Account Created */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(102, 126, 234, 0.05)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(102, 126, 234, 0.08)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Member Since
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </Typography>
                </Box>
              </Grid>

              {/* User ID */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(102, 126, 234, 0.05)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(102, 126, 234, 0.08)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Fingerprint sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      User ID
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "text.secondary",
                      wordBreak: "break-all",
                      fontSize: "0.85rem",
                    }}
                  >
                    {profile?._id}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;