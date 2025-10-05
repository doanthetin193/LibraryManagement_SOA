// frontend/src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { userAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      const res = await userAPI.post("/login", form);
      localStorage.setItem("token", res.data.token);
      // Backend trả về {_id, username, role, token}
      const userData = {
        _id: res.data._id,
        username: res.data.username,
        role: res.data.role
      };
      login(userData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Login
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
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
