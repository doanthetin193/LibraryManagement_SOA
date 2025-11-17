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
      <Container maxWidth="md">
        {/* Header */}
        <Box
          sx={{
            textAlign: "center",
            mb: 3,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
            color: "white",
            boxShadow: "0 8px 24px rgba(26, 35, 126, 0.25)",
            position: "relative",
            "::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)",
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <MenuBook sx={{ fontSize: 48, mb: 1, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            My Profile
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
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
              background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
              p: 4,
              textAlign: "center",
              position: "relative",
              "::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "3px",
                background: "#ffd700",
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                margin: "0 auto",
                fontSize: 40,
                fontWeight: 800,
                bgcolor: "white",
                color: "#1a237e",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                border: "3px solid #ffd700",
              }}
            >
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2, color: "white", fontWeight: 800 }}>
              {profile?.username}
            </Typography>
            <Chip
              label={roleConfig.label}
              color={roleConfig.color}
              size="medium"
              sx={{
                mt: 1.5,
                fontWeight: 700,
                bgcolor: "rgba(255,255,255,0.95)",
                fontSize: "0.9rem",
                px: 1,
              }}
            />
          </Box>

          {/* Account Information */}
          <Box sx={{ p: 3 }}>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} justifyContent="space-evenly" alignItems="stretch">
              {/* Role */}
              <Grid item xs={12} sm={3.8}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(26, 35, 126, 0.04)",
                    border: "1px solid rgba(26, 35, 126, 0.1)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(26, 35, 126, 0.08)",
                      borderColor: "rgba(255, 215, 0, 0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(26, 35, 126, 0.15)",
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
              <Grid item xs={12} sm={3.8}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(26, 35, 126, 0.04)",
                    border: "1px solid rgba(26, 35, 126, 0.1)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(26, 35, 126, 0.08)",
                      borderColor: "rgba(255, 215, 0, 0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(26, 35, 126, 0.15)",
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
              <Grid item xs={12} sm={3.8}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(26, 35, 126, 0.04)",
                    border: "1px solid rgba(26, 35, 126, 0.1)",
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "rgba(26, 35, 126, 0.08)",
                      borderColor: "rgba(255, 215, 0, 0.3)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(26, 35, 126, 0.15)",
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