import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Stack,
  Chip,
  Avatar,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Grid,
  Snackbar,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  Home as HomeIcon,
  AccessTime as TimeIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Clear as ClearIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Phone,
  Info,
  History,
  ExitToApp,
  LocalShipping,
  AccessTime,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabaseClient";
import { format, formatDistanceToNow } from "date-fns";

// ── Styled Components ──────────────────────────────────────────────────────────
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "80vh",
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
}));

const MainCard = styled(Card)(() => ({
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(111,11,20,0.10)",
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #6F0B14 0%, #a82834 50%, #6F0B14 100%)",
  color: "#FFFFFF",
  padding: theme.spacing(3, 4),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -30,
    right: -30,
    width: "200px",
    height: "200px",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2, 3) },
}));

const FilterPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: "18px",
  border: "1px solid rgba(111,11,20,0.10)",
  boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
  backgroundColor: "#fff",
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#fff",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#6F0B14" },
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#6F0B14",
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#6F0B14" },
});

const StyledSelect = styled(Select)({
  borderRadius: "12px",
  backgroundColor: "#fafafa",
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#6F0B14" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6F0B14",
    borderWidth: "2px",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderRadius: "12px" },
});

const StatCard = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  borderRadius: "16px",
  border: `1px solid ${color}22`,
  background: `linear-gradient(135deg, ${color}10 0%, #fff 100%)`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  boxShadow: `0 2px 12px ${color}18`,
}));

const StyledTableRow = styled(TableRow)(() => ({
  transition: "background 0.15s",
  "&:hover": { backgroundColor: "rgba(111,11,20,0.03)" },
}));

const ActionButton = styled(Button)(({ theme, actioncolor }) => ({
  borderRadius: "20px",
  padding: "4px 12px",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "none",
  borderColor: actioncolor,
  color: actioncolor,
  "&:hover": {
    borderColor: actioncolor,
    backgroundColor: `${actioncolor}10`,
  },
}));

// ── Status helpers ─────────────────────────────────────────────────────────────
const statusConfig = {
  Approved: {
    color: "#16a34a",
    bg: "#dcfce7",
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
    label: "Approved",
  },
  Pending: {
    color: "#d97706",
    bg: "#fef3c7",
    icon: <ScheduleIcon sx={{ fontSize: 14 }} />,
    label: "Pending",
  },
  Rejected: {
    color: "#dc2626",
    bg: "#fee2e2",
    icon: <CancelIcon sx={{ fontSize: 14 }} />,
    label: "Rejected",
  },
  Reschedule: {
    color: "#9333ea",
    bg: "#f3e8ff",
    icon: <ScheduleIcon sx={{ fontSize: 14 }} />,
    label: "Rescheduled",
  },
  Checkout: {
    color: "#64748b",
    bg: "#f1f5f9",
    icon: <ExitToApp sx={{ fontSize: 14 }} />,
    label: "Checked Out",
  },
};

const getStatusChip = (status) => {
  const cfg = statusConfig[status] || {
    color: "#64748b",
    bg: "#f1f5f9",
    icon: null,
    label: status || "Unknown",
  };
  return (
    <Chip
      label={cfg.label}
      size="small"
      icon={cfg.icon}
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        "& .MuiChip-icon": { color: cfg.color, marginLeft: "4px" },
      }}
    />
  );
};

const getVisitorTypeChip = (type) => {
  const typeConfig = {
    Guest: { icon: <PersonIcon />, color: "#6F0B14" },
    Delivery: { icon: <LocalShipping />, color: "#E86100" },
    Cab: { icon: <LocalShipping />, color: "#008000" },
    Maintenance: { icon: <HomeIcon />, color: "#DBA400" },
    Other: { icon: <Info />, color: "#A29EB6" },
  };

  const config = typeConfig[type] || typeConfig.Other;

  return (
    <Chip
      size="small"
      icon={config.icon}
      label={type}
      sx={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        borderColor: config.color,
        "& .MuiChip-icon": {
          color: config.color,
        },
      }}
      variant="outlined"
    />
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return "—";
  try {
    return format(new Date(timestamp), "dd MMM yyyy, hh:mm a");
  } catch {
    return "—";
  }
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DateWiseVisitors() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const rawRole = localStorage.getItem("role") || "";
  const role = rawRole.toLowerCase().replace("-", "");
  const isTenant = role === "tanento" || role === "tanentm";
  const isSecurity = role === "security";
  const societyId = localStorage.getItem("societyId");
  const userId = localStorage.getItem("profileId");
  const buildingId = localStorage.getItem("buildingId");
  const flatId = localStorage.getItem("flatId");

  // ── State ──────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("All");

  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    rescheduled: 0,
    checkout: 0,
  });

  // Block/Unblock state
  const [blockDialog, setBlockDialog] = useState({
    open: false,
    visitor: null,
    action: null, // 'block' or 'unblock'
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ── Fetch Functions ────────────────────────────────────────────────────────
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      let query = supabase
        .from("visitors")
        .select(
          `
          *,
          buildings:building_id (name),
          flats:flat_id (flat_number)
        `,
        )
        .gte("in_time", from.toISOString())
        .lte("in_time", to.toISOString())
        .order("in_time", { ascending: false });

      // Apply role-based filters
      if (isTenant && flatId) {
        query = query.eq("flat_id", flatId);
      } else if (isSecurity && buildingId) {
        query = query.eq("building_id", buildingId);
      } else {
        query = query.eq("society_id", societyId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setVisitors(data || []);

      // Compute stats with all statuses
      const total = data?.length || 0;
      const approved =
        data?.filter((v) => v.approved_status === "Approved").length || 0;
      const pending =
        data?.filter((v) => v.approved_status === "Pending").length || 0;
      const rejected =
        data?.filter((v) => v.approved_status === "Rejected").length || 0;
      const rescheduled =
        data?.filter((v) => v.approved_status === "Reschedule").length || 0;
      const checkout =
        data?.filter((v) => v.approved_status === "Checkout").length || 0;

      setStats({ total, approved, pending, rejected, rescheduled, checkout });
      setPage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, isTenant, isSecurity, flatId, buildingId, societyId]);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!visitors.length) {
      setFilteredVisitors([]);
      return;
    }

    let temp = visitors;

    if (statusFilter !== "All") {
      temp = temp.filter((v) => v.approved_status === statusFilter);
    }

    if (visitorTypeFilter !== "All") {
      temp = temp.filter((v) => v.visitor_type === visitorTypeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(
        (v) =>
          v.visitor_name?.toLowerCase().includes(q) ||
          v.phone_number?.includes(q) ||
          v.vehicle_number?.toLowerCase().includes(q) ||
          v.purpose?.toLowerCase().includes(q) ||
          v.visitor_type?.toLowerCase().includes(q) ||
          v.flats?.flat_number?.toLowerCase().includes(q),
      );
    }

    setFilteredVisitors(temp);
  }, [visitors, statusFilter, visitorTypeFilter, search]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setPage(0);
  }, [statusFilter, visitorTypeFilter, search]);

  const paginated = filteredVisitors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // ── Block/Unblock Functions ────────────────────────────────────────────────
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleBlockUnblock = async () => {
    const { visitor, action } = blockDialog;

    if (!visitor || !action) return;

    try {
      const newBlockedStatus = action === "block";

      const { error } = await supabase
        .from("visitors")
        .update({
          is_blocked: newBlockedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitor.id);

      if (error) throw error;

      // Update local state
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitor.id ? { ...v, is_blocked: newBlockedStatus } : v,
        ),
      );

      showSnackbar(
        `Visitor ${action === "block" ? "blocked" : "unblocked"} successfully`,
        "success",
      );

      setBlockDialog({ open: false, visitor: null, action: null });
    } catch (error) {
      console.error(`Error ${action}:`, error);
      showSnackbar(`Error: ${error.message}`, "error");
    }
  };

  // ── Quick date presets ─────────────────────────────────────────────────────
  const setPreset = (days) => {
    const t = new Date();
    const f = new Date();
    f.setDate(f.getDate() - days + 1);
    setFromDate(f.toISOString().split("T")[0]);
    setToDate(t.toISOString().split("T")[0]);
  };

  // ── Render action buttons (only Block/Unblock) ─────────────────────────────
  const renderActionButtons = (visitor) => {
    const isBlocked = visitor.is_blocked || false;

    return (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title={isBlocked ? "Unblock Visitor" : "Block Visitor"}>
          <ActionButton
            size="small"
            variant="outlined"
            actioncolor={isBlocked ? "#16a34a" : "#dc2626"}
            startIcon={isBlocked ? <UnblockIcon /> : <BlockIcon />}
            onClick={() =>
              setBlockDialog({
                open: true,
                visitor,
                action: isBlocked ? "unblock" : "block",
              })
            }
          >
            {isBlocked ? "Unblock" : "Block"}
          </ActionButton>
        </Tooltip>

        <IconButton
          size="small"
          onClick={() => toggleRowExpand(visitor.id)}
          sx={{ color: "#6F0B14" }}
        >
          {expandedRows[visitor.id] ? (
            <KeyboardArrowDown />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
      </Stack>
    );
  };

  // ── Render expanded details ────────────────────────────────────────────────
  const renderExpandedDetails = (visitor) => (
    <Box
      sx={{
        margin: 1,
        padding: 2,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Visitor Details
          </Typography>
          <Stack spacing={1} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" sx={{ color: "#6F0B14" }} />
              <Typography variant="body2">{visitor.visitor_name}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Phone fontSize="small" sx={{ color: "#6F0B14" }} />
              <Typography variant="body2">
                {visitor.phone_number || "—"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <HomeIcon fontSize="small" sx={{ color: "#6F0B14" }} />
              <Typography variant="body2">
                {visitor.flats?.flat_number || visitor.flat_number || "—"}
              </Typography>
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary">
            Visit Details
          </Typography>
          <Stack spacing={1} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime fontSize="small" sx={{ color: "#6F0B14" }} />
              <Typography variant="body2">
                In: {formatDateTime(visitor.in_time)}
              </Typography>
            </Stack>
            {visitor.out_time && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ExitToApp fontSize="small" sx={{ color: "#6F0B14" }} />
                <Typography variant="body2">
                  Out: {formatDateTime(visitor.out_time)}
                </Typography>
              </Stack>
            )}
            {visitor.rescheduled_at && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon fontSize="small" sx={{ color: "#6F0B14" }} />
                <Typography variant="body2">
                  Rescheduled: {formatDateTime(visitor.rescheduled_at)}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Grid>

        {visitor.vehicle_number && (
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CarIcon fontSize="small" sx={{ color: "#6F0B14" }} />
              <Typography variant="body2">
                Vehicle: {visitor.vehicle_number}
              </Typography>
            </Stack>
          </Grid>
        )}

        {visitor.purpose && (
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Info fontSize="small" sx={{ color: "#6F0B14" }} />
              <Typography variant="body2">
                Purpose: {visitor.purpose}
              </Typography>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageContainer>
      <Container maxWidth="xl" disableGutters>
        <Fade in timeout={500}>
          <MainCard>
            {/* ── Header ── */}
            <HeaderSection>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                  onClick={() => navigate(-1)}
                  sx={{
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.2)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={700} mb={0.5}>
                    Date-Wise Visitors
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip
                      icon={<DateRangeIcon />}
                      label={`${formatDate(fromDate + "T00:00:00")} – ${formatDate(toDate + "T00:00:00")}`}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
                    />
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${stats.total} visitors`}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
                    />
                  </Stack>
                </Box>
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={fetchVisitors}
                    sx={{
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.15)",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <RefreshIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
            </HeaderSection>

            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* ── Stats Row with all statuses ── */}
              {/* <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
                {[
                  {
                    label: "Total",
                    value: stats.total,
                    color: "#6F0B14",
                    icon: <PeopleIcon />,
                  },
                  {
                    label: "Approved",
                    value: stats.approved,
                    color: "#16a34a",
                    icon: <CheckCircleIcon />,
                  },
                  {
                    label: "Pending",
                    value: stats.pending,
                    color: "#d97706",
                    icon: <ScheduleIcon />,
                  },
                  {
                    label: "Rejected",
                    value: stats.rejected,
                    color: "#dc2626",
                    icon: <CancelIcon />,
                  },
                  {
                    label: "Rescheduled",
                    value: stats.rescheduled,
                    color: "#9333ea",
                    icon: <ScheduleIcon />,
                  },
                  {
                    label: "Checked Out",
                    value: stats.checkout,
                    color: "#64748b",
                    icon: <ExitToApp />,
                  },
                ].map((s) => (
                  <StatCard key={s.label} color={s.color}>
                    <Box sx={{ color: s.color, display: "flex" }}>{s.icon}</Box>
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={s.color}
                        lineHeight={1.1}
                      >
                        {s.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {s.label}
                      </Typography>
                    </Box>
                  </StatCard>
                ))}
              </div> */}

              {/* ── Filter Panel ── */}
              <FilterPanel sx={{ mb: 3 }}>
                {/* Date presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { label: "Today", days: 1 },
                    { label: "Last 7 Days", days: 7 },
                    { label: "Last 30 Days", days: 30 },
                  ].map((p) => (
                    <Chip
                      key={p.label}
                      label={p.label}
                      onClick={() => setPreset(p.days)}
                      icon={<TodayIcon />}
                      size="small"
                      clickable
                      sx={{
                        bgcolor: "rgba(111,11,20,0.07)",
                        color: "#6F0B14",
                        fontWeight: 600,
                        "& .MuiChip-icon": { color: "#6F0B14" },
                        "&:hover": { bgcolor: "rgba(111,11,20,0.14)" },
                      }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <StyledTextField
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon
                            sx={{ color: "#6F0B14", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                  <StyledTextField
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: fromDate }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon
                            sx={{ color: "#6F0B14", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <StyledSelect
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="All">All Statuses</MenuItem>
                      {Object.keys(statusConfig).map((status) => (
                        <MenuItem key={status} value={status}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            {statusConfig[status].icon}
                            <span>{statusConfig[status].label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Visitor Type</InputLabel>
                    <StyledSelect
                      value={visitorTypeFilter}
                      onChange={(e) => setVisitorTypeFilter(e.target.value)}
                      label="Visitor Type"
                    >
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="Guest">Guest</MenuItem>
                      <MenuItem value="Delivery">Delivery</MenuItem>
                      <MenuItem value="Cab">Cab</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </div>

                {/* Search */}
                <div className="mt-3">
                  <StyledTextField
                    fullWidth
                    placeholder="Search by name, phone, flat, vehicle..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#6F0B14" }} />
                        </InputAdornment>
                      ),
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearch("")}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </div>

                {/* Active filter summary */}
                {(search ||
                  statusFilter !== "All" ||
                  visitorTypeFilter !== "All") && (
                  <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ lineHeight: "24px" }}
                    >
                      Active filters:
                    </Typography>
                    {search && (
                      <Chip
                        label={`"${search}"`}
                        size="small"
                        onDelete={() => setSearch("")}
                      />
                    )}
                    {statusFilter !== "All" && (
                      <Chip
                        label={
                          statusConfig[statusFilter]?.label || statusFilter
                        }
                        size="small"
                        onDelete={() => setStatusFilter("All")}
                      />
                    )}
                    {visitorTypeFilter !== "All" && (
                      <Chip
                        label={visitorTypeFilter}
                        size="small"
                        onDelete={() => setVisitorTypeFilter("All")}
                      />
                    )}
                    <Chip
                      label={`${filteredVisitors.length} result${filteredVisitors.length !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(111,11,20,0.08)",
                        color: "#6F0B14",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                )}
              </FilterPanel>

              {/* ── Error ── */}
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: "12px" }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {/* ── Table / Cards ── */}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                  <Stack alignItems="center" spacing={2}>
                    <CircularProgress sx={{ color: "#6F0B14" }} />
                    <Typography color="text.secondary">
                      Loading visitors...
                    </Typography>
                  </Stack>
                </Box>
              ) : filteredVisitors.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <PeopleIcon
                    sx={{ fontSize: 64, color: "rgba(111,11,20,0.15)", mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    No visitors found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Try adjusting the date range or filters
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Desktop Table */}
                  {!isMobile ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        borderRadius: "16px",
                        border: "1px solid rgba(111,11,20,0.08)",
                        boxShadow: "none",
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: "rgba(111,11,20,0.04)" }}
                          >
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Visitor
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Flat
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Type
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Purpose
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              In Time
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Out Time
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Status
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Block Status
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                color: "#6F0B14",
                                py: 1.5,
                              }}
                            >
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginated.map((v) => (
                            <React.Fragment key={v.id}>
                              <StyledTableRow>
                                <TableCell>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.5}
                                  >
                                    <Avatar
                                      src={v.image_url}
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        bgcolor: "#6F0B14",
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {v.visitor_name?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                      >
                                        {v.visitor_name || "—"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {v.phone_number || "—"}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={0.5}
                                  >
                                    <HomeIcon
                                      sx={{ fontSize: 14, color: "#6F0B14" }}
                                    />
                                    <Typography variant="body2">
                                      {v.flats?.flat_number ||
                                        v.flat_number ||
                                        "—"}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  {getVisitorTypeChip(
                                    v.visitor_type || "Other",
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {v.purpose || "—"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {formatDate(v.in_time)}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formatTime(v.in_time)}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {v.out_time || v.checkout_at ? (
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {formatDate(
                                          v.out_time || v.checkout_at,
                                        )}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {formatTime(
                                          v.out_time || v.checkout_at,
                                        )}
                                      </Typography>
                                    </Box>
                                  ) : v.approved_status === "Approved" ? (
                                    <Chip
                                      label="Still In"
                                      size="small"
                                      sx={{
                                        bgcolor: "#e0f2fe",
                                        color: "#0369a1",
                                        fontWeight: 500,
                                        fontSize: "0.7rem",
                                      }}
                                    />
                                  ) : (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      —
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getStatusChip(v.approved_status)}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={v.is_blocked ? "Blocked" : "Active"}
                                    size="small"
                                    sx={{
                                      bgcolor: v.is_blocked
                                        ? "#fee2e2"
                                        : "#dcfce7",
                                      color: v.is_blocked
                                        ? "#dc2626"
                                        : "#16a34a",
                                      fontWeight: 600,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{renderActionButtons(v)}</TableCell>
                              </StyledTableRow>
                              {expandedRows[v.id] && (
                                <TableRow>
                                  <TableCell colSpan={9} sx={{ py: 0 }}>
                                    <Collapse
                                      in={expandedRows[v.id]}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      {renderExpandedDetails(v)}
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    /* Mobile Cards */
                    <div className="space-y-3">
                      {paginated.map((v) => (
                        <Paper
                          key={v.id}
                          sx={{
                            p: 2,
                            borderRadius: "16px",
                            border: "1px solid rgba(111,11,20,0.08)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="flex-start"
                            spacing={1.5}
                          >
                            <Avatar
                              src={v.image_url}
                              sx={{
                                width: 46,
                                height: 46,
                                bgcolor: "#6F0B14",
                                fontSize: "1rem",
                                flexShrink: 0,
                              }}
                            >
                              {v.visitor_name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box flex={1} minWidth={0}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={0.5}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  noWrap
                                >
                                  {v.visitor_name || "—"}
                                </Typography>
                                {getStatusChip(v.approved_status)}
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {v.phone_number}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <div className="grid grid-cols-2 gap-1">
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <HomeIcon
                                    sx={{ fontSize: 13, color: "#6F0B14" }}
                                  />
                                  <Typography
                                    variant="caption"
                                    fontWeight={500}
                                  >
                                    {v.flats?.flat_number ||
                                      v.flat_number ||
                                      "—"}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  <AccessTime
                                    sx={{ fontSize: 13, color: "#6F0B14" }}
                                  />
                                  <Typography variant="caption">
                                    {formatTime(v.in_time)}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                >
                                  {getVisitorTypeChip(
                                    v.visitor_type || "Other",
                                  )}
                                </Stack>
                                {v.vehicle_number && (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                  >
                                    <CarIcon
                                      sx={{ fontSize: 13, color: "#64748b" }}
                                    />
                                    <Typography variant="caption">
                                      {v.vehicle_number}
                                    </Typography>
                                  </Stack>
                                )}
                              </div>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                mt={0.5}
                              >
                                {formatDate(v.in_time)}
                              </Typography>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mt={1}
                              >
                                <Chip
                                  label={v.is_blocked ? "Blocked" : "Active"}
                                  size="small"
                                  sx={{
                                    bgcolor: v.is_blocked
                                      ? "#fee2e2"
                                      : "#dcfce7",
                                    color: v.is_blocked ? "#dc2626" : "#16a34a",
                                    fontWeight: 600,
                                  }}
                                />
                                {renderActionButtons(v)}
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  <TablePagination
                    component="div"
                    count={filteredVisitors.length}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                      mt: 1,
                      "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                        {
                          fontWeight: 500,
                        },
                      "& .Mui-selected, & .MuiIconButton-root:not(.Mui-disabled)":
                        {
                          color: "#6F0B14",
                        },
                    }}
                  />
                </>
              )}
            </CardContent>
          </MainCard>
        </Fade>
      </Container>

      {/* ── Block/Unblock Confirmation Dialog ── */}
      <Dialog
        open={blockDialog.open}
        onClose={() => setBlockDialog({ ...blockDialog, open: false })}
      >
        <DialogTitle>
          {blockDialog.action === "block" ? "Block Visitor" : "Unblock Visitor"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {blockDialog.action}{" "}
            {blockDialog.visitor?.visitor_name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBlockDialog({ ...blockDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBlockUnblock}
            variant="contained"
            sx={{
              bgcolor: blockDialog.action === "block" ? "#dc2626" : "#16a34a",
              "&:hover": {
                bgcolor: blockDialog.action === "block" ? "#b91c1c" : "#15803d",
              },
            }}
          >
            Confirm {blockDialog.action === "block" ? "Block" : "Unblock"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}
