// frontend/src/components/BookCard.jsx
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";

const BookCard = ({ book, onBorrow }) => {
  return (
    <Card sx={{ maxWidth: 300, m: 1, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Author: {book.author}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Genre: {book.genre || "N/A"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Published: {book.publishedYear || "Unknown"}
        </Typography>
        <Typography
          variant="body2"
          color={book.availableCopies > 0 ? "green" : "red"}
        >
          Available: {book.availableCopies}
        </Typography>
      </CardContent>

      <CardActions>
        {book.availableCopies > 0 && onBorrow ? (
          <Button
            size="small"
            variant="contained"
            onClick={() => onBorrow(book._id)}
          >
            Borrow
          </Button>
        ) : (
          <Button size="small" disabled>
            Not Available
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default BookCard;
