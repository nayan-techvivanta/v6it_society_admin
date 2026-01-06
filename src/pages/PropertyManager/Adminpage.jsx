import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  useTheme,
  Collapse,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  AdminPanelSettings,
  KeyboardArrowDown,
  KeyboardArrowUp,
  LocationCity,
  Apartment,
  Phone,
  Email,
  FilterList,
  Assignment,
  Clear,
} from "@mui/icons-material";
import { MdOutlineWhatsapp } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../api/supabaseClient";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";
import UserDialog from "../../components/dialogs/ManagerDialogs/UserDialog";

const roleTypes = [
  {
    value: "Admin",
    label: "Administrator",
    color: "#6F0B14",
    icon: <AdminPanelSettings />,
  },
];

// Status options
const statusOptions = [
  { value: "active", label: "Active", color: "#008000" },
  { value: "inactive", label: "Inactive", color: "#A29EB6" },
];

// Collapsible Row Component
const CollapsibleRow = ({ user, onEdit, onDelete, onAssign, societyName }) => {
  const [open, setOpen] = useState(false);
  const statusInfo =
    statusOptions.find((s) => s.value === user.status) || statusOptions[0];

  // Safely handle ID - agar number hai to string me convert karein
  const userId = user.id ? user.id.toString() : "";
  const displayId = userId.substring
    ? userId.substring(0, 8)
    : userId.slice
    ? userId.slice(0, 8)
    : "N/A";

  return (
    <>
      {/* Main Row */}
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: alpha("#6F0B14", 0.1),
                color: "#6F0B14",
                fontWeight: 600,
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="600">
                {user.name || "No Name"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {displayId}...
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{user.email}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{user.number || "N/A"}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {user.whatsapp_number || "N/A"}
          </Typography>
        </TableCell>

        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight="500">
              {societyName || "Not Assigned"}
            </Typography>
            <IconButton
              size="small"
              onClick={() => onAssign(user.id)}
              sx={{
                color: "#6F0B14",
                backgroundColor: alpha("#6F0B14", 0.1),
                "&:hover": {
                  backgroundColor: alpha("#6F0B14", 0.2),
                },
              }}
              title={societyName ? "Change Society" : "Assign to Society"}
            >
              <Assignment fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusInfo.color,
              }}
            />
            <Typography variant="body2">{statusInfo.label}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <IconButton
              size="small"
              onClick={() => onEdit(user.id)}
              sx={{
                color: "#6F0B14",
                backgroundColor: alpha("#6F0B14", 0.1),
                "&:hover": {
                  backgroundColor: alpha("#6F0B14", 0.2),
                },
              }}
              title="Edit Admin"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(user.id)}
              sx={{
                color: "#B31B1B",
                backgroundColor: alpha("#B31B1B", 0.1),
                "&:hover": {
                  backgroundColor: alpha("#B31B1B", 0.2),
                },
              }}
              title="Delete Admin"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                p: 3,
                backgroundColor: alpha("#6F0B14", 0.02),
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                color="#6F0B14"
                fontWeight="600"
              >
                Admin Details
              </Typography>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}
                gap={3}
              >
                {/* Personal Information */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Personal Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" sx={{ color: "#6F0B14" }} />
                      <Typography variant="body2">
                        <strong>Email:</strong> {user.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" sx={{ color: "#6F0B14" }} />
                      <Typography variant="body2">
                        <strong>Number:</strong> {user.number || "Not provided"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MdOutlineWhatsapp size={20} color="#25D366" />
                      <Typography variant="body2">
                        <strong>WhatsApp:</strong>{" "}
                        {user.whatsapp_number || "Not provided"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2">
                        <strong>Role:</strong>{" "}
                        <Chip
                          label="Administrator"
                          size="small"
                          sx={{
                            backgroundColor: alpha("#6F0B14", 0.1),
                            color: "#6F0B14",
                            fontWeight: 500,
                            ml: 1,
                          }}
                        />
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Assignment Information */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Assignment Details
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationCity
                        fontSize="small"
                        sx={{ color: "#6F0B14" }}
                      />
                      <Typography variant="body2">
                        <strong>Society:</strong>{" "}
                        {societyName || "Not assigned"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">
                        <strong>Account Status:</strong>{" "}
                        <Box
                          component="span"
                          display="inline-flex"
                          alignItems="center"
                          gap={1}
                          ml={1}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: statusInfo.color,
                            }}
                          />
                          <span>{statusInfo.label}</span>
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Info */}
                <Box gridColumn={{ xs: "span 1", md: "span 2" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Additional Information
                  </Typography>
                  <Box display="flex" gap={3} flexWrap="wrap">
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Created At
                      </Typography>
                      <Typography variant="body2">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {user.updated_at
                          ? new Date(user.updated_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </Typography>
                    </Box>
                    {user.last_login && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Last Login
                        </Typography>
                        <Typography variant="body2">
                          {new Date(user.last_login).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Assign/Edit Society Dialog Component
const AssignSocietyDialog = ({ open, onClose, onSubmit, societies, user }) => {
  const [selectedSociety, setSelectedSociety] = useState(
    user?.society_id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Initialize with user's current society
    setSelectedSociety(user?.society_id || "");
  }, [user]);

  const handleSubmit = async () => {
    if (!selectedSociety) {
      toast.error("Please select a society");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(user.id, selectedSociety);
      onClose();
    } catch (error) {
      console.error("Error assigning society:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSociety = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(user.id, null); // Remove society by setting to null
      onClose();
    } catch (error) {
      console.error("Error removing society:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, #6F0B14 0%, ${alpha(
            "#6F0B14",
            0.9
          )} 100%)`,
          color: "white",
          py: 2.5,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Assignment sx={{ fontSize: 24 }} />
          <Typography variant="h6" fontWeight="600">
            {user?.society_id
              ? "Update Society Assignment"
              : "Assign Admin to Society"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="body1" fontWeight="500" mb={1}>
            Admin: <span style={{ color: "#6F0B14" }}>{user?.name}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.society_id
              ? "Select a new society or remove current assignment"
              : "Select a society to assign this admin"}
          </Typography>
        </Box>

        <FormControl fullWidth>
          <InputLabel>Select Society</InputLabel>
          <Select
            value={selectedSociety}
            onChange={(e) => setSelectedSociety(e.target.value)}
            label="Select Society"
            sx={{
              borderRadius: 2,
              height: 48,
            }}
          >
            <MenuItem value="">
              <em>No society (Unassigned)</em>
            </MenuItem>
            {societies.map((society) => (
              <MenuItem key={society.id} value={society.id}>
                {society.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: "#6F0B14",
            borderColor: alpha("#6F0B14", 0.3),
            "&:hover": {
              borderColor: "#6F0B14",
            },
          }}
        >
          Cancel
        </Button>

        {user?.society_id && (
          <Button
            onClick={handleRemoveSociety}
            disabled={isSubmitting}
            sx={{
              color: "#B31B1B",
              borderColor: alpha("#B31B1B", 0.3),
              "&:hover": {
                borderColor: "#B31B1B",
                backgroundColor: alpha("#B31B1B", 0.04),
              },
            }}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Removing..." : "Remove Society"}
          </Button>
        )}

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            isSubmitting || selectedSociety === (user?.society_id || "")
          }
          sx={{
            backgroundColor: "#6F0B14",
            "&:hover": {
              backgroundColor: alpha("#6F0B14", 0.9),
            },
          }}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSubmitting
            ? "Saving..."
            : user?.society_id
            ? "Update Society"
            : "Assign to Society"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToAssign, setUserToAssign] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [societies, setSocieties] = useState([]);
  const [filters, setFilters] = useState({
    society: "all",
    status: "all",
  });

  // Fetch Admins and Societies from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Admins (role_type = "Admin")
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("role_type", "Admin")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch Societies
      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name")
        .order("name");

      if (societiesError) throw societiesError;
      setSocieties(societiesData || []);

      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get society name from society_id
  const getSocietyName = (societyId) => {
    if (!societyId) return null;
    const society = societies.find((s) => s.id === societyId);
    return society ? society.name : null;
  };

  // Filter Admins based on search and filters
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(term) ||
      (user.email?.toLowerCase() || "").includes(term) ||
      (user.number?.toLowerCase() || "").includes(term) ||
      (user.whatsapp_number?.toLowerCase() || "").includes(term);

    const matchesSociety =
      filters.society === "all" ||
      (filters.society === "assigned" && user.society_id) ||
      (filters.society === "unassigned" && !user.society_id) ||
      user.society_id === filters.society;

    const matchesStatus =
      filters.status === "all" || user.status === filters.status;

    return matchesSearch && matchesSociety && matchesStatus;
  });

  const handleAddUser = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find((user) => user.id === userId);
    if (userToEdit) {
      setIsEditMode(true);
      setSelectedUser(userToEdit);
      setOpenDialog(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this Admin?")) {
      try {
        const { error } = await supabase
          .from("users")
          .delete()
          .eq("id", userId);

        if (error) throw error;

        // Update local state
        setUsers(users.filter((user) => user.id !== userId));
        toast.success("Admin deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete Admin");
      }
    }
  };

  const handleAssignUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToAssign(user);
      setOpenAssignDialog(true);
    }
  };

  const handleAssignToSociety = async (userId, societyId) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          society_id: societyId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, society_id: societyId } : user
        )
      );

      toast.success(
        societyId
          ? "Society assignment updated successfully!"
          : "Society removed successfully!"
      );
    } catch (error) {
      console.error("Error assigning society:", error);
      toast.error("Failed to update society assignment");
      throw error;
    }
  };

  const handleSubmitUser = async (userData) => {
    try {
      if (isEditMode && selectedUser) {
        // Update existing Admin
        const { error } = await supabase
          .from("users")
          .update({
            name: userData.name,
            email: userData.email,
            phone: userData.contact,
            number: userData.contact,
            whatsapp_number: userData.whatsapp,
            role_type: "Admin",
            status: userData.status,
            society_id: userData.society_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedUser.id);

        if (error) throw error;
        toast.success("Admin updated successfully!");
      } else {
        const { error } = await supabase.from("users").insert({
          name: userData.name,
          email: userData.email,
          phone: userData.contact,
          number: userData.contact,
          whatsapp_number: userData.whatsapp,
          role_type: "Admin",
          status: userData.status,
          society_id: userData.society_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success("Admin added successfully!");
      }

      // Refresh data
      fetchData();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving Admin:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} Admin`);
      throw error;
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      society: "all",
      status: "all",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <Typography
                  variant="h4"
                  className="font-roboto font-bold text-primary mb-2"
                >
                  Admin Management
                </Typography>
                <Typography className="font-roboto text-gray-600">
                  Manage and monitor all Admin
                </Typography>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="inline-block"
              >
                <button
                  onClick={handleAddUser}
                  className="
                                       group
                                       bg-white
                                       font-roboto
                                       font-medium
                                       px-8
                                       py-3.5
                                       text-primary
                                       text-sm
                                       rounded-xl
                                       border-2
                                       border-primary
                                       hover:bg-primary
                                       hover:text-white
                                       transition-all
                                       duration-300
                                       relative
                                       overflow-hidden
                                       flex
                                       items-center
                                       gap-3
                                       shadow-sm
                                       hover:shadow-md
                                     "
                >
                  {/* Underline animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary group-hover:bg-white"
                    initial={{ width: "0%" }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />

                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="tracking-wide">Add New Admin</span>

                  {/* Hover fill effect */}
                  <div
                    className="
                                         absolute
                                         inset-0
                                         bg-primary
                                         transform
                                         -translate-x-full
                                         group-hover:translate-x-0
                                         transition-transform
                                         duration-300
                                         -z-10
                                       "
                  />
                </button>
              </motion.div>
            </div>
          </div>

          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(111, 11, 20, 0.08)",
              border: "1px solid",
              borderColor: alpha("#6F0B14", 0.1),
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Search Field */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search Admins by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "#6F0B14" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                          sx={{ mr: -1 }}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      height: 48,
                    },
                  }}
                />
              </Grid>

              {/* Society Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Society</InputLabel>
                  <Select
                    value={filters.society}
                    onChange={(e) =>
                      setFilters({ ...filters, society: e.target.value })
                    }
                    label="Society"
                  >
                    <MenuItem value="all">All Societies</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="unassigned">Unassigned</MenuItem>
                    {societies.map((society) => (
                      <MenuItem key={society.id} value={society.id}>
                        {society.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {statusOptions.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Active Filters Indicator */}
            {(searchTerm ||
              filters.society !== "all" ||
              filters.status !== "all") && (
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => setSearchTerm("")}
                    size="small"
                    sx={{
                      backgroundColor: alpha("#6F0B14", 0.1),
                      color: "#6F0B14",
                      fontWeight: 500,
                    }}
                  />
                )}
                {filters.society !== "all" && (
                  <Chip
                    label={`Society: ${
                      filters.society === "assigned"
                        ? "Assigned"
                        : filters.society === "unassigned"
                        ? "Unassigned"
                        : getSocietyName(filters.society) || filters.society
                    }`}
                    onDelete={() => setFilters({ ...filters, society: "all" })}
                    size="small"
                    sx={{
                      backgroundColor: alpha("#2e7d32", 0.1),
                      color: "#2e7d32",
                      fontWeight: 500,
                    }}
                  />
                )}
                {filters.status !== "all" && (
                  <Chip
                    label={`Status: ${
                      statusOptions.find((s) => s.value === filters.status)
                        ?.label || filters.status
                    }`}
                    onDelete={() => setFilters({ ...filters, status: "all" })}
                    size="small"
                    sx={{
                      backgroundColor: alpha("#ed6c02", 0.1),
                      color: "#ed6c02",
                      fontWeight: 500,
                    }}
                  />
                )}
                <Button
                  size="small"
                  onClick={handleClearFilters}
                  sx={{
                    textTransform: "none",
                    color: "#6F0B14",
                    fontWeight: 500,
                  }}
                >
                  Clear All
                </Button>
              </Box>
            )}
          </Paper>

          {/* Admins Table */}
          <Paper
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid",
              borderColor: alpha("#6F0B14", 0.1),
            }}
          >
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={8}
              >
                <CircularProgress sx={{ color: "#6F0B14" }} />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <Box textAlign="center" py={8}>
                <AdminPanelSettings
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Admins found
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {searchTerm ||
                  filters.society !== "all" ||
                  filters.status !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add your first Admin to get started"}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddUser}
                  sx={{
                    backgroundColor: "#6F0B14",
                    "&:hover": {
                      backgroundColor: alpha("#6F0B14", 0.9),
                    },
                  }}
                >
                  Add New Admin
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: alpha("#6F0B14", 0.05) }}>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: 600, color: "#6F0B14", width: 60 }}
                        ></TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          Number
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          WhatsApp
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          Society
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: "#6F0B14" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {filteredUsers.map((user) => (
                          <CollapsibleRow
                            key={user.id}
                            user={user}
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                            onAssign={handleAssignUser}
                            societyName={getSocietyName(user.society_id)}
                          />
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Results Count */}
                {!loading && filteredUsers.length > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      borderTop: `1px solid ${alpha("#6F0B14", 0.1)}`,
                      backgroundColor: alpha("#6F0B14", 0.02),
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Showing <strong>{filteredUsers.length}</strong> of{" "}
                      <strong>{users.length}</strong> Admin
                      {users.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </motion.div>

        <UserDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={handleSubmitUser}
          isEdit={isEditMode}
          userData={selectedUser}
          roleTypes={roleTypes}
          statusOptions={statusOptions}
          societies={societies}
        />

        <AssignSocietyDialog
          open={openAssignDialog}
          onClose={() => setOpenAssignDialog(false)}
          onSubmit={handleAssignToSociety}
          societies={societies}
          user={userToAssign}
        />
      </Container>
    </Box>
  );
}
