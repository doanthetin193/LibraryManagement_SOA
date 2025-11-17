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
        boxShadow: "0 4px 12px rgba(26, 35, 126, 0.12)",
        border: "1px solid rgba(26, 35, 126, 0.08)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(26, 35, 126, 0.2)",
          transform: "translateY(-8px)",
          borderColor: "rgba(255, 215, 0, 0.3)",
        },
      }}
    >
      {/* Header with premium gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
          p: 2.5,
          color: "white",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #ffd700 0%, #ffed4e 100%)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              bgcolor: "rgba(255, 215, 0, 0.2)",
              borderRadius: 1.5,
              p: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookIcon sx={{ fontSize: 24, color: "#ffd700" }} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              flex: 1,
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
            bgcolor: isAvailable ? "#2e7d32" : "#d32f2f",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: 24,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
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
              background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
              fontWeight: 600,
              textTransform: "none",
              py: 1.2,
              fontSize: "0.875rem",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(26, 35, 126, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #000051 0%, #283593 100%)",
                boxShadow: "0 6px 16px rgba(26, 35, 126, 0.35)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s",
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
              py: 1.2,
              fontSize: "0.875rem",
              borderRadius: 2,
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
