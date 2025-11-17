// frontend/src/pages/Borrow.jsx
import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Paper,
  Chip,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AutoStories,
  CheckCircle,
  Schedule,
  KeyboardReturn,
  CalendarToday,
  MenuBook,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { borrowAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Borrow = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [borrows, setBorrows] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Redirect nếu chưa login (chỉ khi đã load xong)
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const fetchBorrows = async () => {
    try {
      const res = await borrowAPI.get("/me");
      setBorrows(res.data);
    } catch (error) {
      console.error("Failed to fetch borrows:", error);
      setSnackbar({
        open: true,
        message: "Failed to load borrow history",
        severity: "error",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleReturn = async (id) => {
    try {
      await borrowAPI.put(`/${id}/return`);
      setSnackbar({
        open: true,
        message: "✅ Book returned successfully!",
        severity: "success",
      });
      fetchBorrows();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "❌ Return failed",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchBorrows();
    }
  }, [user]);

  // Hiển thị loading khi đang check auth
  if (loading || fetchLoading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case "borrowed":
        return {
          color: "primary",
          icon: <AutoStories sx={{ fontSize: 18 }} />,
          label: "Borrowed",
        };
      case "returned":
        return {
          color: "success",
          icon: <CheckCircle sx={{ fontSize: 18 }} />,
          label: "Returned",
        };
      default:
        return {
          color: "default",
          icon: <Schedule sx={{ fontSize: 18 }} />,
          label: status,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            My Borrow History
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
            Track your borrowed books and returns
          </Typography>
        </Box>

        {/* Empty State */}
        {borrows.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <AutoStories sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Borrow Records
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't borrowed any books yet. Start exploring our collection!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1.5,
                boxShadow: "0 6px 16px rgba(26, 35, 126, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0d1444 0%, #283593 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(26, 35, 126, 0.4)",
                },
              }}
            >
              Browse Books
            </Button>
          </Paper>
        ) : (
          // Borrow List
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {borrows.map((b) => {
              const statusConfig = getStatusConfig(b.status);
              return (
                <Paper
                  key={b._id}
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    border: "1px solid rgba(26, 35, 126, 0.15)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 28px rgba(26, 35, 126, 0.2)",
                      borderColor: "rgba(255, 215, 0, 0.4)",
                    },
                  }}
                >
                  {/* Status Banner */}
                  <Box
                    sx={{
                      bgcolor: b.status === "returned" 
                        ? "rgba(76, 175, 80, 0.1)" 
                        : "rgba(26, 35, 126, 0.08)",
                      borderBottom: "1px solid",
                      borderColor: b.status === "returned" 
                        ? "rgba(76, 175, 80, 0.2)" 
                        : "rgba(26, 35, 126, 0.15)",
                      px: 3,
                      py: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      icon={statusConfig.icon}
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    {b.status === "borrowed" && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<KeyboardReturn />}
                        onClick={() => handleReturn(b._id)}
                        sx={{
                          background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                          textTransform: "none",
                          fontWeight: 700,
                          boxShadow: "0 4px 12px rgba(26, 35, 126, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #0d1444 0%, #283593 100%)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 16px rgba(26, 35, 126, 0.4)",
                          },
                        }}
                      >
                        Return Book
                      </Button>
                    )}
                  </Box>

                  {/* Book Info */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      {/* Book Icon */}
                      <Box
                        sx={{
                          width: 60,
                          height: 80,
                          borderRadius: 2,
                          background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(26, 35, 126, 0.3)",
                          position: "relative",
                          "::after": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: "3px",
                            height: "100%",
                            background: "#ffd700",
                          },
                        }}
                      >
                        <AutoStories sx={{ fontSize: 32, color: "white" }} />
                      </Box>
                      
                      {/* Book Details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 0.5,
                            color: "#2c3e50",
                            lineHeight: 1.3,
                          }}
                        >
                          {b.book?.title || "Unknown Book"}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: "text.secondary",
                            fontStyle: "italic",
                            mb: 1,
                          }}
                        >
                          by {b.book?.author || "Unknown Author"}
                        </Typography>
                        {b.book?.genre && (
                          <Chip
                            label={b.book.genre}
                            size="small"
                            sx={{
                              bgcolor: "rgba(26, 35, 126, 0.08)",
                              color: "#1a237e",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              border: "1px solid rgba(26, 35, 126, 0.2)",
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Dates Info */}
                    <Box 
                      sx={{ 
                        display: "grid",
                        gridTemplateColumns: b.returnDate ? "1fr 1fr" : "1fr",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "rgba(26, 35, 126, 0.05)",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ fontWeight: 600, textTransform: "uppercase" }}
                          >
                            Borrowed
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(b.borrowDate)}
                        </Typography>
                      </Box>
                      
                      {b.returnDate && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "rgba(76, 175, 80, 0.05)",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                            <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              sx={{ fontWeight: 600, textTransform: "uppercase" }}
                            >
                              Returned
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main" }}>
                            {formatDate(b.returnDate)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Summary */}
        {borrows.length > 0 && (
          <Box
            sx={{
              mt: 4,
              p: 2,
              textAlign: "center",
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(26, 35, 126, 0.08) 0%, rgba(57, 73, 171, 0.05) 100%)",
              border: "1px solid rgba(255, 215, 0, 0.2)",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Records: <strong>{borrows.length}</strong> |{" "}
              Borrowed: <strong>{borrows.filter((b) => b.status === "borrowed").length}</strong> |{" "}
              Returned: <strong>{borrows.filter((b) => b.status === "returned").length}</strong>
            </Typography>
          </Box>
        )}
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Borrow;
