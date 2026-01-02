import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
  Collapse,
  Box,
  Alert,
  Button,
  CircularProgress,
  TablePagination,
  FormControlLabel,
  Switch,
  styled,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Delete,
  Search,
  FilterList,
  Add as AddIcon,
  Refresh,
  MoreVert,
  LocationOn,
  Phone,
  WhatsApp,
  Email,
  Business,
  CalendarToday,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../api/supabaseClient";
import AddManagerDialog from "../../components/dialogs/AddManagerDialog";
import { toast } from "react-toastify";

// Custom styled switch for property managers
const PrimarySwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#6F0B14",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#6F0B14",
  },
  "& .MuiSwitch-switchBase.Mui-checked:hover": {
    backgroundColor: "rgba(111, 11, 20, 0.08)",
  },
}));

// Debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

const statusColors = {
  active: "#93BD57",
  inactive: "#F96E5B",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
};

const PropertyManagerRow = ({
  manager,
  onEdit,
  onDelete,
  onStatusToggle,
  isExpanded,
  onToggleRow,
}) => {
  const currentStatus = manager.status || "inactive";
  const isRowDisabled = currentStatus === "inactive";

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          opacity: isRowDisabled ? 0.6 : 1,
          backgroundColor: isRowDisabled ? "rgba(0,0,0,0.02)" : "inherit",
          "&:hover": {
            backgroundColor: isRowDisabled
              ? "rgba(0,0,0,0.04)"
              : "rgba(111, 11, 20, 0.04)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <TableCell className="p-4">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => onToggleRow(manager.id)}
            disabled={isRowDisabled}
            className="text-primary hover:bg-lightBackground"
            sx={{
              "&:hover": { backgroundColor: "rgba(111, 11, 20, 0.1)" },
            }}
          >
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        <TableCell className="p-4">
          <Typography className="font-roboto font-semibold text-sm text-gray-800">
            #{manager.id.toString().padStart(3, "0")}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="font-roboto font-semibold"
              sx={{
                bgcolor: isRowDisabled ? "#9ca3af" : "#6F0B14",
                color: "white",
                width: 40,
                height: 40,
                fontSize: "0.875rem",
              }}
            >
              {manager.avatar}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold text-sm"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {manager.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                ID: {manager.id.toString().padStart(3, "0")}
              </Typography>
            </div>
          </div>
        </TableCell>

        <TableCell className="p-4">
          <Typography
            className="font-roboto text-sm break-all"
            sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
          >
            {manager.email}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <Chip
            label={`${manager.assignedBuildings} building${
              manager.assignedBuildings !== 1 ? "s" : ""
            }`}
            className="font-roboto font-medium"
            sx={{
              backgroundColor: isRowDisabled
                ? "rgba(156, 163, 175, 0.1)"
                : "rgba(111, 11, 20, 0.09)",
              color: isRowDisabled ? "#9ca3af" : "#6F0B14",
              opacity: isRowDisabled ? 0.7 : 1,
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          />
        </TableCell>

        <TableCell className="p-4">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: statusColors[currentStatus] + "15",
              border: `1px solid ${statusColors[currentStatus]}30`,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors[currentStatus],
                mr: 1,
              }}
            />
            <Typography
              className="font-roboto font-medium text-xs"
              sx={{ color: statusColors[currentStatus] }}
            >
              {statusLabels[currentStatus]}
            </Typography>
          </Box>
        </TableCell>

        <TableCell className="p-4">
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <PrimarySwitch
                  checked={currentStatus === "active"}
                  onChange={(e) => onStatusToggle(manager.id, currentStatus)}
                  size="small"
                />
              }
              sx={{ m: 0 }}
            />
            <IconButton
              size="small"
              onClick={() => onEdit(manager.id)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(manager.id)}
              disabled={isRowDisabled}
              className="text-reject hover:bg-[rgba(179,27,27,0.09)]"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 3 }}>
              {manager.loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <Typography
                      variant="h6"
                      className="font-roboto font-semibold text-primary"
                    >
                      Manager Details
                    </Typography>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        bgcolor: statusColors[currentStatus] + "20",
                        color: statusColors[currentStatus],
                        border: `1px solid ${statusColors[currentStatus]}40`,
                      }}
                    >
                      {statusLabels[currentStatus]}
                    </Box>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Basic Information */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Basic Information
                        </Typography>
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="font-roboto font-semibold"
                              sx={{
                                bgcolor: "#6F0B14",
                                color: "white",
                                width: 48,
                                height: 48,
                              }}
                            >
                              {manager.avatar}
                            </Avatar>
                            <div>
                              <Typography className="font-roboto font-semibold">
                                {manager.name}
                              </Typography>
                              <Typography className="font-roboto text-sm text-hintText">
                                Property Manager
                              </Typography>
                            </div>
                          </div>
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-start gap-2">
                              <Email
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Email
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {manager.email}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CalendarToday
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Register Date
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {manager.registerDate}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Contact Information
                        </Typography>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 mt-2">
                            <Phone
                              className="text-primary mt-0.5"
                              fontSize="small"
                            />
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                Contact Number
                              </Typography>
                              <Typography className="font-roboto text-sm">
                                {manager.address.contact}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <WhatsApp
                              className="text-green-600 mt-0.5"
                              fontSize="small"
                            />
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                WhatsApp
                              </Typography>
                              <Typography className="font-roboto text-sm">
                                {manager.address.whatsapp}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance & Stats */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Performance & Stats
                        </Typography>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-lightBackground rounded-lg">
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                Assigned Buildings
                              </Typography>
                              <Typography className="font-roboto font-semibold text-2xl text-primary">
                                {manager.assignedBuildings}
                              </Typography>
                            </div>
                            <Business className="text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-200"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => onDelete(manager.id)}
                      disabled={isRowDisabled}
                      className="font-roboto font-medium border-reject text-reject hover:bg-[rgba(179,27,27,0.04)]"
                      sx={{ textTransform: "none" }}
                    >
                      Remove Manager
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => onEdit(manager.id)}
                      disabled={isRowDisabled}
                      className="font-roboto font-medium bg-primary hover:bg-[#5a090f]"
                      sx={{ textTransform: "none" }}
                    >
                      Edit Manager
                    </Button>
                  </motion.div>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

// Mobile Card View
const PropertyManagerCard = ({ manager, onEdit, onDelete, onStatusToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const currentStatus = manager.status || "inactive";
  const isRowDisabled = currentStatus === "inactive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-3"
      style={{ opacity: isRowDisabled ? 0.7 : 1 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="font-roboto font-semibold"
              sx={{
                bgcolor: isRowDisabled ? "#9ca3af" : "#6F0B14",
                color: "white",
                width: 48,
                height: 48,
              }}
            >
              {manager.avatar}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {manager.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                #{manager.id.toString().padStart(3, "0")}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <PrimarySwitch
                  checked={currentStatus === "active"}
                  onChange={(e) => onStatusToggle(manager.id, currentStatus)}
                  size="small"
                />
              }
              sx={{ m: 0 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Email
            </Typography>
            <Typography className="font-roboto text-sm font-medium break-all">
              {manager.email}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Buildings
            </Typography>
            <Chip
              label={manager.assignedBuildings}
              className="font-roboto font-medium"
              sx={{
                backgroundColor: "rgba(111, 11, 20, 0.09)",
                color: "#6F0B14",
              }}
              size="small"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Register Date
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {manager.registerDate}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Status
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: statusColors[currentStatus] + "15",
                border: `1px solid ${statusColors[currentStatus]}30`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: statusColors[currentStatus],
                  mr: 1,
                }}
              />
              <Typography
                className="font-roboto font-medium text-xs"
                sx={{ color: statusColors[currentStatus] }}
              >
                {statusLabels[currentStatus]}
              </Typography>
            </Box>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <IconButton
              size="small"
              onClick={() => onEdit(manager.id)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(manager.id)}
              disabled={isRowDisabled}
              className="text-reject hover:bg-[rgba(179,27,27,0.09)]"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            className="font-roboto font-medium text-primary"
            endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            sx={{ textTransform: "none" }}
          >
            {expanded ? "Show Less" : "View Details"}
          </Button>
        </div>
      </div>

      <Collapse in={expanded}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-gray-50 border-t border-gray-200"
        >
          <Typography className="font-roboto font-semibold text-primary mb-3">
            Contact Details
          </Typography>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <LocationOn className="text-primary mt-0.5" fontSize="small" />
              <div>
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Location
                </Typography>
                <Typography className="font-roboto text-sm">
                  {manager.address.city}, {manager.address.state},{" "}
                  {manager.address.country}
                </Typography>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Phone className="text-primary mt-0.5" fontSize="small" />
              <div>
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Contact
                </Typography>
                <Typography className="font-roboto text-sm">
                  {manager.address.contact}
                </Typography>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <WhatsApp className="text-green-600 mt-0.5" fontSize="small" />
              <div>
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  WhatsApp
                </Typography>
                <Typography className="font-roboto text-sm">
                  {manager.address.whatsapp}
                </Typography>
              </div>
            </div>
          </div>
        </motion.div>
      </Collapse>
    </motion.div>
  );
};

export default function PropertyManager() {
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);

  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedManager, setSelectedManager] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchManagers = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select(
        `
      id,
      name,
      email,
      number,
      whatsapp_number,
      role_type,
      is_active,
      created_at
    `
      )
      .eq("role_type", "Manager")
      .eq("is_delete", false);

    if (error) {
      console.error(error);
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const mappedManagers = data.map((m) => ({
      id: m.id,
      name: m.name || "-",
      email: m.email || "-",
      assignedBuildings: 0,
      status: m.is_active ? "active" : "inactive",
      registerDate: m.created_at
        ? new Date(m.created_at).toISOString().split("T")[0]
        : "-",
      avatar: m.name
        ? m.name
            .split(" ")
            .map((n) => n[0])
            .join("")
        : "U",
      address: {
        contact: m.number || "-",
        whatsapp: m.whatsapp_number || "-",
      },
    }));

    setManagers(mappedManagers);
    setFilteredManagers(mappedManagers);
    setLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  // Table headers
  const headers = ["", "ID", "Name", "Email", "Buildings", "Status", "Actions"];

  // Filter managers based on search and status
  useEffect(() => {
    let filtered = managers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((manager) => manager.status === statusFilter);
    }

    setFilteredManagers(filtered);
    setPage(0); // Reset to first page when filters change
  }, [managers, searchTerm, statusFilter]);

  const handleStatusToggle = useCallback(async (managerId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Optimistic update
    setManagers((prev) =>
      prev.map((manager) =>
        manager.id === managerId ? { ...manager, status: newStatus } : manager
      )
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(
        `Manager ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      setManagers((prev) =>
        prev.map((manager) =>
          manager.id === managerId
            ? { ...manager, status: currentStatus }
            : manager
        )
      );
      toast.error("Failed to update status");
    }
  }, []);

  const handleToggleRow = useCallback(
    (managerId) => {
      const isCurrentlyOpen = openRows[managerId];

      if (isCurrentlyOpen) {
        setOpenRows((prev) => ({ ...prev, [managerId]: false }));
      } else {
        setOpenRows((prev) => ({ ...prev, [managerId]: true }));

        setManagers((prev) =>
          prev.map((manager) =>
            manager.id === managerId ? { ...manager, loading: true } : manager
          )
        );

        setTimeout(() => {
          setManagers((prev) =>
            prev.map((manager) =>
              manager.id === managerId
                ? { ...manager, loading: false }
                : manager
            )
          );
        }, 500);
      }
    },
    [openRows]
  );

  const handleEditManager = (id) => {
    const manager = managers.find((m) => m.id === id);
    setSelectedManager(manager);
    setOpenDialog(true);
  };

  const handleDeleteManager = (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      setManagers((prev) => prev.filter((manager) => manager.id !== id));
      toast.success("Manager deleted successfully!");
    }
  };

  const handleAddNewManager = () => {
    setSelectedManager(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedManager(null);
  };

  const handleManagerSubmit = async () => {
    await fetchManagers();
    setOpenDialog(false);
    setSelectedManager(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const paginatedManagers = filteredManagers.slice(
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Typography
                variant="h4"
                className="font-roboto font-bold text-primary mb-2"
              >
                Property Managers
              </Typography>
              <Typography className="font-roboto text-gray-600">
                Manage and monitor all property managers
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
                onClick={handleAddNewManager}
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
                <span className="tracking-wide">New Manager</span>

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

        {/* Filters and Search Section */}
        <Card className="rounded-xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Typography variant="h6" className="font-roboto font-semibold">
                All Managers ({filteredManagers.length})
              </Typography>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <TextField
                  placeholder="Search managers..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="text-hintText" />
                      </InputAdornment>
                    ),
                    className: "font-roboto rounded-lg",
                  }}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={handleFilterClick}
                    className="font-roboto font-medium border-gray-300 text-gray-700"
                    sx={{ textTransform: "none" }}
                  >
                    Filter
                  </Button>

                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={resetFilters}
                      className="font-roboto font-medium border-gray-300 text-gray-700"
                      sx={{ textTransform: "none" }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => setSearchTerm("")}
                    size="small"
                    className="font-roboto"
                  />
                )}
                {statusFilter !== "all" && (
                  <Chip
                    label={`Status: ${statusLabels[statusFilter]}`}
                    onDelete={() => setStatusFilter("all")}
                    size="small"
                    className="font-roboto"
                    sx={{
                      backgroundColor: statusColors[statusFilter] + "20",
                      color: statusColors[statusFilter],
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Managers Table/Cards */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredManagers.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No property managers found. Add your first manager!
            </Alert>
          ) : (
            <>
              {!isMobile ? (
                // Desktop Table View
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                      <TableRow>
                        {headers.map((header, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              color: "#1E293B",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: "2px solid #E2E8F0",
                              fontSize: "0.75rem",
                              py: 2,
                            }}
                            align={
                              header === "Buildings" ||
                              header === "Status" ||
                              header === "Actions"
                                ? "center"
                                : "left"
                            }
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedManagers.map((manager) => (
                        <PropertyManagerRow
                          key={manager.id}
                          manager={manager}
                          onEdit={handleEditManager}
                          onDelete={handleDeleteManager}
                          onStatusToggle={handleStatusToggle}
                          onToggleRow={handleToggleRow}
                          isExpanded={!!openRows[manager.id]}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // Mobile Card View
                <div className="p-4">
                  <AnimatePresence>
                    {paginatedManagers.map((manager) => (
                      <PropertyManagerCard
                        key={manager.id}
                        manager={manager}
                        onEdit={handleEditManager}
                        onDelete={handleDeleteManager}
                        onStatusToggle={handleStatusToggle}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <Typography className="font-roboto text-sm text-hintText">
                  Showing{" "}
                  {Math.min(page * rowsPerPage + 1, filteredManagers.length)} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredManagers.length)}{" "}
                  of {filteredManagers.length} managers
                </Typography>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredManagers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Rows:"
                  className="font-roboto"
                />
              </Box>
            </>
          )}
        </Card>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem
            onClick={() => handleStatusFilter("all")}
            className="font-roboto"
          >
            All Status
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusFilter("active")}
            className="font-roboto"
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors.active,
                mr: 2,
              }}
            />
            Active Only
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusFilter("inactive")}
            className="font-roboto"
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors.inactive,
                mr: 2,
              }}
            />
            Inactive Only
          </MenuItem>
        </Menu>

        {/* Add/Edit Manager Dialog */}
        <AddManagerDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleManagerSubmit}
          manager={selectedManager}
          isEdit={!!selectedManager}
        />
      </motion.div>
    </div>
  );
}
