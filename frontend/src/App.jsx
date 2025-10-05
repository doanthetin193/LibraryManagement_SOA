import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import Borrow from "./pages/Borrow";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";

// Tạo theme
const theme = createTheme({
  palette: {
    mode: "light", // hoặc "dark"
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
