// frontend/src/pages/Books.jsx
import { useEffect, useState, useContext } from "react";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";
import { bookAPI, borrowAPI } from "../api/axios";
import BookCard from "../components/BookCard";
import { AuthContext } from "../context/AuthContext";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchBooks = async () => {
    try {
      const res = await bookAPI.get("/");
      setBooks(res.data);
    } catch {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await borrowAPI.post("/", { bookId });
      alert("Borrow request sent!");
      // Refresh danh sách sách để cập nhật availableCopies
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Borrow failed");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 8 }} />;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Books
      </Typography>
      <Grid container spacing={2}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id}>
            <BookCard book={book} onBorrow={user ? handleBorrow : null} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Books;
