import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Avatar,
  TablePagination,
  Tooltip,
  Badge,
  Skeleton,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  DirectionsCar as CarIcon,
  LocalShipping as DeliveryIcon,
  Person as PersonIcon,
  Build as MaintenanceIcon,
  MoreHoriz as OtherIcon,
  AccessTime as InTimeIcon,
  ExitToApp as OutTimeIcon,
  Home as HomeIcon,
  Business as BuildingIcon,
  Apartment as ApartmentIcon,
  Download as DownloadIcon,
  FilterAlt as FilterAltIcon,
  Image as ImageIcon,
  Margin,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";
import { supabase } from "../../api/supabaseClient";

// Styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #6F0B14 0%, #8A0F1B 60%, #6F0B14 100%)",
  color: "#FFFFFF",
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 600,
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "15px",
  letterSpacing: "0.4px",
  boxShadow: "0 6px 18px rgba(111, 11, 20, 0.25)",
  "&:hover": {
    background:
      "linear-gradient(135deg, #8A0F1B 0%, #A51423 60%, #8A0F1B 100%)",
    boxShadow: "0 10px 26px rgba(111, 11, 20, 0.35)",
    transform: "translateY(-1px)",
  },
  "&:active": { transform: "translateY(0)" },
  "&:disabled": {
    background: "#E5E7EB",
    color: "#9CA3AF",
    boxShadow: "none",
    transform: "none",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(111, 11, 20, 0.08)",
  background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
  border: "1px solid rgba(111, 11, 20, 0.1)",
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  ...(status === "Approved" && {
    backgroundColor: "#E6F4E6",
    color: "#008000",
  }),
  ...(status === "Pending" && {
    backgroundColor: "#FFF8E1",
    color: "#DBA400",
  }),
  ...(status === "Rejected" && {
    backgroundColor: "#FDE8E8",
    color: "#B31B1B",
  }),
  ...(status === "Reschedule" && {
    backgroundColor: "#FFE5CC",
    color: "#E86100",
  }),
  ...(status === "Checkout" && {
    backgroundColor: "#E3F2FD",
    color: "#1565C0",
  }),
  ...(status === "PartialCheckout" && {
    backgroundColor: "#E8EAF6",
    color: "#3F51B5",
  }),
}));

const VisitorTypeIcon = ({ type }) => {
  switch (type) {
    case "Delivery":
      return <DeliveryIcon fontSize="small" />;
    case "Cab":
      return <CarIcon fontSize="small" />;
    case "Maintenance":
      return <MaintenanceIcon fontSize="small" />;
    case "Other":
      return <OtherIcon fontSize="small" />;
    default:
      return <PersonIcon fontSize="small" />;
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// Helper function to get image URL
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's already a full URL
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // If it's a Supabase storage path, construct the URL
  if (imageUrl.startsWith("visitors/")) {
    const { data } = supabase.storage.from("images").getPublicUrl(imageUrl);
    return data?.publicUrl || null;
  }

  return null;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch {
    return "Invalid Date";
  }
};

// Helper function to format time difference
const formatTimeAgo = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    } else {
      return "just now";
    }
  } catch {
    return "Invalid Date";
  }
};

export default function PmVisitors() {
  // State variables
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pmId, setPmId] = useState(null);
  const [assignedSocieties, setAssignedSocieties] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [imageLoading, setImageLoading] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");
  const [societyFilter, setSocietyFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    checkout: 0,
    today: 0,
  });

  // Fetch PM ID and assigned societies
  useEffect(() => {
    const fetchPMData = async () => {
      const profileId = localStorage.getItem("profileId");
      if (!profileId) {
        setError("Please login to access visitor data.");
        setLoading(false);
        return;
      }
      setPmId(profileId);
      await fetchAssignedSocieties(profileId);
    };
    fetchPMData();
  }, []);

  // Fetch assigned societies
  const fetchAssignedSocieties = async (pmId) => {
    try {
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", pmId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setAssignedSocieties([]);
        setError("No societies are assigned to you yet.");
        setLoading(false);
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name")
        .in("id", societyIds)
        .order("name");

      if (societiesError) throw societiesError;

      setAssignedSocieties(societiesData || []);

      // Fetch visitors for these societies
      await fetchVisitors(societyIds);
    } catch (error) {
      console.error("Error fetching assigned societies:", error);
      setError("Failed to load your assigned societies.");
      setLoading(false);
    }
  };

  // Fetch visitors for assigned societies
  const fetchVisitors = async (societyIds) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visitors")
        .select(
          `
          *,
          buildings(name),
          societies(name),
          flats(flat_number)
        `,
        )
        .in("society_id", societyIds)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process image URLs
      const processedVisitors = data.map((visitor) => ({
        ...visitor,
        imageUrl: getImageUrl(visitor.image_url),
        idProofImageUrl: getImageUrl(visitor.id_proof_image),
      }));

      setVisitors(processedVisitors || []);
      setFilteredVisitors(processedVisitors || []);
      updateStats(processedVisitors || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching visitors:", error);
      setError("Failed to load visitor data.");
      setVisitors([]);
      setFilteredVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (visitorsData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statsData = {
      total: visitorsData.length,
      pending: visitorsData.filter((v) => v.approved_status === "Pending")
        .length,
      approved: visitorsData.filter((v) => v.approved_status === "Approved")
        .length,
      rejected: visitorsData.filter((v) => v.approved_status === "Rejected")
        .length,
      checkout: visitorsData.filter((v) => v.approved_status === "Checkout")
        .length,
      today: visitorsData.filter((v) => {
        const visitDate = new Date(v.created_at);
        visitDate.setHours(0, 0, 0, 0);
        return visitDate.getTime() === today.getTime();
      }).length,
    };
    setStats(statsData);
  };

  // Apply filters
  useEffect(() => {
    let result = [...visitors];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (visitor) =>
          visitor.visitor_name.toLowerCase().includes(term) ||
          visitor.phone_number?.toLowerCase().includes(term) ||
          visitor.vehicle_number?.toLowerCase().includes(term) ||
          visitor.flat_number?.toLowerCase().includes(term) ||
          visitor.card_number?.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (visitor) => visitor.approved_status === statusFilter,
      );
    }

    // Visitor type filter
    if (visitorTypeFilter !== "all") {
      result = result.filter(
        (visitor) => visitor.visitor_type === visitorTypeFilter,
      );
    }

    // Society filter
    if (societyFilter !== "all") {
      result = result.filter(
        (visitor) => visitor.society_id.toString() === societyFilter,
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case "today":
          result = result.filter((visitor) => {
            const visitDate = new Date(visitor.created_at);
            visitDate.setHours(0, 0, 0, 0);
            return visitDate.getTime() === today.getTime();
          });
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          result = result.filter((visitor) => {
            const visitDate = new Date(visitor.created_at);
            return visitDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          result = result.filter((visitor) => {
            const visitDate = new Date(visitor.created_at);
            return visitDate >= monthAgo;
          });
          break;
      }
    }

    setFilteredVisitors(result);
    setPage(0);
  }, [
    visitors,
    searchTerm,
    statusFilter,
    visitorTypeFilter,
    societyFilter,
    dateFilter,
  ]);

  // Handle view visitor details
  const handleViewVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setViewDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (pmId) {
      await fetchAssignedSocieties(pmId);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle image load
  const handleImageLoad = (id) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };

  // Handle image error
  const handleImageError = (id) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: "#6F0B14" }} />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: "#6F0B14",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 400,
                mb: 1,
              }}
            >
              Visitor Log
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#A29EB6", fontFamily: "'Roboto', sans-serif" }}
            >
              Manage visitors for your assigned societies
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                color: "#6F0B14",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                backgroundColor: "rgba(111, 11, 20, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(111, 11, 20, 0.12)",
                },
                borderRadius: "8px",
                px: 3,
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      {/* <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {[
            {
              label: "Total Visitors",
              value: stats.total,
              color: "#6F0B14",
              icon: <PersonIcon />,
              description: "All time visitors",
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "#DBA400",
              icon: <ScheduleIcon />,
              description: "Awaiting approval",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "#008000",
              icon: <CheckCircleIcon />,
              description: "Active visits",
            },
            {
              label: "Today",
              value: stats.today,
              color: "#1565C0",
              icon: <AccessTimeIcon />,
              description: "Visitors today",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: "#B31B1B",
              icon: <CancelIcon />,
              description: "Rejected visits",
            },
            {
              label: "Checked Out",
              value: stats.checkout,
              color: "#3F51B5",
              icon: <ExitToAppIcon />,
              description: "Completed visits",
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <motion.div variants={itemVariants}>
                <StyledCard>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: stat.color,
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#6F0B14",
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 600,
                            mb: 0.5,
                          }}
                        >
                          {stat.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#A29EB6",
                            fontFamily: "'Roboto', sans-serif",
                          }}
                        >
                          {stat.description}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          backgroundColor: `${stat.color}15`,
                          borderRadius: "12px",
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: {
                            color: stat.color,
                            fontSize: 28,
                          },
                        })}
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div> */}

      {/* Filters Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{ mb: 3 }}
        style={{ marginBottom: "50px" }}
      >
        <StyledCard>
          <CardContent sx={{ p: 2.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#6F0B14",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FilterAltIcon /> Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by name, phone, vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#6F0B14" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      backgroundColor: "rgba(111, 11, 20, 0.03)",
                    },
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    }}
                  >
                    Status
                  </InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      backgroundColor: "rgba(111, 11, 20, 0.03)",
                    }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Reschedule">Reschedule</MenuItem>
                    <MenuItem value="Checkout">Checkout</MenuItem>
                    <MenuItem value="PartialCheckout">
                      Partial Checkout
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    }}
                  >
                    Visitor Type
                  </InputLabel>
                  <Select
                    value={visitorTypeFilter}
                    onChange={(e) => setVisitorTypeFilter(e.target.value)}
                    label="Visitor Type"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      backgroundColor: "rgba(111, 11, 20, 0.03)",
                    }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="Guest">Guest</MenuItem>
                    <MenuItem value="Delivery">Delivery</MenuItem>
                    <MenuItem value="Cab">Cab</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    }}
                  >
                    Society
                  </InputLabel>
                  <Select
                    value={societyFilter}
                    onChange={(e) => setSocietyFilter(e.target.value)}
                    label="Society"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      backgroundColor: "rgba(111, 11, 20, 0.03)",
                    }}
                  >
                    <MenuItem value="all">All Societies</MenuItem>
                    {assignedSocieties.map((society) => (
                      <MenuItem key={society.id} value={society.id.toString()}>
                        {society.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    }}
                  >
                    Date Range
                  </InputLabel>
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    label="Date Range"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      backgroundColor: "rgba(111, 11, 20, 0.03)",
                    }}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#A29EB6",
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: "italic",
                }}
              >
                Showing {filteredVisitors.length} of {visitors.length} visitors
              </Typography>
              <Button
                variant="text"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setVisitorTypeFilter("all");
                  setSocietyFilter("all");
                  setDateFilter("all");
                }}
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#6F0B14",
                  textTransform: "none",
                }}
              >
                Clear all filters
              </Button>
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Visitors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <StyledCard>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "rgba(111, 11, 20, 0.05)",
                      "& th": {
                        borderBottom: "2px solid rgba(111, 11, 20, 0.1)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        color: "#6F0B14",
                        fontSize: "0.95rem",
                      }}
                    >
                      Visitor Details
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        color: "#6F0B14",
                        fontSize: "0.95rem",
                      }}
                    >
                      Location
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        color: "#6F0B14",
                        fontSize: "0.95rem",
                      }}
                    >
                      Visit Info
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        color: "#6F0B14",
                        fontSize: "0.95rem",
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        color: "#6F0B14",
                        fontSize: "0.95rem",
                      }}
                    >
                      Timeline
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 700,
                        color: "#6F0B14",
                        fontSize: "0.95rem",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredVisitors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ textAlign: "center", py: 4 }}>
                            <PersonIcon
                              sx={{
                                fontSize: 64,
                                color: "#A29EB6",
                                mb: 2,
                              }}
                            />
                            <Typography
                              variant="h6"
                              sx={{
                                color: "#666",
                                fontFamily: "'Roboto', sans-serif",
                                mb: 1,
                              }}
                            >
                              No visitors found
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#A29EB6",
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              {searchTerm
                                ? `No visitors match "${searchTerm}"`
                                : "No visitor records available"}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVisitors
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage,
                        )
                        .map((visitor) => (
                          <motion.tr
                            key={visitor.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            sx={{
                              "&:hover": {
                                backgroundColor: "rgba(111, 11, 20, 0.02)",
                              },
                              "& td": {
                                borderBottom:
                                  "1px solid rgba(111, 11, 20, 0.08)",
                              },
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                  }}
                                  badgeContent={
                                    <Box
                                      sx={{
                                        backgroundColor: visitor.imageUrl
                                          ? "#6F0B14"
                                          : "transparent",
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                      }}
                                    />
                                  }
                                >
                                  {imageLoading[visitor.id] ? (
                                    <Skeleton
                                      variant="circular"
                                      width={48}
                                      height={48}
                                      sx={{
                                        bgcolor: "rgba(111, 11, 20, 0.08)",
                                      }}
                                    />
                                  ) : (
                                    <Avatar
                                      src={visitor.imageUrl}
                                      onLoad={() => handleImageLoad(visitor.id)}
                                      onError={() =>
                                        handleImageError(visitor.id)
                                      }
                                      sx={{
                                        width: 55,
                                        height: 55,
                                        bgcolor: visitor.imageUrl
                                          ? "transparent"
                                          : "rgba(111, 11, 20, 0.1)",
                                        fontSize: "1.25rem",
                                      }}
                                    >
                                      {!visitor.imageUrl &&
                                        visitor.visitor_name.charAt(0)}
                                    </Avatar>
                                  )}
                                </Badge>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontFamily: "'Roboto', sans-serif",
                                      fontWeight: 600,
                                      color: "#333",
                                      mb: 0.5,
                                    }}
                                  >
                                    {visitor.visitor_name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#A29EB6",
                                      fontFamily: "'Roboto', sans-serif",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <PersonIcon fontSize="small" />
                                    {visitor.phone_number || "No phone"}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mb={1}
                                >
                                  <ApartmentIcon
                                    fontSize="small"
                                    sx={{ color: "#6F0B14" }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: "'Roboto', sans-serif",
                                      fontWeight: 500,
                                      color: "#333",
                                    }}
                                  >
                                    {visitor.societies?.name ||
                                      "Unknown Society"}
                                  </Typography>
                                </Box>
                                <Box>
                                  {visitor.buildings && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#666",
                                        fontFamily: "'Roboto', sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 0.5,
                                      }}
                                    >
                                      <BuildingIcon fontSize="small" />
                                      {visitor.buildings.name}
                                    </Typography>
                                  )}
                                  {visitor.flat_number && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#666",
                                        fontFamily: "'Roboto', sans-serif",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                      }}
                                    >
                                      <HomeIcon fontSize="small" />
                                      Flat: {visitor.flat_number}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mb={1}
                                >
                                  <VisitorTypeIcon
                                    type={visitor.visitor_type}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontFamily: "'Roboto', sans-serif",
                                      fontWeight: 500,
                                      color: "#333",
                                    }}
                                  >
                                    {visitor.visitor_type || "Guest"}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#666",
                                    fontFamily: "'Roboto', sans-serif",
                                    fontStyle: "italic",
                                    display: "block",
                                    mb: 0.5,
                                  }}
                                >
                                  {visitor.purpose || "No purpose specified"}
                                </Typography>
                                {visitor.vehicle_number && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#666",
                                      fontFamily: "'Roboto', sans-serif",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <CarIcon fontSize="small" />
                                    {visitor.vehicle_number}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <StatusChip
                                  label={visitor.approved_status || "Pending"}
                                  status={visitor.approved_status}
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                {visitor.visitor_otp && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: "'Roboto', sans-serif",
                                      color: "#6F0B14",
                                      fontWeight: 500,
                                      display: "block",
                                    }}
                                  >
                                    OTP: {visitor.visitor_otp}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: 500,
                                    color: "#333",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mb: 0.5,
                                  }}
                                >
                                  <InTimeIcon fontSize="small" />
                                  In: {formatDate(visitor.in_time)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "#A29EB6",
                                    fontFamily: "'Roboto', sans-serif",
                                    fontStyle: "italic",
                                    display: "block",
                                    mb: 1,
                                  }}
                                >
                                  {formatTimeAgo(visitor.in_time)}
                                </Typography>
                                {visitor.checkout_at && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#1565C0",
                                      fontFamily: "'Roboto', sans-serif",
                                      fontWeight: 500,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <OutTimeIcon fontSize="small" />
                                    Out: {formatDate(visitor.checkout_at)}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewVisitor(visitor)}
                                  sx={{
                                    color: "#6F0B14",
                                    backgroundColor: "rgba(111, 11, 20, 0.08)",
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(111, 11, 20, 0.15)",
                                    },
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </motion.tr>
                        ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredVisitors.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredVisitors.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  borderTop: "1px solid rgba(111, 11, 20, 0.1)",
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    {
                      fontFamily: "'Roboto', sans-serif",
                    },
                }}
              />
            )}
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Visitor Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            overflow: "hidden",
          },
        }}
      >
        {selectedVisitor && (
          <>
            <DialogTitle
              sx={{
                fontFamily: "'Roboto', sans-serif",
                color: "#6F0B14",
                backgroundColor: "rgba(111, 11, 20, 0.05)",
                borderBottom: "1px solid rgba(111, 11, 20, 0.1)",
                fontWeight: 600,
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <PersonIcon />
                Visitor Details
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={selectedVisitor.imageUrl}
                        sx={{
                          width: 140,
                          height: 140,
                          bgcolor: selectedVisitor.imageUrl
                            ? "transparent"
                            : "rgba(111, 11, 20, 0.1)",
                          fontSize: "2.5rem",
                          border: "3px solid rgba(111, 11, 20, 0.1)",
                        }}
                      >
                        {!selectedVisitor.imageUrl &&
                          selectedVisitor.visitor_name.charAt(0)}
                      </Avatar>
                      {!selectedVisitor.imageUrl && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            backgroundColor: "#6F0B14",
                            color: "white",
                            borderRadius: "50%",
                            p: 0.5,
                          }}
                        >
                          <ImageIcon fontSize="small" />
                        </Box>
                      )}
                    </Box>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {selectedVisitor.visitor_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        {selectedVisitor.phone_number || "No phone number"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    {/* Row 1: Society & Building */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Society
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ApartmentIcon
                          fontSize="small"
                          sx={{ color: "#6F0B14" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {selectedVisitor.societies?.name || "Unknown"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Building
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BuildingIcon
                          fontSize="small"
                          sx={{ color: "#6F0B14" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {selectedVisitor.buildings?.name || "Not specified"}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Row 2: Flat & Visitor Type */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Flat Number
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <HomeIcon fontSize="small" sx={{ color: "#6F0B14" }} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {selectedVisitor.flat_number || "Not specified"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Visitor Type
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <VisitorTypeIcon type={selectedVisitor.visitor_type} />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {selectedVisitor.visitor_type || "Guest"}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Row 3: Purpose */}
                    <Grid item xs={12}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Purpose of Visit
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          backgroundColor: "rgba(111, 11, 20, 0.05)",
                          p: 1.5,
                          borderRadius: "8px",
                        }}
                      >
                        {selectedVisitor.purpose || "Not specified"}
                      </Typography>
                    </Grid>

                    {/* Row 4: Vehicle & Card */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Vehicle Number
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {selectedVisitor.vehicle_number || "No vehicle"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Card Number
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {selectedVisitor.card_number || "No card issued"}
                      </Typography>
                    </Grid>

                    {/* Row 5: Time Information */}
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Entry Time
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <InTimeIcon
                          fontSize="small"
                          sx={{ color: "#6F0B14" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(selectedVisitor.in_time)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Checkout Time
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <OutTimeIcon
                          fontSize="small"
                          sx={{ color: "#6F0B14" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                            color: selectedVisitor.checkout_at
                              ? "#1565C0"
                              : "#666",
                          }}
                        >
                          {selectedVisitor.checkout_at
                            ? formatDate(selectedVisitor.checkout_at)
                            : "Not checked out"}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Row 6: Status */}
                    <Grid item xs={12}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A29EB6",
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Status
                      </Typography>
                      <StatusChip
                        label={selectedVisitor.approved_status || "Pending"}
                        status={selectedVisitor.approved_status}
                        sx={{ fontSize: "0.9rem", px: 2 }}
                      />
                    </Grid>

                    {/* Row 7: Reason (if available) */}
                    {selectedVisitor.rejected_reschedule_reason && (
                      <Grid item xs={12}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#A29EB6",
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Reason
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            color: "#B31B1B",
                            backgroundColor: "rgba(179, 27, 27, 0.05)",
                            p: 1.5,
                            borderRadius: "8px",
                            fontStyle: "italic",
                          }}
                        >
                          {selectedVisitor.rejected_reschedule_reason}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                p: 2,
                backgroundColor: "rgba(111, 11, 20, 0.02)",
                borderTop: "1px solid rgba(111, 11, 20, 0.1)",
              }}
            >
              <Button
                onClick={() => setViewDialogOpen(false)}
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#6F0B14",
                  borderRadius: "8px",
                  px: 3,
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
