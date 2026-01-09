import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  CircularProgress,
  TablePagination,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddSecurityDialog from "../../components/dialogs/AdminDialogs/AddSecurityDialog";

export default function Security() {
  const navigate = useNavigate();
  const [securityGuards, setSecurityGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [societyId] = useState(() => {
    return localStorage.getItem("societyId") || "society_id";
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);

  const theme = {
    primary: "#2563eb",
    success: "#10b981",
    error: "#ef4444",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    background: "#f8fafc",
  };

  useEffect(() => {
    if (!societyId) {
      toast.error("Society ID not found");
      setLoading(false);
      return;
    }
    fetchSecurityGuards();
  }, [societyId]);

  const fetchSecurityGuards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, registed_user_id, name, email, number, role_type, building_id, is_active, created_at"
        )
        .eq("role_type", "Security")
        .eq("society_id", societyId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSecurityGuards(data || []);
    } catch (error) {
      console.error("Error fetching security guards:", error);
      toast.error("Failed to fetch security guards");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus ? false : true;
    const { error } = await supabase
      .from("users")
      .update({ is_active: newStatus })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(
        `Security guard ${newStatus ? "activated" : "deactivated"}!`
      );
      fetchSecurityGuards();
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase
      .from("users")
      .update({ is_delete: true })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Security guard removed!");
      fetchSecurityGuards();
    }
  };

  const filteredGuards = securityGuards.filter(
    (guard) =>
      guard.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guard.number?.includes(searchTerm)
  );

  const paginatedGuards = filteredGuards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="min-h-screen p-4 md:p-6 font-roboto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Typography
            variant="h4"
            className="font-bold mb-2"
            style={{ color: theme.textPrimary }}
          >
            Security Management
          </Typography>
          <Typography
            className="text-lg font-semibold"
            style={{ color: theme.primary }}
          >
            Society Security Guards ({securityGuards.length})
          </Typography>
        </div>

        {/* Search */}
        <Card
          className="rounded-lg border shadow-sm mb-6"
          style={{ borderColor: theme.border }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Typography
                variant="h6"
                className="font-semibold"
                style={{ color: theme.textPrimary }}
              >
                Showing {filteredGuards.length} of {securityGuards.length}{" "}
                guards
              </Typography>
              <TextField
                placeholder="Search by name, email, or phone..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full md:w-64"
                InputProps={{
                  startAdornment: (
                    <Search
                      style={{ color: theme.textSecondary }}
                      className="mr-2"
                    />
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card
          className="rounded-lg border shadow-sm overflow-hidden"
          style={{ borderColor: theme.border }}
        >
          {loading ? (
            <Box className="flex justify-center p-12">
              <CircularProgress style={{ color: theme.primary }} />
            </Box>
          ) : filteredGuards.length === 0 ? (
            <Alert
              severity="info"
              sx={{ m: 3 }}
              style={{
                backgroundColor: `${theme.primary}10`,
                color: theme.primary,
              }}
            >
              {searchTerm
                ? "No security guards found matching search."
                : "No security guards assigned to this society."}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead style={{ backgroundColor: theme.background }}>
                    <TableRow>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Email
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Phone
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Building
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: 600,
                          color: theme.textPrimary,
                          textAlign: "center",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedGuards.map((guard) => (
                      <TableRow key={guard.id} hover>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <SecurityIcon
                                fontSize="small"
                                style={{ color: theme.primary }}
                              />
                            </div>
                            <div>
                              <Typography className="font-semibold">
                                {guard.name || "N/A"}
                              </Typography>
                              <Typography
                                variant="body2"
                                style={{ color: theme.textSecondary }}
                              >
                                ID: {guard.registed_user_id}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{guard.email || "-"}</TableCell>
                        <TableCell>{guard.number || "-"}</TableCell>
                        <TableCell>
                          {guard.building_id
                            ? `Building ${guard.building_id}`
                            : "Society-wide"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={guard.is_active ? "Active" : "Inactive"}
                            size="small"
                            style={{
                              backgroundColor: guard.is_active
                                ? `${theme.success}15`
                                : `${theme.error}15`,
                              color: guard.is_active
                                ? theme.success
                                : theme.error,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="contained"
                              onClick={() => {
                                setSelectedGuard(null);
                                setOpenDialog(true);
                              }}
                            >
                              Add Security
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedGuard(guard);
                                setOpenDialog(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>

                            {/* <IconButton
                              size="small"
                              onClick={() =>
                                handleToggleStatus(guard.id, guard.is_active)
                              }
                              title={
                                guard.is_active ? "Deactivate" : "Activate"
                              }
                            >
                              {guard.is_active ? (
                                <VisibilityOff
                                  fontSize="small"
                                  style={{ color: theme.error }}
                                />
                              ) : (
                                <Visibility
                                  fontSize="small"
                                  style={{ color: theme.success }}
                                />
                              )}
                            </IconButton> */}

                            <IconButton
                              size="small"
                              onClick={() => handleDelete(guard.id)}
                              title="Remove"
                            >
                              <Delete
                                fontSize="small"
                                style={{ color: theme.error }}
                              />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.border}` }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredGuards.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </Box>
            </>
          )}
        </Card>
      </motion.div>
      <AddSecurityDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedGuard(null);
        }}
        guard={selectedGuard}
        societyId={societyId}
        onSuccess={fetchSecurityGuards}
      />
    </div>
  );
}
