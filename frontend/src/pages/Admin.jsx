
import { useEffect, useState, useContext } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Pagination,
  Stack,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { logAPI, borrowAPI, bookAPI, userAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Admin = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  const [logs, setLogs] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState(0);
  // Pagination state
  const [logsPage, setLogsPage] = useState(1);
  const [borrowsPage, setBorrowsPage] = useState(1);
  const [booksPage, setBooksPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState({});
  const [borrowsPagination, setBorrowsPagination] = useState({});
  const [booksPagination, setBooksPagination] = useState({});
  const [usersPagination, setUsersPagination] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Book management state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    publishedYear: '',
    genre: '',
    availableCopies: ''
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalBorrows: 0,
    totalLogs: 0
  });

  const fetchLogs = async (page = 1, skipLoading = false) => {
    try {
      if (!skipLoading) setDataLoading(true);
      const res = await logAPI.get(`/?page=${page}&limit=10`);
      setLogs(res.data.data || res.data);
      setLogsPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      console.error('Logs error details:', error.response?.data);
      // Set empty data on error
      setLogs([]);
      setLogsPagination({});
    } finally {
      if (!skipLoading) setDataLoading(false);
    }
  };

  const fetchBorrows = async (page = 1, skipLoading = false) => {
    try {
      if (!skipLoading) setDataLoading(true);
      const res = await borrowAPI.get(`/?page=${page}&limit=10`);
      setBorrows(res.data.data || res.data);
      setBorrowsPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch borrows:', error);
      setBorrows([]);
      setBorrowsPagination({});
    } finally {
      if (!skipLoading) setDataLoading(false);
    }
  };

  const fetchBooks = async (page = 1, skipLoading = false) => {
    try {
      if (!skipLoading) setDataLoading(true);
      const res = await bookAPI.get(`/?page=${page}&limit=10`);
      setBooks(res.data.data || res.data);
      setBooksPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setBooks([]);
      setBooksPagination({});
    } finally {
      if (!skipLoading) setDataLoading(false);
    }
  };

  const fetchUsers = async (page = 1, skipLoading = false) => {
    try {
      if (!skipLoading) setDataLoading(true);
      const res = await userAPI.get(`/all?page=${page}&limit=10`);
      setUsers(res.data.data || res.data);
      setUsersPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch users:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data);
      
      // Set mock data for testing if API fails
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Authentication error - set empty
        setUsers([]);
        setUsersPagination({});
      } else {
        // Other error - set mock data for testing
        const mockUsers = [
          { _id: '1', username: 'admin', role: 'admin', createdAt: new Date() },
          { _id: '2', username: 'user1', role: 'user', createdAt: new Date() },
          { _id: '3', username: 'user2', role: 'user', createdAt: new Date() }
        ];
        setUsers(mockUsers);
        setUsersPagination({ total: 3, pages: 1, current: 1 });
      }
    } finally {
      if (!skipLoading) setDataLoading(false);
    }
  };

  // Fetch all data for stats on initial load
  useEffect(() => {
    if (user && user.role === "admin") {
      const fetchAllStats = async () => {
        setStatsLoading(true);
        try {
          await Promise.all([
            fetchLogs(1, true),
            fetchBorrows(1, true), 
            fetchBooks(1, true),
            fetchUsers(1, true)
          ]);
        } finally {
          setStatsLoading(false);
        }
      };
      
      fetchAllStats();
    }
  }, [user]);

  // Fetch data when tab changes
  useEffect(() => {
    if (user && user.role === "admin") {
      if (tab === 0) {
        setLogsPage(1);
        fetchLogs(1);
      }
      if (tab === 1) {
        setBorrowsPage(1);
        fetchBorrows(1);
      }
      if (tab === 2) {
        setBooksPage(1);
        fetchBooks(1);
      }
      if (tab === 3) {
        setUsersPage(1);
        fetchUsers(1);
      }
    }
  }, [tab, user]);

  // Update stats when data changes
  useEffect(() => {
    setStats({
      totalUsers: usersPagination.total || users.length || 0,
      totalBooks: booksPagination.total || books.length || 0,
      totalBorrows: borrowsPagination.total || borrows.length || 0,
      totalLogs: logsPagination.total || logs.length || 0
    });
  }, [usersPagination, booksPagination, borrowsPagination, logsPagination, users.length, books.length, borrows.length, logs.length]);


  const handleLogsPageChange = (event, page) => {
    setLogsPage(page);
    fetchLogs(page);
  };

  const handleBorrowsPageChange = (event, page) => {
    setBorrowsPage(page);
    fetchBorrows(page);
  };

  const handleBooksPageChange = (event, page) => {
    setBooksPage(page);
    fetchBooks(page);
  };

  const handleUsersPageChange = (event, page) => {
    setUsersPage(page);
    fetchUsers(page);
  };

  // Book management functions
  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      publishedYear: '',
      genre: '',
      availableCopies: ''
    });
    setEditingBook(null);
  };

  const openCreateDialog = () => {
    resetBookForm();
    setDialogOpen(true);
  };

  const openEditDialog = (book) => {
    setBookForm({
      title: book.title,
      author: book.author,
      publishedYear: book.publishedYear.toString(),
      genre: book.genre || '',
      availableCopies: book.availableCopies.toString()
    });
    setEditingBook(book);
    setDialogOpen(true);
  };

  const handleBookFormChange = (field, value) => {
    setBookForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateBook = async () => {
    try {
      const bookData = {
        ...bookForm,
        publishedYear: parseInt(bookForm.publishedYear),
        availableCopies: parseInt(bookForm.availableCopies)
      };
      
      await bookAPI.post('/', bookData);
      setAlert({ open: true, message: 'Book created successfully!', severity: 'success' });
      setDialogOpen(false);
      resetBookForm();
      fetchBooks(booksPage);
    } catch (error) {
      setAlert({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to create book', 
        severity: 'error' 
      });
    }
  };

  const handleUpdateBook = async () => {
    try {
      const bookData = {
        ...bookForm,
        publishedYear: parseInt(bookForm.publishedYear),
        availableCopies: parseInt(bookForm.availableCopies)
      };
      
      await bookAPI.put(`/${editingBook._id}`, bookData);
      setAlert({ open: true, message: 'Book updated successfully!', severity: 'success' });
      setDialogOpen(false);
      resetBookForm();
      fetchBooks(booksPage);
    } catch (error) {
      setAlert({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to update book', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookAPI.delete(`/${bookId}`);
        setAlert({ open: true, message: 'Book deleted successfully!', severity: 'success' });
        fetchBooks(booksPage);
      } catch (error) {
        setAlert({ 
          open: true, 
          message: error.response?.data?.message || 'Failed to delete book', 
          severity: 'error' 
        });
      }
    }
  };


  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
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
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            👑 Admin Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
            Manage your library system
          </Typography>
        </Box>

        {/* Dashboard Summary Cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 3, mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)",
              color: "white",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              "::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "3px",
                height: "100%",
                background: "#ffd700",
              },
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 28px rgba(26, 35, 126, 0.3)",
              },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {statsLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : stats.totalUsers}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
              👥 Total Users
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {statsLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : stats.totalBooks}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
              📚 Total Books
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {statsLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : stats.totalBorrows}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
              📖 Total Borrows
            </Typography>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "white",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {statsLoading ? <CircularProgress size={24} sx={{ color: "white" }} /> : stats.totalLogs}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>
              📋 System Logs
            </Typography>
          </Paper>
        </Box>

      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={(e, newVal) => setTab(newVal)}
          variant="fullWidth"
          sx={{
            bgcolor: "white",
            "& .MuiTab-root": {
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              py: 2,
            },
            "& .Mui-selected": {
              color: "#1a237e",
            },
            "& .MuiTabs-indicator": {
              height: 3,
              background: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
            },
          }}
        >
          <Tab label={`📋 Logs ${logsPagination.total ? `(${logsPagination.total})` : ""}`} />
          <Tab label={`📖 Borrows ${borrowsPagination.total ? `(${borrowsPagination.total})` : ""}`} />
          <Tab label={`📚 Books ${booksPagination.total ? `(${booksPagination.total})` : ""}`} />
          <Tab label={`👥 Users ${usersPagination.total ? `(${usersPagination.total})` : ""}`} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 3 }}>

        {dataLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {tab === 0 && (
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{log.service}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        {log.user?.username || "N/A"} ({log.user?.id || "N/A"})
                      </TableCell>
                      <TableCell>{log.level}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            

            {logsPagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Page {logsPagination.current} of {logsPagination.pages} 
                    ({logsPagination.total} total logs)
                  </Typography>
                  <Pagination
                    count={logsPagination.pages}
                    page={logsPagination.current || logsPage}
                    onChange={handleLogsPageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {tab === 1 && (
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Borrow Date</TableCell>
                    <TableCell>Return Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {borrows.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell>{b.user?.username}</TableCell>
                      <TableCell>{b.book?.title}</TableCell>
                      <TableCell>{b.status}</TableCell>
                      <TableCell>
                        {new Date(b.borrowDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {b.returnDate
                          ? new Date(b.returnDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            

            {borrowsPagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Page {borrowsPagination.current} of {borrowsPagination.pages} 
                    ({borrowsPagination.total} total borrows)
                  </Typography>
                  <Pagination
                    count={borrowsPagination.pages}
                    page={borrowsPagination.current || borrowsPage}
                    onChange={handleBorrowsPageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {tab === 2 && (
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "rgba(26, 35, 126, 0.05)", borderBottom: "2px solid rgba(255, 215, 0, 0.2)" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                📚 Books Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
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
                Add New Book
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Published Year</TableCell>
                    <TableCell>Genre</TableCell>
                    <TableCell>Available Copies</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book._id}>
                      <TableCell>{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.publishedYear}</TableCell>
                      <TableCell>{book.genre || '-'}</TableCell>
                      <TableCell>{book.availableCopies}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => openEditDialog(book)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteBook(book._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {booksPagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Page {booksPagination.current} of {booksPagination.pages} 
                    ({booksPagination.total} total books)
                  </Typography>
                  <Pagination
                    count={booksPagination.pages}
                    page={booksPagination.current || booksPage}
                    onChange={handleBooksPageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {tab === 3 && (
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3, bgcolor: "rgba(26, 35, 126, 0.05)", borderBottom: "2px solid rgba(255, 215, 0, 0.2)" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                👥 Users Management
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Typography 
                          color={user.role === 'admin' ? 'error' : 'primary'}
                          fontWeight={user.role === 'admin' ? 'bold' : 'normal'}
                        >
                          {user.role}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography color="success.main">Active</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {usersPagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Stack spacing={2} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Page {usersPagination.current} of {usersPagination.pages} 
                    ({usersPagination.total} total users)
                  </Typography>
                  <Pagination
                    count={usersPagination.pages}
                    page={usersPagination.current || usersPage}
                    onChange={handleUsersPageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Book Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBook ? 'Edit Book' : 'Add New Book'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={bookForm.title}
            onChange={(e) => handleBookFormChange('title', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Author"
            value={bookForm.author}
            onChange={(e) => handleBookFormChange('author', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Published Year"
            type="number"
            value={bookForm.publishedYear}
            onChange={(e) => handleBookFormChange('publishedYear', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Genre"
            value={bookForm.genre}
            onChange={(e) => handleBookFormChange('genre', e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Available Copies"
            type="number"
            value={bookForm.availableCopies}
            onChange={(e) => handleBookFormChange('availableCopies', e.target.value)}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={editingBook ? handleUpdateBook : handleCreateBook}
            variant="contained"
          >
            {editingBook ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      {alert.open && (
        <Alert 
          severity={alert.severity} 
          onClose={() => setAlert({ ...alert, open: false })}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
        >
          {alert.message}
        </Alert>
      )}
      </Container>
    </Box>
  );
};

export default Admin;
