// frontend/src/pages/Borrow.jsx
import { useEffect, useState, useContext } from "react";
import { Container, Typography, List, ListItem, ListItemText, Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { borrowAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Borrow = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect nếu chưa login (chỉ khi đã load xong)
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);
  const [borrows, setBorrows] = useState([]);

  const fetchBorrows = async () => {
    try {
      const res = await borrowAPI.get("/me");
      setBorrows(res.data);
    } catch {
      // Silently handle error
    }
  };

  const handleReturn = async (id) => {
    try {
      await borrowAPI.put(`/${id}/return`);
      fetchBorrows();
    } catch (err) {
      alert(err.response?.data?.message || "Return failed");
    }
  };

  useEffect(() => {
    if (user) {
      fetchBorrows();
    }
  }, [user]);

  // Hiển thị loading khi đang check auth
  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Borrows
      </Typography>
      <List>
        {borrows.map((b) => (
          <ListItem key={b._id} divider>
            <ListItemText
              primary={b.book?.title || "Unknown Book"}
              secondary={`Status: ${b.status}`}
            />
            {b.status === "borrowed" && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleReturn(b._id)}
              >
                Return
              </Button>
            )}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Borrow;
