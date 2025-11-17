import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

// 🎨 Premium Theme - Deep Blue & Gold Palette
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a237e", // Deep Indigo
      light: "#534bae",
      dark: "#000051",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffd700", // Gold
      light: "#ffff52",
      dark: "#c7a600",
      contrastText: "#000000",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#666666",
    },
    success: {
      main: "#2e7d32",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(26, 35, 126, 0.08)",
    "0px 4px 8px rgba(26, 35, 126, 0.12)",
    "0px 6px 12px rgba(26, 35, 126, 0.15)",
    "0px 8px 16px rgba(26, 35, 126, 0.18)",
    "0px 10px 20px rgba(26, 35, 126, 0.20)",
    "0px 12px 24px rgba(26, 35, 126, 0.22)",
    "0px 14px 28px rgba(26, 35, 126, 0.24)",
    "0px 16px 32px rgba(26, 35, 126, 0.26)",
    "0px 18px 36px rgba(26, 35, 126, 0.28)",
    "0px 20px 40px rgba(26, 35, 126, 0.30)",
    ...Array(14).fill("0px 20px 40px rgba(26, 35, 126, 0.30)"),
  ],
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Books />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/borrow" element={<Borrow />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
