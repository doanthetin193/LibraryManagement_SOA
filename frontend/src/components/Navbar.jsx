// frontend/src/components/Navbar.jsx
import { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";
import {
  MenuBook,
  LibraryBooks,
  AccountCircle,
  AdminPanelSettings,
  Logout,
  Login as LoginIcon,
  PersonAdd,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
        boxShadow: "0 8px 32px rgba(26, 35, 126, 0.25)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 215, 0, 0.1)",
      }}
    >
      <Toolbar sx={{ py: 1.5, px: { xs: 2, sm: 3 } }}>
        {/* Logo / Brand */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
              borderRadius: 2,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
            }}
          >
            <MenuBook sx={{ fontSize: 28, color: "#1a237e" }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: 0.3,
                background: "linear-gradient(135deg, #ffffff 0%, #ffd700 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Library Management
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.85,
                fontSize: "0.65rem",
                letterSpacing: 2,
                color: "#ffd700",
                fontWeight: 500,
              }}
            >
              SOA ARCHITECTURE
            </Typography>
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<LibraryBooks />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2,
              "&:hover": {
                bgcolor: "rgba(255, 215, 0, 0.15)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s",
            }}
          >
            Books
          </Button>

          {user && (
            <Button
              color="inherit"
              component={Link}
              to="/borrow"
              startIcon={<MenuBook />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 215, 0, 0.15)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              My Borrows
            </Button>
          )}

          {user && (
            <Button
              color="inherit"
              component={Link}
              to="/profile"
              startIcon={<AccountCircle />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                "&:hover": {
                  bgcolor: "rgba(255, 215, 0, 0.15)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              Profile
            </Button>
          )}

          {user && user.role === "admin" && (
            <Button
              color="inherit"
              component={Link}
              to="/admin"
              startIcon={<AdminPanelSettings />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                bgcolor: "rgba(255, 215, 0, 0.25)",
                border: "1px solid rgba(255, 215, 0, 0.5)",
                "&:hover": {
                  bgcolor: "rgba(255, 215, 0, 0.35)",
                  borderColor: "rgba(255, 215, 0, 0.7)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              Admin
            </Button>
          )}

          {!user ? (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                startIcon={<LoginIcon />}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2.5,
                  borderColor: "rgba(255, 215, 0, 0.5)",
                  color: "#ffd700",
                  "&:hover": {
                    borderColor: "#ffd700",
                    bgcolor: "rgba(255, 215, 0, 0.1)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                startIcon={<PersonAdd />}
                variant="contained"
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2.5,
                  background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                  color: "#1a237e",
                  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ffed4e 0%, #fff176 100%)",
                    boxShadow: "0 6px 16px rgba(255, 215, 0, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Register
              </Button>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 2 }}>
              <Chip
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                      color: "#1a237e",
                      fontWeight: 700,
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                }
                label={user?.username || "User"}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontWeight: 600,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                  "& .MuiChip-avatar": {
                    width: 32,
                    height: 32,
                  },
                }}
              />
              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{
                  bgcolor: "rgba(255, 215, 0, 0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255, 215, 0, 0.2)",
                    transform: "rotate(10deg)",
                  },
                  transition: "all 0.2s",
                }}
                title="Logout"
              >
                <Logout />
              </IconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
