// frontend/src/components/BookCard.jsx
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import {
  MenuBook as BookIcon,
  Person as AuthorIcon,
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

const BookCard = ({ book, onBorrow }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Header with gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          p: 2,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
          <BookIcon sx={{ fontSize: 24, mt: 0.3, flexShrink: 0 }} />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {book.title}
          </Typography>
        </Box>
        <Chip
          label={isAvailable ? "Available" : "Out of Stock"}
          size="small"
          sx={{
            bgcolor: isAvailable ? "rgba(76, 175, 80, 0.9)" : "rgba(244, 67, 54, 0.9)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 22,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1.5 }}>
        {/* Author */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
          <AuthorIcon sx={{ color: "text.secondary", fontSize: 18, flexShrink: 0 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <strong>Author:</strong> {book.author}
          </Typography>
        </Box>

        {/* Genre */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
          <CategoryIcon sx={{ color: "text.secondary", fontSize: 18, flexShrink: 0 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <strong>Genre:</strong> {book.genre || "N/A"}
          </Typography>
        </Box>

        {/* Published Year */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
          <CalendarIcon sx={{ color: "text.secondary", fontSize: 18, flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>Published:</strong> {book.publishedYear || "Unknown"}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Available Copies */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <InventoryIcon
            sx={{
              color: isAvailable ? "success.main" : "error.main",
              fontSize: 18,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isAvailable ? "success.main" : "error.main",
            }}
          >
            {book.availableCopies} {book.availableCopies === 1 ? "copy" : "copies"} available
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 1 }}>
        {isAvailable && onBorrow ? (
          <Button
            fullWidth
            variant="contained"
            onClick={() => onBorrow(book._id)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 600,
              textTransform: "none",
              py: 1,
              fontSize: "0.875rem",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #653a8a 100%)",
              },
            }}
          >
            Borrow Book
          </Button>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            disabled
            sx={{
              textTransform: "none",
              py: 1,
              fontSize: "0.875rem",
            }}
          >
            Unavailable
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default BookCard;
