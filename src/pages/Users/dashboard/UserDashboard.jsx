import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Skeleton,
  Avatar,
  Tooltip,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  Grid,
  Divider,
  Badge,
  Fade,
  Zoom,
  LinearProgress,
  TablePagination,
  TableFooter,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Search,
  Phone,
  Home,
  Block,
  ExitToApp,
  CreditCard,
  CheckCircle,
  Cancel,
  Schedule,
  LocalShipping,
  Close,
  ZoomIn,
  Person,
  Info,
  Refresh,
  Apartment,
  MeetingRoom,
  AccessTime,
  CalendarToday,
  DirectionsCar,
  Description,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
  Visibility,
} from "@mui/icons-material";
import { supabase } from "../../../api/supabaseClient";
import { format, formatDistanceToNow } from "date-fns";

const normalizeRole = (rawRole = "") => {
  const r = rawRole.toLowerCase().replace("-", "");
  if (r === "tanento") return "tenant_o";
  if (r === "tanentm") return "tenant_m";
  if (r === "security") return "security";
  return r;
};

const chipStyle = {
  backgroundColor: "rgba(255,255,255,0.18)",
  color: "white",
  px: 1,
  fontWeight: 500,
  "& .MuiChip-icon": {
    color: "white",
  },
};

export default function UserDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userDetails, setUserDetails] = useState({
    societyName: "",
    buildingName: "",
    flatNumber: "",
    societyId: null,
    buildingId: null,
    flatId: null,
    userId: null,
    userDbId: null,
  });

  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [paginatedVisitors, setPaginatedVisitors] = useState([]);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [imagePreview, setImagePreview] = useState({
    url: null,
    type: null,
  });

  const [actionLoading, setActionLoading] = useState({});
  const [rescheduleDialog, setRescheduleDialog] = useState({
    open: false,
    visitor: null,
    date: "",
    time: "",
    reason: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    visitor: null,
    reason: "",
  });
  const [availableCards, setAvailableCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [assignCardDialog, setAssignCardDialog] = useState({
    open: false,
    visitor: null,
    cardNumber: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rescheduled: 0,
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [visitors, activeFilter, search]);

  useEffect(() => {
    setPage(0);
  }, [activeFilter, search]);

  useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setPaginatedVisitors(filteredVisitors.slice(start, end));

    // Close any expanded rows when page changes
    setExpandedRows({});
  }, [filteredVisitors, page, rowsPerPage]);

  useEffect(() => {
    const pending = visitors.filter(
      (v) => v.approved_status === "Pending",
    ).length;
    const approved = visitors.filter(
      (v) => v.approved_status === "Approved",
    ).length;
    const rescheduled = visitors.filter(
      (v) => v.approved_status === "Reschedule",
    ).length;

    setStats({
      total: visitors.length,
      pending,
      approved,
      rescheduled,
    });
  }, [visitors]);
  const fetchAvailableCards = async () => {
    setCardsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("society_id", userDetails.societyId)
        .eq("card_status", "active")
        .eq("is_assigned", false);

      if (error) throw error;
      setAvailableCards(data || []);
    } catch (err) {
      showSnackbar("Error fetching cards: " + err.message, "error");
    } finally {
      setCardsLoading(false);
    }
  };
  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get stored values
      const rawRole = localStorage.getItem("role");
      const normalizedRole = normalizeRole(rawRole);
      setRole(normalizedRole);

      const societyId = localStorage.getItem("societyId")
        ? Number(localStorage.getItem("societyId"))
        : null;
      const buildingId = localStorage.getItem("buildingId")
        ? Number(localStorage.getItem("buildingId"))
        : null;
      const flatId = localStorage.getItem("flatId")
        ? Number(localStorage.getItem("flatId"))
        : null;
      const authUserId = localStorage.getItem("userId");

      if (!societyId) {
        throw new Error("Society ID not found. Please login again.");
      }

      // Fetch society name
      let societyName = "N/A";
      if (societyId) {
        const { data: society } = await supabase
          .from("societies")
          .select("name")
          .eq("id", societyId)
          .single();

        if (society) {
          societyName = society.name;
        }
      }

      let buildingName = localStorage.getItem("buildingName") || "";
      if (buildingId && !buildingName) {
        const { data: building } = await supabase
          .from("buildings")
          .select("name")
          .eq("id", buildingId)
          .single();

        if (building) {
          buildingName = building.name;
        }
      }

      let flatNumber = localStorage.getItem("flatNumber") || "";
      if (flatId && !flatNumber) {
        const { data: flat } = await supabase
          .from("flats")
          .select("flat_number")
          .eq("id", flatId)
          .single();

        if (flat) {
          flatNumber = flat.flat_number;
        }
      }

      let userDbId = null;
      if (authUserId) {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("registed_user_id", authUserId)
          .single();

        if (userData) {
          userDbId = userData.id;
        }
      }

      const userInfo = {
        societyName,
        buildingName,
        flatNumber,
        societyId,
        buildingId,
        flatId,
        userId: authUserId,
        userDbId,
      };

      setUserDetails(userInfo);

      // Fetch visitors
      await fetchVisitors(userInfo, normalizedRole);
    } catch (err) {
      console.error("Init error:", err);
      setError(err.message || "Failed to load dashboard data");
      showSnackbar(err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVisitors = async (user, role) => {
    try {
      let query = supabase
        .from("visitors")
        .select(
          `
          *,
          buildings:building_id (name),
          flats:flat_id (flat_number)
        `,
        )
        .eq("society_id", user.societyId)
        .eq("is_delete", false)
        .neq("approved_status", "Checkout")
        .order("created_at", { ascending: false });

      if (role === "security" && user.buildingId) {
        query = query.eq("building_id", user.buildingId);
      }

      if ((role === "tenant_o" || role === "tenant_m") && user.flatId) {
        query = query.eq("flat_id", user.flatId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVisitors(data || []);
    } catch (err) {
      console.error("Fetch visitors error:", err);
      showSnackbar("Error fetching visitors: " + err.message, "error");
    }
  };

  const filterVisitors = () => {
    if (!visitors.length) {
      setFilteredVisitors([]);
      return;
    }

    let temp = visitors.filter((v) => v.approved_status !== "Checkout");

    if (activeFilter !== "All") {
      temp = temp.filter((v) => v.approved_status === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(
        (v) =>
          v.visitor_name?.toLowerCase().includes(q) ||
          v.phone_number?.includes(q) ||
          v.vehicle_number?.toLowerCase().includes(q) ||
          v.purpose?.toLowerCase().includes(q) ||
          v.visitor_type?.toLowerCase().includes(q),
      );
    }

    setFilteredVisitors(temp);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleRescheduleSubmit = async () => {
    const { visitor, date, time, reason } = rescheduleDialog;

    if (!date || !time || !reason) {
      showSnackbar("Please fill all fields", "error");
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${date}T${time}`).toISOString();

    await handleVisitorAction(visitor, "reschedule", {
      scheduled_time: scheduledDateTime,
      reason: reason,
    });

    setRescheduleDialog({
      open: false,
      visitor: null,
      date: "",
      time: "",
      reason: "",
    });
  };
  const handleVisitorAction = async (visitor, action, data = {}) => {
    const actionKey = `${visitor.id}-${action}`;
    setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

    try {
      let updateData = {};
      let successMessage = "";

      const now = new Date().toISOString();

      switch (action) {
        case "approve":
          updateData = {
            approved_status: "Approved",
            approved_by: userDetails.userDbId,
            updated_at: now,
          };
          successMessage = "Visitor approved successfully";
          break;

        case "reject":
          updateData = {
            approved_status: "Rejected",
            rejected_reschedule_reason: data.reason,
            updated_at: now,
          };
          successMessage = "Visitor rejected";
          break;
        case "reschedule":
          updateData = {
            approved_status: "Reschedule",
            rescheduled_at: now,
            scheduled_time: data.scheduled_time,
            rejected_reschedule_reason: data.reason,
            updated_at: now,
          };
          successMessage = "Visit rescheduled successfully";
          break;

        case "checkout":
          updateData = {
            approved_status: "Checkout",
            checkout_at: now,
            updated_at: now,
          };
          successMessage = "Visitor checked out";
          break;

        case "assignCard":
          updateData = {
            card_number: data.cardNumber,
            card_status: "Assigned",
            updated_at: now,
          };
          successMessage = "Card assigned";
          break;
      }

      const { error } = await supabase
        .from("visitors")
        .update(updateData)
        .eq("id", visitor.id);

      if (error) throw error;

      // Update local state
      setVisitors((prev) =>
        prev.map((v) => (v.id === visitor.id ? { ...v, ...updateData } : v)),
      );

      showSnackbar(successMessage, "success");
      setConfirmDialog({
        open: false,
        action: null,
        visitor: null,
        reason: "",
      });
      setAssignCardDialog({ open: false, visitor: null, cardNumber: "" });
    } catch (error) {
      console.error(`Error ${action}:`, error);
      showSnackbar(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Pending: {
        color: "warning",
        icon: <Schedule />,
        label: "Pending",
        bgColor: "#DBA400",
        textColor: "#FFFFFF",
      },
      Approved: {
        color: "success",
        icon: <CheckCircle />,
        label: "Approved",
        bgColor: "#008000",
        textColor: "#FFFFFF",
      },
      Rejected: {
        color: "error",
        icon: <Cancel />,
        label: "Rejected",
        bgColor: "#B31B1B",
        textColor: "#FFFFFF",
      },
      Reschedule: {
        color: "info",
        icon: <Schedule />,
        label: "Rescheduled",
        bgColor: "#E86100",
        textColor: "#FFFFFF",
      },
    };

    const config = statusConfig[status] || {
      color: "default",
      label: status,
      bgColor: "#A29EB6",
      textColor: "#FFFFFF",
    };

    return (
      <Chip
        size="small"
        icon={config.icon}
        label={config.label}
        sx={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          fontWeight: 600,
          "& .MuiChip-icon": {
            color: config.textColor,
          },
        }}
      />
    );
  };

  const getVisitorTypeChip = (type) => {
    const typeConfig = {
      Guest: { icon: <Person />, color: "#6F0B14" },
      Delivery: { icon: <LocalShipping />, color: "#E86100" },
      Cab: { icon: <LocalShipping />, color: "#008000" },
      Maintenance: { icon: <Home />, color: "#DBA400" },
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

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    try {
      return format(new Date(timestamp), "dd MMM yyyy, hh:mm a");
    } catch {
      return "—";
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRefresh = () => {
    init();
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress
          sx={{
            backgroundColor: "#6F0B1420",
            "& .MuiLinearProgress-bar": { backgroundColor: "#6F0B14" },
          }}
        />
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" height={60} width="60%" />
          <Skeleton variant="text" height={30} width="40%" />
          <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 3 }}>
            <Skeleton variant="rectangular" height={100} width="25%" />
            <Skeleton variant="rectangular" height={100} width="25%" />
            <Skeleton variant="rectangular" height={100} width="25%" />
            <Skeleton variant="rectangular" height={100} width="25%" />
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Zoom in={true}>
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              boxShadow: theme.shadows[3],
            }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                <Refresh /> Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Zoom>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        // backgroundColor: "#f5f5f5",
        minHeight: "80vh",
      }}
    >
      {/* Header Card */}
      <Fade in={true} timeout={800}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #6F0B14 0%, #8B1E27 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Grid
            container
            spacing={3}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item xs={12} md={7}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    letterSpacing: 0.5,
                  }}
                >
                  Dashboard
                </Typography>

                {/* Chips Section */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Chip
                    icon={<Apartment />}
                    label={userDetails?.societyName || "Society"}
                    sx={chipStyle}
                  />

                  {userDetails?.buildingName && (
                    <Chip
                      icon={<MeetingRoom />}
                      label={userDetails?.buildingName || "Building"}
                      sx={chipStyle}
                    />
                  )}

                  {userDetails?.flatNumber && (
                    <Chip
                      icon={<Home />}
                      label={`Flat ${userDetails?.flatNumber || "-"}`}
                      sx={chipStyle}
                    />
                  )}

                  <Chip
                    icon={<Person />}
                    label={role || "User"}
                    sx={{
                      ...chipStyle,
                      textTransform: "capitalize",
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* RIGHT SECTION (Search and Refresh) */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="Search by name, phone, vehicle number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "white" }} />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearch("")}
                          sx={{ color: "white" }}
                        >
                          <Close />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 3,
                      color: "white",
                      height: 48,
                      "& input::placeholder": {
                        color: "rgba(255,255,255,0.8)",
                        opacity: 1,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.6)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                      },
                    },
                  }}
                />
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      color: "white",
                      height: 48,
                      width: 48,
                      borderRadius: 3,
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.25)",
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Filter Tabs */}
      <Paper sx={{ p: 1, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {["All", "Pending", "Approved", "Reschedule"].map((filter) => (
            <Chip
              key={filter}
              label={`${filter} ${
                filter !== "All" ? `(${stats[filter.toLowerCase()]})` : ""
              }`}
              onClick={() => setActiveFilter(filter)}
              sx={{
                backgroundColor:
                  activeFilter === filter ? "#6F0B14" : "transparent",
                color: activeFilter === filter ? "#FFFFFF" : "#6F0B14",
                borderColor: "#6F0B14",
                fontWeight: activeFilter === filter ? 600 : 400,
                minWidth: 100,
                "&:hover": {
                  backgroundColor:
                    activeFilter === filter
                      ? "#6F0B14"
                      : "rgba(111, 11, 20, 0.09)",
                },
              }}
              variant={activeFilter === filter ? "filled" : "outlined"}
            />
          ))}
        </Stack>
      </Paper>

      {/* Visitors Table with Pagination */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6F0B14" }}>
                <TableCell padding="checkbox" sx={{ color: "white" }} />
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  ID
                </TableCell>

                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Visitor
                </TableCell>
                {!isMobile && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Contact
                  </TableCell>
                )}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Type
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Location
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  In Time
                </TableCell>
                {(role === "tenant_o" ||
                  role === "tenant_m" ||
                  role === "security") && (
                  <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={role === "security" ? 8 : 7}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Person
                        sx={{
                          fontSize: 60,
                          color: "#A29EB6",
                          mb: 2,
                        }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        No visitors found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search
                          ? "Try adjusting your search criteria"
                          : visitors.length === 0
                            ? "No visitor logs available"
                            : `No visitors with status "${activeFilter}"`}
                      </Typography>
                      {visitors.length === 0 && (
                        <Button
                          variant="contained"
                          onClick={handleRefresh}
                          sx={{ mt: 2, bgcolor: "#6F0B14" }}
                        >
                          Refresh
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVisitors.map((visitor) => (
                  <React.Fragment key={visitor.id}>
                    <TableRow
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(111, 11, 20, 0.09)",
                        },
                        transition: "background-color 0.3s",
                        cursor: "pointer",
                        bgcolor: expandedRows[visitor.id]
                          ? "rgba(111, 11, 20, 0.04)"
                          : "inherit",
                      }}
                      onClick={() => toggleRowExpand(visitor.id)}
                    >
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          sx={{
                            transform: expandedRows[visitor.id]
                              ? "rotate(90deg)"
                              : "none",
                            transition: "transform 0.3s",
                            color: "#6F0B14",
                          }}
                        >
                          <KeyboardArrowRight />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          sx={{ color: "#6F0B14" }}
                        >
                          #{visitor.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            badgeContent={
                              <Tooltip title={visitor.approved_status}>
                                <Box
                                  sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    bgcolor:
                                      visitor.approved_status === "Approved"
                                        ? "#008000"
                                        : visitor.approved_status === "Pending"
                                          ? "#DBA400"
                                          : visitor.approved_status ===
                                              "Reschedule"
                                            ? "#E86100"
                                            : "#B31B1B",
                                    border: "2px solid white",
                                  }}
                                />
                              </Tooltip>
                            }
                          >
                            <Tooltip
                              title={
                                visitor.image_url
                                  ? "Click to preview"
                                  : "No image"
                              }
                            >
                              <Avatar
                                src={visitor.image_url}
                                alt={visitor.visitor_name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (visitor.image_url) {
                                    setImagePreview({
                                      url: visitor.image_url,
                                      type: "visitor",
                                    });
                                  }
                                }}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: "#6F0B14",
                                  color: "white",
                                  cursor: visitor.image_url
                                    ? "pointer"
                                    : "default",
                                  "&:hover": visitor.image_url
                                    ? { opacity: 0.8 }
                                    : {},
                                }}
                              >
                                {visitor.visitor_name
                                  ?.charAt(0)
                                  ?.toUpperCase() || <Person />}
                              </Avatar>
                            </Tooltip>
                          </Badge>
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {visitor.visitor_name}
                            </Typography>
                            {isMobile && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {visitor.phone_number || "No phone"}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Phone fontSize="small" sx={{ color: "#6F0B14" }} />
                            <Typography variant="body2">
                              {visitor.phone_number || "N/A"}
                            </Typography>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        {getVisitorTypeChip(visitor.visitor_type)}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Apartment
                              sx={{
                                fontSize: 16,
                                color: "#A29EB6",
                              }}
                            />
                            {visitor.buildings?.name || "N/A"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <MeetingRoom
                              sx={{
                                fontSize: 16,
                                color: "#A29EB6",
                              }}
                            />
                            Flat {visitor.flat_number || "N/A"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(visitor.approved_status)}
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            visitor.in_time
                              ? formatDateTime(visitor.in_time)
                              : "Not checked in"
                          }
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <CalendarToday
                                sx={{
                                  fontSize: 14,
                                  color: "#A29EB6",
                                }}
                              />
                              {visitor.in_time
                                ? format(new Date(visitor.in_time), "dd MMM")
                                : "—"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTime sx={{ fontSize: 12 }} />
                              {visitor.in_time
                                ? format(new Date(visitor.in_time), "hh:mm a")
                                : "—"}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      {(role === "tenant_o" ||
                        role === "tenant_m" ||
                        role === "security") && (
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            {/* Tenant Actions */}
                            {(role === "tenant_o" || role === "tenant_m") &&
                              visitor.approved_status === "Pending" && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVisitorAction(visitor, "approve");
                                      }}
                                      disabled={
                                        actionLoading[`${visitor.id}-approve`]
                                      }
                                      sx={{
                                        backgroundColor: "#00800020",
                                        color: "#008000",
                                        "&:hover": {
                                          backgroundColor: "#008000",
                                          color: "white",
                                        },
                                      }}
                                    >
                                      {actionLoading[
                                        `${visitor.id}-approve`
                                      ] ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <CheckCircle fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDialog({
                                          open: true,
                                          action: "reject",
                                          visitor,
                                          requiresReason: true,
                                          reason: "",
                                        });
                                      }}
                                      disabled={
                                        actionLoading[`${visitor.id}-reject`]
                                      }
                                      sx={{
                                        backgroundColor: "#B31B1B20",
                                        color: "#B31B1B",
                                        "&:hover": {
                                          backgroundColor: "#B31B1B",
                                          color: "white",
                                        },
                                      }}
                                    >
                                      {actionLoading[`${visitor.id}-reject`] ? (
                                        <CircularProgress size={20} />
                                      ) : (
                                        <Cancel fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reschedule">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      sx={{
                                        bgcolor: "#E86100",
                                        "&:hover": { bgcolor: "#C65100" },
                                      }}
                                      startIcon={<Schedule />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRescheduleDialog({
                                          open: true,
                                          visitor,
                                          date: "",
                                          time: "",
                                          reason: "",
                                        });
                                      }}
                                    >
                                      Reschedule
                                    </Button>
                                  </Tooltip>
                                </>
                              )}

                            {/* Security Actions */}
                            {role === "security" && (
                              <>
                                <Tooltip title="Assign Card">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fetchAvailableCards();
                                      setAssignCardDialog({
                                        open: true,
                                        visitor,
                                        cardNumber: "",
                                      });
                                    }}
                                    disabled={!!visitor.card_number}
                                    sx={{
                                      backgroundColor: visitor.card_number
                                        ? "#A29EB620"
                                        : "#6F0B1420",
                                      color: visitor.card_number
                                        ? "#A29EB6"
                                        : "#6F0B14",
                                      "&:hover": {
                                        backgroundColor: visitor.card_number
                                          ? "#A29EB6"
                                          : "#6F0B14",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    <CreditCard fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Call">
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={`tel:${visitor.phone_number}`}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{
                                      backgroundColor: "#00800020",
                                      color: "#008000",
                                      "&:hover": {
                                        backgroundColor: "#008000",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    <Phone fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Checkout">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVisitorAction(visitor, "checkout");
                                    }}
                                    disabled={
                                      visitor.approved_status === "Checkout"
                                    }
                                    sx={{
                                      backgroundColor: "#B31B1B20",
                                      color: "#B31B1B",
                                      "&:hover": {
                                        backgroundColor: "#B31B1B",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    <ExitToApp fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Expanded Details Row */}
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={role === "security" ? 8 : 7}
                      >
                        <Collapse
                          in={expandedRows[visitor.id]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: "rgba(111, 11, 20, 0.02)",
                            }}
                          >
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "#6F0B14",
                              }}
                            >
                              <Info />
                              Additional Details
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: "#6F0B1420" }} />

                            <Grid container spacing={3}>
                              {/* Purpose */}
                              {visitor.purpose && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <Paper
                                    variant="outlined"
                                    sx={{ p: 2, borderColor: "#6F0B1420" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1,
                                      }}
                                    >
                                      <Description
                                        sx={{ fontSize: 16, color: "#6F0B14" }}
                                      />
                                      Purpose
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {visitor.purpose}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}

                              {/* Vehicle Number */}
                              {visitor.vehicle_number && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <Paper
                                    variant="outlined"
                                    sx={{ p: 2, borderColor: "#6F0B1420" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1,
                                      }}
                                    >
                                      <DirectionsCar
                                        sx={{ fontSize: 16, color: "#6F0B14" }}
                                      />
                                      Vehicle Number
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {visitor.vehicle_number}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}

                              {/* Card Number */}
                              {visitor.card_number && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <Paper
                                    variant="outlined"
                                    sx={{ p: 2, borderColor: "#6F0B1420" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1,
                                      }}
                                    >
                                      <CreditCard
                                        sx={{ fontSize: 16, color: "#6F0B14" }}
                                      />
                                      Card Number
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {visitor.card_number}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}

                              {/* Visit Type */}
                              {visitor.visit_type && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <Paper
                                    variant="outlined"
                                    sx={{ p: 2, borderColor: "#6F0B1420" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1,
                                      }}
                                    >
                                      <LocalShipping
                                        sx={{ fontSize: 16, color: "#6F0B14" }}
                                      />
                                      Visit Type
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {visitor.visit_type}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}

                              {/* Checkout Time */}
                              {visitor.checkout_at && (
                                <Grid item xs={12} sm={6} md={4}>
                                  <Paper
                                    variant="outlined"
                                    sx={{ p: 2, borderColor: "#6F0B1420" }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1,
                                      }}
                                    >
                                      <ExitToApp
                                        sx={{ fontSize: 16, color: "#6F0B14" }}
                                      />
                                      Checkout Time
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {formatDateTime(visitor.checkout_at)}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}

                              {/* Rejection Reason */}
                              {visitor.rejected_reschedule_reason && (
                                <Grid item xs={12}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 2,
                                      backgroundColor: "#B31B1B10",
                                      borderColor: "#B31B1B",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        mb: 1,
                                        color: "#B31B1B",
                                      }}
                                    >
                                      <Cancel sx={{ fontSize: 16 }} />
                                      Rejection Reason
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                      sx={{ color: "#B31B1B" }}
                                    >
                                      {visitor.rejected_reschedule_reason}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}

                              {/* ID Proof Image */}
                              {visitor.id_proof_image && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImagePreview({
                                      url: visitor.id_proof_image,
                                      type: "id",
                                    });
                                  }}
                                >
                                  View ID Proof
                                </Button>
                              )}
                            </Grid>

                            {/* Additional Action Buttons inside expanded view for better UX */}
                            {!isMobile && (
                              <>
                                {(role === "tenant_o" || role === "tenant_m") &&
                                  visitor.approved_status === "Pending" && (
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}
                                    >
                                      <Button
                                        size="small"
                                        variant="contained"
                                        sx={{
                                          bgcolor: "#008000",
                                          "&:hover": { bgcolor: "#006400" },
                                        }}
                                        startIcon={<CheckCircle />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVisitorAction(
                                            visitor,
                                            "approve",
                                          );
                                        }}
                                        disabled={
                                          actionLoading[`${visitor.id}-approve`]
                                        }
                                      >
                                        {actionLoading[
                                          `${visitor.id}-approve`
                                        ] ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          "Approve"
                                        )}
                                      </Button>

                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="error"
                                        startIcon={<Cancel />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDialog({
                                            open: true,
                                            action: "reject",
                                            visitor,
                                            requiresReason: true,
                                            reason: "",
                                          });
                                        }}
                                      >
                                        Reject
                                      </Button>

                                      <Button
                                        size="small"
                                        variant="contained"
                                        sx={{
                                          bgcolor: "#E86100",
                                          "&:hover": { bgcolor: "#C65100" },
                                        }}
                                        startIcon={<Schedule />}
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          setRescheduleDialog({
                                            open: true,
                                            visitor: visitor,
                                            date: "",
                                            time: "",
                                            reason: "",
                                          });
                                        }}
                                      >
                                        Reschedule
                                      </Button>
                                    </Stack>
                                  )}

                                {role === "security" && (
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}
                                  >
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="primary"
                                      startIcon={<CreditCard />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        fetchAvailableCards();
                                        setAssignCardDialog({
                                          open: true,
                                          visitor,
                                          cardNumber: "",
                                        });
                                      }}
                                      disabled={!!visitor.card_number}
                                    >
                                      Assign Card
                                    </Button>

                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="primary"
                                      startIcon={<Phone />}
                                      href={`tel:${visitor.phone_number}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Call
                                    </Button>

                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="secondary"
                                      startIcon={<ExitToApp />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVisitorAction(
                                          visitor,
                                          "checkout",
                                        );
                                      }}
                                      disabled={
                                        visitor.approved_status === "Checkout"
                                      }
                                    >
                                      Checkout
                                    </Button>
                                  </Stack>
                                )}
                              </>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Component */}
        {filteredVisitors.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredVisitors.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: "1px solid rgba(224, 224, 224, 1)",
              "& .MuiTablePagination-toolbar": {
                backgroundColor: "#fff",
              },
              "& .MuiTablePagination-select": {
                borderRadius: 1,
              },
            }}
          />
        )}
      </Paper>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!imagePreview.url}
        onClose={() =>
          setImagePreview({
            url: null,
            type: null,
          })
        }
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#6F0B14",
            color: "white",
          }}
        >
          <Typography variant="h6">
            {imagePreview.type === "id"
              ? "ID Proof Preview"
              : "Visitor Image Preview"}
          </Typography>

          <IconButton
            onClick={() => setImagePreview({ url: null, type: null })}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <img
              src={imagePreview.url}
              alt="Visitor"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            action: null,
            visitor: null,
            reason: "",
          })
        }
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              confirmDialog.action === "reject" ? "#B31B1B" : "#6F0B14",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {confirmDialog.action === "reject" ? <Cancel /> : <Info />}
            <Typography variant="h6">Confirm {confirmDialog.action}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to <strong>{confirmDialog.action}</strong>{" "}
            this visitor?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {confirmDialog.visitor?.visitor_name}
          </Typography>

          {confirmDialog.requiresReason && (
            <TextField
              autoFocus
              margin="dense"
              label="Reason"
              placeholder="Please provide a reason"
              fullWidth
              multiline
              rows={4}
              value={confirmDialog.reason}
              onChange={(e) =>
                setConfirmDialog({ ...confirmDialog, reason: e.target.value })
              }
              error={confirmDialog.reason === ""}
              helperText={
                confirmDialog.reason === "" ? "Reason is required" : ""
              }
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#B31B1B",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#B31B1B",
                  },
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setConfirmDialog({
                open: false,
                action: null,
                visitor: null,
                reason: "",
              })
            }
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleVisitorAction(confirmDialog.visitor, confirmDialog.action, {
                reason: confirmDialog.reason,
              })
            }
            variant="contained"
            disabled={confirmDialog.requiresReason && !confirmDialog.reason}
            sx={{
              backgroundColor:
                confirmDialog.action === "reject" ? "#B31B1B" : "#6F0B14",
              "&:hover": {
                backgroundColor:
                  confirmDialog.action === "reject" ? "#8A1515" : "#8B0F1A",
              },
              "&.Mui-disabled": {
                backgroundColor: "#A29EB6",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Card Dialog */}
      <Dialog
        open={assignCardDialog.open}
        onClose={() =>
          setAssignCardDialog({ open: false, visitor: null, cardNumber: "" })
        }
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#6F0B14",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CreditCard />
            <Typography variant="h6">Assign Card</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Visitor: <strong>{assignCardDialog.visitor?.visitor_name}</strong>
          </Typography>

          {cardsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress sx={{ color: "#6F0B14" }} />
            </Box>
          ) : availableCards.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No available cards found for this society.
            </Alert>
          ) : (
            <TextField
              select
              fullWidth
              margin="dense"
              value={assignCardDialog.cardNumber}
              onChange={(e) =>
                setAssignCardDialog((prev) => ({
                  ...prev,
                  cardNumber: e.target.value,
                }))
              }
              SelectProps={{ native: true }}
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#6F0B14" },
                  "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#6F0B14" },
              }}
            >
              <option value="">-- Select a Card --</option>
              {availableCards.map((card) => (
                <option key={card.id} value={card.card_serial_number}>
                  {card.card_serial_number}
                </option>
              ))}
            </TextField>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setAssignCardDialog({
                open: false,
                visitor: null,
                cardNumber: "",
              })
            }
            variant="outlined"
            sx={{ borderColor: "#6F0B14", color: "#6F0B14" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              handleVisitorAction(assignCardDialog.visitor, "assignCard", {
                cardNumber: assignCardDialog.cardNumber,
              })
            }
            disabled={!assignCardDialog.cardNumber || cardsLoading}
            sx={{
              backgroundColor: "#6F0B14",
              "&:hover": { backgroundColor: "#8B0F1A" },
              "&.Mui-disabled": {
                backgroundColor: "#A29EB6",
              },
            }}
          >
            {actionLoading[`${assignCardDialog.visitor?.id}-assignCard`] ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Assign"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rescheduleDialog.open}
        onClose={() =>
          setRescheduleDialog({ ...rescheduleDialog, open: false })
        }
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#E86100",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule />
            <Typography variant="h6">Reschedule Visit</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Visitor: <strong>{rescheduleDialog.visitor?.visitor_name}</strong>
          </Typography>

          <TextField
            fullWidth
            label="Select Date"
            type="date"
            value={rescheduleDialog.date}
            onChange={(e) =>
              setRescheduleDialog({ ...rescheduleDialog, date: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split("T")[0] }}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Select Time"
            type="time"
            value={rescheduleDialog.time}
            onChange={(e) =>
              setRescheduleDialog({ ...rescheduleDialog, time: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Reason for Reschedule"
            multiline
            rows={3}
            value={rescheduleDialog.reason}
            onChange={(e) =>
              setRescheduleDialog({
                ...rescheduleDialog,
                reason: e.target.value,
              })
            }
            placeholder="Please provide a reason for rescheduling"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setRescheduleDialog({ ...rescheduleDialog, open: false })
            }
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRescheduleSubmit}
            variant="contained"
            disabled={
              !rescheduleDialog.date ||
              !rescheduleDialog.time ||
              !rescheduleDialog.reason
            }
            sx={{
              backgroundColor: "#E86100",
              "&:hover": { backgroundColor: "#C65100" },
              "&.Mui-disabled": {
                backgroundColor: "#A29EB6",
              },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            boxShadow: theme.shadows[3],
            borderRadius: 1,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
