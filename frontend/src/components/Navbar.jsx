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
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <Toolbar sx={{ py: 1 }}>
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
          }}
        >
          <MenuBook sx={{ fontSize: 32 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: 0.5,
              }}
            >
              Library Management
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                fontSize: "0.7rem",
                letterSpacing: 1,
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
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
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
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                },
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
                bgcolor: "rgba(255,215,0,0.2)",
                "&:hover": {
                  bgcolor: "rgba(255,215,0,0.3)",
                },
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
                  borderColor: "rgba(255,255,255,0.5)",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
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
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
              >
                Register
              </Button>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: "white", color: "primary.main" }}>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                }
                label={user?.username || "User"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-avatar": {
                    width: 28,
                    height: 28,
                  },
                }}
              />
              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
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
