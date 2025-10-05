// frontend/src/pages/Admin.jsx
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logAPI, borrowAPI } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Admin = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect nếu không phải admin (chỉ khi đã load xong)
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);
  const [logs, setLogs] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [tab, setTab] = useState(0);

  const fetchLogs = async () => {
    try {
      const res = await logAPI.get("/");
      setLogs(res.data);
    } catch {
      // Silently handle error
    }
  };

  const fetchBorrows = async () => {
    try {
      const res = await borrowAPI.get("/");
      setBorrows(res.data);
    } catch {
      // Silently handle error
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      if (tab === 0) fetchLogs();
      if (tab === 1) fetchBorrows();
    }
  }, [tab, user]);

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
        Admin Dashboard
      </Typography>

      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
        <Tab label="Logs" />
        <Tab label="Borrows" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && (
          <Paper>
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
          </Paper>
        )}

        {tab === 1 && (
          <Paper>
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
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Admin;
