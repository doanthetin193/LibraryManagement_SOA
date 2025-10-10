
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logAPI, borrowAPI } from "../api/axios";
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
  const [tab, setTab] = useState(0);
  // Pagination state
  const [logsPage, setLogsPage] = useState(1);
  const [borrowsPage, setBorrowsPage] = useState(1);
  const [logsPagination, setLogsPagination] = useState({});
  const [borrowsPagination, setBorrowsPagination] = useState({});
  const [dataLoading, setDataLoading] = useState(false);

  const fetchLogs = async (page = 1) => {
    try {
      setDataLoading(true);
      const res = await logAPI.get(`/?page=${page}&limit=10`);
      setLogs(res.data.data || res.data);
      setLogsPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchBorrows = async (page = 1) => {
    try {
      setDataLoading(true);
      const res = await borrowAPI.get(`/?page=${page}&limit=10`);
      setBorrows(res.data.data || res.data);
      setBorrowsPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch borrows:', error);
    } finally {
      setDataLoading(false);
    }
  };

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
    }
  }, [tab, user]);


  const handleLogsPageChange = (event, page) => {
    setLogsPage(page);
    fetchLogs(page);
  };

  const handleBorrowsPageChange = (event, page) => {
    setBorrowsPage(page);
    fetchBorrows(page);
  };


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
        Admin Dashboard
      </Typography>

      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
        <Tab 
          label={`Logs ${logsPagination.total ? `(${logsPagination.total})` : ''}`} 
        />
        <Tab 
          label={`Borrows ${borrowsPagination.total ? `(${borrowsPagination.total})` : ''}`} 
        />
      </Tabs>

      <Box sx={{ mt: 3 }}>

        {dataLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {tab === 0 && (
          <Paper>
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
          <Paper>
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
      </Box>
    </Container>
  );
};

export default Admin;
