// frontend/src/components/Navbar.jsx
import { useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
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
    <AppBar position="static">
      <Toolbar>
        {/* Logo / Tiêu đề */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: "bold",
          }}
        >
          📚 Library SOA
        </Typography>

        {/* Các nút điều hướng */}
        <Box>
          <Button color="inherit" component={Link} to="/">
            Books
          </Button>
          {user && (
            <Button color="inherit" component={Link} to="/borrow">
              My Borrows
            </Button>
          )}
          {user && (
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>
          )}
          {user && user.role === "admin" && (
            <Button color="inherit" component={Link} to="/admin">
              Admin
            </Button>
          )}
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogout}>
              Logout ({user.username})
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
