import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Switch,
  Tooltip,
  Avatar,
  Badge,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Modal,
  Paper,
  Divider,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
  Add,
  CheckCircle,
  Cancel,
  FilterList,
  Refresh,
  Apartment,
  Business,
  Phone,
  Email,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AddSecurityDialog from "../../components/dialogs/AdminDialogs/AddSecurityDialog";

export default function Security() {
  const [securityGuards, setSecurityGuards] = useState([]);
  const [filteredGuards, setFilteredGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildings, setBuildings] = useState([]);
  const [buildingFilter, setBuildingFilter] = useState("all");
  // Profile dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const societyId = localStorage.getItem("societyId") || "society_id";

  // Theme from your Tailwind config
  const theme = {
    primary: "#6F0B14",
    textAndTab: "#6F0B14",
    hintText: "#A29EB6",
    button: "#6F0B14",
    checkbox: "#6F0B14",
    lightBackground: "rgba(111, 11, 20, 0.09)",
    trackSelect: "rgba(111, 11, 20, 0.44)",
    darkTrackSelect: "rgba(111, 11, 20, 0.61)",
    success: "#008000",
    pending: "#DBA400",
    reschedule: "#E86100",
    reject: "#B31B1B",
    black: "#000000",
    white: "#FFFFFF",
    border: "#e2e8f0",
    background: "#f8fafc",
    cardBg: "#ffffff",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
  };

  useEffect(() => {
    if (!societyId) {
      toast.error("Society ID not found");
      setLoading(false);
      return;
    }
    fetchSecurityGuards();
    fetchBuildings();
  }, [societyId]);

  const fetchSecurityGuards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id, 
          registed_user_id, 
          name, 
          email, 
          number, 
          role_type, 
          building_id, 
          is_active, 
          created_at,
          profile_url,
          buildings (id, name)
        `
        )
        .eq("role_type", "Security")
        .eq("society_id", societyId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const guardsWithDetails = (data || []).map((guard) => ({
        ...guard,
        building_name: guard.buildings?.name || "Not Assigned",
        profile_url: cleanProfileUrl(guard.profile_url),
      }));

      setSecurityGuards(guardsWithDetails);
      setFilteredGuards(guardsWithDetails);
    } catch (error) {
      console.error("Error fetching security guards:", error);
      toast.error("Failed to fetch security guards");
    } finally {
      setLoading(false);
    }
  };

  const cleanProfileUrl = (url) => {
    if (!url) return null;

    try {
      if (url.includes('","path":"')) {
        const match = url.match(/^(.*?)\\"/);
        if (match && match[1]) {
          return match[1];
        }

        const parts = url.split('\\",\\"');
        if (parts.length > 0) {
          return parts[0].replace(/^"|"$/g, "");
        }
      }

      return url;
    } catch (error) {
      console.error("Error cleaning profile URL:", error, url);
      return null;
    }
  };

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name")
        .eq("society_id", societyId)
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name");

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    }
  };

  const extractImageUrl = (urlString) => {
    if (!urlString) return null;

    if (urlString.includes('","path":"')) {
      try {
        const cleanedString = urlString.replace(/\\"/g, '"');
        const jsonStr = `{${cleanedString}}`;
        const parsed = JSON.parse(jsonStr);
        return parsed.url || urlString;
      } catch (e) {
        const urlMatch = urlString.match(/(https?:\/\/[^\\"]+)/);
        return urlMatch ? urlMatch[0] : null;
      }
    }

    return urlString;
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success(
        `Security guard ${newStatus ? "activated" : "deactivated"}!`
      );

      // Update local state
      const updatedGuards = securityGuards.map((guard) =>
        guard.id === userId ? { ...guard, is_active: newStatus } : guard
      );

      setSecurityGuards(updatedGuards);
      applyFilters(updatedGuards, searchTerm, statusFilter, buildingFilter);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this security guard?"))
      return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_delete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Security guard removed!");

      // Remove from local state
      const updatedGuards = securityGuards.filter(
        (guard) => guard.id !== userId
      );
      setSecurityGuards(updatedGuards);
      applyFilters(updatedGuards, searchTerm, statusFilter, buildingFilter);
    } catch (error) {
      console.error("Error deleting security guard:", error);
      toast.error("Failed to delete security guard");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(securityGuards, value, statusFilter, buildingFilter);
    setPage(0);
  };

  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    applyFilters(securityGuards, searchTerm, value, buildingFilter);
    setPage(0);
  };

  const handleBuildingFilterChange = (e) => {
    const value = e.target.value;
    setBuildingFilter(value);
    applyFilters(securityGuards, searchTerm, statusFilter, value);
    setPage(0);
  };

  const applyFilters = (guards, search, status, building) => {
    let filtered = guards;

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (guard) =>
          guard.name?.toLowerCase().includes(search) ||
          guard.email?.toLowerCase().includes(search) ||
          guard.number?.includes(search) ||
          guard.registed_user_id?.toLowerCase().includes(search) ||
          guard.building_name?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (status !== "all") {
      const isActive = status === "active";
      filtered = filtered.filter((guard) => guard.is_active === isActive);
    }

    // Building filter
    if (building !== "all") {
      filtered = filtered.filter((guard) => guard.building_id === building);
    }

    setFilteredGuards(filtered);
  };

  const getStatusStats = () => {
    const active = securityGuards.filter((g) => g.is_active).length;
    const inactive = securityGuards.filter((g) => !g.is_active).length;
    return { active, inactive, total: securityGuards.length };
  };

  const paginatedGuards = filteredGuards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const stats = getStatusStats();

  // Profile Dialog Component
  const ProfileDialog = ({ guard, open, onClose }) => {
    if (!guard) return null;

    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 500 },
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            outline: "none",
          }}
        >
          <Paper elevation={0}>
            {/* Header */}
            <Box className="p-6 pb-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={extractImageUrl(guard.profile_url)}
                  sx={{ width: 164, height: 164 }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <div>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    style={{ color: theme.textPrimary }}
                  >
                    {guard.name || "Unnamed Guard"}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ color: theme.textSecondary }}
                  >
                    Security Guard •{" "}
                    {guard.registed_user_id?.substring(0, 8) || "N/A"}
                  </Typography>
                </div>
              </div>
            </Box>

            <Divider />

            {/* Details */}
            <Box className="p-6 space-y-4">
              <div>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  style={{ color: theme.textPrimary }}
                >
                  Contact Information
                </Typography>
                <Divider className="my-2" />
                <div className="space-y-3 mt-3">
                  <div className="flex items-center gap-3">
                    <Email fontSize="small" style={{ color: theme.hintText }} />
                    <Typography style={{ color: theme.textPrimary }}>
                      {guard.email || "No email provided"}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone fontSize="small" style={{ color: theme.hintText }} />
                    <Typography style={{ color: theme.textPrimary }}>
                      {guard.number || "No phone provided"}
                    </Typography>
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <Typography
                  variant="subtitle2"
                  fontWeight={500}
                  style={{ color: theme.textPrimary }}
                >
                  Assignment Details
                </Typography>
                <Divider className="my-2" />
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>
                      Building:
                    </span>
                    <span style={{ color: theme.textPrimary }}>
                      {guard.building_name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Status:</span>
                    <span>
                      <Chip
                        label={guard.is_active ? "Active" : "Inactive"}
                        size="small"
                        style={{
                          backgroundColor: guard.is_active
                            ? `${theme.success}20`
                            : `${theme.reject}20`,
                          color: guard.is_active ? theme.success : theme.reject,
                        }}
                      />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: theme.textSecondary }}>Joined:</span>
                    <span style={{ color: theme.textPrimary }}>
                      {new Date(guard.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Box>

            {/* Footer */}
            <Divider />
            <Box className="p-4 pt-2 flex justify-end">
              <Button
                onClick={onClose}
                variant="outlined"
                style={{
                  color: theme.primary,
                  borderColor: theme.primary,
                  textTransform: "none",
                }}
              >
                Close
              </Button>
            </Box>
          </Paper>
        </Box>
      </Modal>
    );
  };

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Typography
                variant="h4"
                className="font-bold mb-2"
                style={{ color: theme.textPrimary }}
              >
                Security Management
              </Typography>
              <Typography
                className="text-lg"
                style={{ color: theme.textSecondary }}
              >
                Manage security guards for your society
              </Typography>
            </div>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedGuard(null);
                setOpenDialog(true);
              }}
              style={{
                backgroundColor: theme.primary,
                color: theme.white,
                textTransform: "none",
                fontWeight: 500,
                padding: "10px 24px",
                borderRadius: "8px",
                boxShadow: `0 2px 8px ${theme.primary}20`,
              }}
            >
              Add Security Guard
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Total Guards
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {stats.total}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-red-50"
                    style={{ color: theme.primary }}
                  >
                    <SecurityIcon />
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Active Guards
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.success }}
                    >
                      {stats.active}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-green-50"
                    style={{ color: theme.success }}
                  >
                    <CheckCircle />
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Inactive Guards
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.reject }}
                    >
                      {stats.inactive}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-red-100"
                    style={{ color: theme.reject }}
                  >
                    <Cancel />
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="rounded-lg border shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Typography
                  variant="h6"
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  Security Guards
                  <span
                    className="ml-2 text-sm font-normal"
                    style={{ color: theme.textSecondary }}
                  >
                    ({filteredGuards.length} found)
                  </span>
                </Typography>

                <div className="hidden md:flex items-center gap-3">
                  <FormControl size="small" className="w-32">
                    <InputLabel style={{ color: theme.textSecondary }}>
                      Status
                    </InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      label="Status"
                      style={{ color: theme.textPrimary }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" className="w-40">
                    <InputLabel style={{ color: theme.textSecondary }}>
                      Building
                    </InputLabel>
                    <Select
                      value={buildingFilter}
                      onChange={handleBuildingFilterChange}
                      label="Building"
                      style={{ color: theme.textPrimary }}
                    >
                      <MenuItem value="all">All Buildings</MenuItem>
                      {buildings.map((building) => (
                        <MenuItem key={building.id} value={building.id}>
                          {building.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TextField
                  placeholder="Search by name, email, phone..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full md:w-64"
                  InputProps={{
                    startAdornment: (
                      <Search
                        style={{ color: theme.hintText }}
                        className="mr-2"
                      />
                    ),
                    style: { color: theme.textPrimary },
                  }}
                />
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={fetchSecurityGuards}
                    style={{ color: theme.primary }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Guards Table */}
        <Card className="rounded-lg border shadow-sm overflow-hidden">
          {loading ? (
            <Box className="flex justify-center p-12">
              <CircularProgress style={{ color: theme.primary }} />
            </Box>
          ) : filteredGuards.length === 0 ? (
            <Card className="rounded-xl shadow-sm border m-6">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: theme.lightBackground }}
                  >
                    <SecurityIcon
                      style={{ color: theme.primary, fontSize: "2rem" }}
                    />
                  </div>
                  <div>
                    <Typography
                      variant="h6"
                      style={{
                        color: theme.textPrimary,
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      {searchTerm ||
                      statusFilter !== "all" ||
                      buildingFilter !== "all"
                        ? "No matching security guards found"
                        : "No security guards yet"}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      {searchTerm ||
                      statusFilter !== "all" ||
                      buildingFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Add your first security guard to get started"}
                    </Typography>
                  </div>
                </div>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    setSelectedGuard(null);
                    setOpenDialog(true);
                  }}
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.white,
                    padding: "12px 24px",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: `0 4px 12px ${theme.primary}20`,
                  }}
                >
                  Add Security Guard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead style={{ backgroundColor: theme.lightBackground }}>
                    <TableRow>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Security Guard
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Contact Details
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
                            {guard.profile_url ? (
                              <Tooltip title="View Profile">
                                <Avatar
                                  src={extractImageUrl(guard.profile_url)}
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    cursor: "pointer",
                                    "&:hover": {
                                      boxShadow: `0 4px 12px ${theme.primary}20`,
                                    },
                                  }}
                                  onClick={() => {
                                    setSelectedProfile(guard);
                                    setProfileDialogOpen(true);
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "";
                                  }}
                                >
                                  <SecurityIcon fontSize="small" />
                                </Avatar>
                              </Tooltip>
                            ) : (
                              <Tooltip title="View Profile">
                                <Avatar
                                  className="cursor-pointer hover:bg-red-100 transition-all"
                                  style={{
                                    color: theme.primary,
                                    cursor: "pointer",
                                  }}
                                  sx={{ width: 40, height: 40 }}
                                  onClick={() => {
                                    setSelectedProfile(guard);
                                    setProfileDialogOpen(true);
                                  }}
                                >
                                  <SecurityIcon fontSize="small" />
                                </Avatar>
                              </Tooltip>
                            )}
                            <div>
                              <Typography
                                className="font-semibold"
                                style={{ color: theme.textPrimary }}
                              >
                                {guard.name || "Unnamed Guard"}
                              </Typography>
                              <Typography
                                variant="body2"
                                style={{ color: theme.textSecondary }}
                              >
                                ID:{" "}
                                {guard.registed_user_id?.substring(0, 8) ||
                                  "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                style={{ color: theme.hintText }}
                              >
                                Joined:{" "}
                                {new Date(
                                  guard.created_at
                                ).toLocaleDateString()}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Email
                                fontSize="small"
                                style={{ color: theme.hintText }}
                              />
                              <Typography style={{ color: theme.textPrimary }}>
                                {guard.email || "No email"}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone
                                fontSize="small"
                                style={{ color: theme.hintText }}
                              />
                              <Typography style={{ color: theme.textPrimary }}>
                                {guard.number || "No phone"}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {guard.building_name !== "Not Assigned" ? (
                            <Chip
                              icon={<Apartment />}
                              label={guard.building_name}
                              size="small"
                              className="bg-red-50"
                              style={{ color: theme.primary }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              style={{
                                color: theme.hintText,
                                fontStyle: "italic",
                              }}
                            >
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={guard.is_active}
                              onChange={() =>
                                handleToggleStatus(guard.id, guard.is_active)
                              }
                              size="small"
                              style={{ color: theme.primary }}
                            />
                            <Chip
                              label={guard.is_active ? "Active" : "Inactive"}
                              size="small"
                              style={{
                                backgroundColor: guard.is_active
                                  ? `${theme.success}20`
                                  : `${theme.reject}20`,
                                color: guard.is_active
                                  ? theme.success
                                  : theme.reject,
                                fontWeight: 500,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedGuard(guard);
                                  setOpenDialog(true);
                                }}
                                className="hover:bg-red-50"
                                style={{ color: theme.primary }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(guard.id)}
                                className="hover:bg-red-50"
                                style={{ color: theme.reject }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
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

      {/* Profile Dialog */}
      <ProfileDialog
        guard={selectedProfile}
        open={profileDialogOpen}
        onClose={() => {
          setProfileDialogOpen(false);
          setSelectedProfile(null);
        }}
      />

      {/* Add/Edit Security Dialog */}
      <AddSecurityDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedGuard(null);
        }}
        guard={selectedGuard}
        societyId={societyId}
        buildings={buildings}
        onSuccess={() => {
          fetchSecurityGuards();
          setOpenDialog(false);
          setSelectedGuard(null);
        }}
      />
    </div>
  );
}
