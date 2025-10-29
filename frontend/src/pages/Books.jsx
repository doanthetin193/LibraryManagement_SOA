// frontend/src/pages/Books.jsx
import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  Skeleton,
} from "@mui/material";
import { Search, LibraryBooks } from "@mui/icons-material";
import { bookAPI, borrowAPI } from "../api/axios";
import BookCard from "../components/BookCard";
import { AuthContext } from "../context/AuthContext";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const { user } = useContext(AuthContext);

  const fetchBooks = async () => {
    try {
      const res = await bookAPI.get("/");
      // Handle both old format (array) and new format (with data property)
      const bookData = res.data.data || res.data;
      setBooks(bookData);
      setFilteredBooks(bookData);
    } catch (error) {
      console.error("Failed to fetch books for homepage:", error);
      setSnackbar({
        open: true,
        message: "Failed to load books. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await borrowAPI.post("/", { bookId });
      setSnackbar({
        open: true,
        message: "✅ Borrow request sent successfully!",
        severity: "success",
      });
      // Refresh danh sách sách để cập nhật availableCopies
      fetchBooks();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "❌ Borrow failed",
        severity: "error",
      });
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredBooks(books);
      return;
    }

    const filtered = books.filter(
      (book) =>
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.genre?.toLowerCase().includes(query)
    );
    setFilteredBooks(filtered);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            boxShadow: 2,
          }}
        >
          <LibraryBooks sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Library Collection
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Explore our {books.length} books and find your next favorite read
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search by title, author, or genre..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#667eea",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                },
              },
            }}
          />
        </Box>

        {/* Loading State */}
        {loading ? (
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredBooks.length === 0 ? (
          // Empty State
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              bgcolor: "white",
              borderRadius: 3,
              boxShadow: 1,
            }}
          >
            <LibraryBooks sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchQuery ? "No books found" : "No books available"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? `Try searching for something else`
                : "Check back later for new additions"}
            </Typography>
          </Box>
        ) : (
          // Books Grid
          <Grid container spacing={2.5}>
            {filteredBooks.map((book) => (
              <Grid item xs={12} sm={6} md={4} key={book._id}>
                <BookCard book={book} onBorrow={user ? handleBorrow : null} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Search Results Count */}
        {!loading && searchQuery && filteredBooks.length > 0 && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Found {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} matching
              "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Container>

      {/* Snackbar for notifications */}
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

export default Books;
