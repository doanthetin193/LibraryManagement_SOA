// frontend/src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, MenuItem } from "@mui/material";
import { userAPI } from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await userAPI.post("/register", form);
      setSuccess("Register success! You can login now.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          name="username"
          fullWidth
          margin="normal"
          value={form.username}
          onChange={handleChange}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={form.password}
          onChange={handleChange}
        />
        <TextField
          label="Role"
          name="role"
          select
          fullWidth
          margin="normal"
          value={form.role}
          onChange={handleChange}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="librarian">Librarian</MenuItem>
        </TextField>
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="primary" variant="body2">
            {success}
          </Typography>
        )}
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
