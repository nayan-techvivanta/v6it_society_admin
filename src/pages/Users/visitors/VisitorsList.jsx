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
  Card,
  CardContent,
  Grid,
  Divider,
  Badge,
  Fade,
  Zoom,
  LinearProgress,
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
  Fingerprint,
  DirectionsCar,
  Description,
  QrCodeScanner,
  Check,
  Warning,
  PersonAdd,
  Security,
  Groups,
  LocationCity,
} from "@mui/icons-material";
import { Add } from "@mui/icons-material";

import { supabase } from "../../../api/supabaseClient";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

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

export default function VisitorsList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();
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
  const [rescheduleDialog, setRescheduleDialog] = useState({
    open: false,
    visitor: null,
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

  const init = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawRole = localStorage.getItem("role");
      const normalizedRole = normalizeRole(rawRole);
      setRole(normalizedRole);

      if (
        normalizedRole !== "tenant_o" &&
        normalizedRole !== "tenant_m" &&
        normalizedRole !== "security"
      ) {
        setError("You are not authorized to view this page.");
        return;
      }

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

      let societyName = "N/A";
      const { data: society } = await supabase
        .from("societies")
        .select("name")
        .eq("id", societyId)
        .single();

      if (society) societyName = society.name;

      let buildingName = localStorage.getItem("buildingName") || "";
      if (buildingId && !buildingName) {
        const { data: building } = await supabase
          .from("buildings")
          .select("name")
          .eq("id", buildingId)
          .single();

        if (building) buildingName = building.name;
      }

      let flatNumber = localStorage.getItem("flatNumber") || "";
      if (flatId && !flatNumber) {
        const { data: flat } = await supabase
          .from("flats")
          .select("flat_number")
          .eq("id", flatId)
          .single();

        if (flat) flatNumber = flat.flat_number;
      }

      let userDbId = null;
      if (authUserId) {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("registed_user_id", authUserId)
          .single();

        if (userData) userDbId = userData.id;
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

      // await fetchPreVisitors(userInfo, normalizedRole);
      if (normalizedRole !== "security") {
        await fetchPreVisitors(userInfo, normalizedRole);
      }
    } catch (err) {
      console.error("Init error:", err);
      setError(err.message || "Failed to load visitors data");
      showSnackbar(err.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreVisitors = async (user, role) => {
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
        .eq("is_active", true)
        .eq("is_delete", false)
        .eq("visit_type", "previsitor")
        .in("approved_status", ["Pending", "Approved", "Reschedule"])
        .is("checkout_at", null)
        .order("created_at", { ascending: false });

      if ((role === "tenant_o" || role === "tenant_m") && user.flatId) {
        query = query.eq("flat_id", user.flatId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVisitors(data || []);
    } catch (err) {
      console.error("Fetch pre-visitors error:", err);
      showSnackbar("Error fetching pre-visitors: " + err.message, "error");
    }
  };
  const handleAddVisitor = () => {
    navigate("/add-visitor");
  };
  const filterVisitors = () => {
    let filtered = [...visitors];

    if (activeFilter !== "All") {
      filtered = filtered.filter(
        (visitor) => visitor.approved_status === activeFilter,
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (visitor) =>
          visitor.visitor_name?.toLowerCase().includes(searchLower) ||
          visitor.phone_number?.toLowerCase().includes(searchLower) ||
          visitor.purpose?.toLowerCase().includes(searchLower) ||
          visitor.vehicle_number?.toLowerCase().includes(searchLower) ||
          visitor.flat_number?.toLowerCase().includes(searchLower) ||
          visitor.visitor_type?.toLowerCase().includes(searchLower),
      );
    }

    setFilteredVisitors(filtered);
  };

  const handleApprove = async (visitor) => {
    try {
      setActionLoading((prev) => ({ ...prev, [visitor.id]: "approve" }));

      const { error } = await supabase
        .from("visitors")
        .update({
          approved_status: "Approved",
          approved_by: userDetails.userDbId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitor.id);

      if (error) throw error;

      showSnackbar("Visitor approved successfully", "success");
      await fetchPreVisitors(userDetails, role);
    } catch (err) {
      console.error("Approve error:", err);
      showSnackbar("Error approving visitor: " + err.message, "error");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[visitor.id];
        return newState;
      });
    }
  };

  const handleReject = async (visitor) => {
    if (!confirmDialog.reason) {
      setConfirmDialog({
        open: true,
        action: "reject",
        visitor,
        reason: "",
      });
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [visitor.id]: "reject" }));

      const { error } = await supabase
        .from("visitors")
        .update({
          approved_status: "Rejected",
          rejected_reschedule_reason: confirmDialog.reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitor.id);

      if (error) throw error;

      showSnackbar("Visitor rejected successfully", "success");
      setConfirmDialog({
        open: false,
        action: null,
        visitor: null,
        reason: "",
      });
      await fetchPreVisitors(userDetails, role);
    } catch (err) {
      console.error("Reject error:", err);
      showSnackbar("Error rejecting visitor: " + err.message, "error");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[visitor.id];
        return newState;
      });
    }
  };

  const handleCheckIn = async (visitor) => {
    try {
      setActionLoading((prev) => ({ ...prev, [visitor.id]: "checkin" }));

      const { error } = await supabase
        .from("visitors")
        .update({
          in_time: new Date().toISOString(),
          approved_status: "Checkout",
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitor.id);

      if (error) throw error;

      showSnackbar("Visitor checked in successfully", "success");
      await fetchPreVisitors(userDetails, role);
    } catch (err) {
      console.error("Check-in error:", err);
      showSnackbar("Error checking in visitor: " + err.message, "error");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[visitor.id];
        return newState;
      });
    }
  };

  const showSnackbar = (message, severity = "success") => {
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

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };
  const handleReschedule = (visitor) => {
    setRescheduleDialog({
      open: true,
      visitor,
    });
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
              <Button color="inherit" size="small" onClick={init}>
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
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 4,
            background: "linear-gradient(135deg, #6F0B14 0%, #8B1E27 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* LEFT SECTION */}
            <Grid item xs={12} md={7}>
              <Box display="flex" flexDirection="column" gap={2.5}>
                {/* Heading With Icon */}
                <Box display="flex" alignItems="center" gap={1.5}>
                  {role === "security" ? (
                    <Security sx={{ fontSize: 34 }} />
                  ) : (
                    <Groups sx={{ fontSize: 34 }} />
                  )}

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ letterSpacing: 0.5 }}
                  >
                    {role === "security"
                      ? "Visitor Entry Panel"
                      : "Pre-Visitors List"}
                  </Typography>
                </Box>

                {/* Chips Section */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Society Chip */}
                  <Chip
                    icon={<LocationCity sx={{ color: "white !important" }} />}
                    label={userDetails?.societyName || "Society"}
                    sx={{
                      ...chipStyle,
                      fontWeight: 600,
                      px: 1,
                    }}
                  />

                  {/* Building + Flat Only for Tenant */}
                  {role !== "security" && (
                    <>
                      <Chip
                        icon={<MeetingRoom />}
                        label={userDetails?.buildingName || "Building"}
                        sx={chipStyle}
                      />
                      <Chip
                        icon={<Home />}
                        label={`Flat ${userDetails?.flatNumber || "-"}`}
                        sx={chipStyle}
                      />
                    </>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* RIGHT SECTION */}
            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: "100%",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: { md: "flex-end" },
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
                {/* Search Only for Tenant */}
                {role !== "security" && (
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="Search by name, phone, purpose..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                      flex: 1,
                      minWidth: { sm: 220 },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "white" }} />
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(10px)",
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
                )}

                {/* Add Visitor Button */}
                <Button
                  variant="contained"
                  startIcon={role === "security" ? <PersonAdd /> : <Add />}
                  onClick={handleAddVisitor}
                  sx={{
                    height: 48,
                    borderRadius: 3,
                    px: 4,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    backgroundColor: "white",
                    color: "#6F0B14",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                    "&:hover": {
                      backgroundColor: "#f3f3f3",
                    },
                  }}
                >
                  {role === "security" ? "Add New Visitor" : "Add Visitor"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {role !== "security" && (
        <>
          {/* Filter Tabs */}
          <Paper sx={{ p: 1, mb: 2, borderRadius: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              {["All", "Pending", "Approved", "Reschedule"].map((filter) => (
                <Chip
                  key={filter}
                  label={`${filter} ${filter !== "All" ? `(${stats[filter.toLowerCase()]})` : ""}`}
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

          {/* Visitors Table */}
          <TableContainer
            component={Paper}
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
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
                    Visit Type
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Location
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Requested
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "white", fontWeight: "bold" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
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
                          No pre-visitors found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {search
                            ? "Try adjusting your search criteria"
                            : "All pre-scheduled visitors will appear here"}
                        </Typography>
                        {search && (
                          <Button
                            variant="outlined"
                            onClick={() => setSearch("")}
                            sx={{ mt: 2 }}
                          >
                            Clear Search
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <React.Fragment key={visitor.id}>
                      <TableRow
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(111, 11, 20, 0.09)",
                          },
                          transition: "background-color 0.3s",
                        }}
                      >
                        <TableCell padding="checkbox">
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpand(visitor.id)}
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
                                          : visitor.approved_status ===
                                              "Pending"
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
                              <Avatar
                                src={visitor.image_url}
                                alt={visitor.visitor_name}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: "rgba(111, 11, 20, 0.09)",
                                  color: "#6F0B14",
                                }}
                              >
                                {visitor.visitor_name?.charAt(0).toUpperCase()}
                              </Avatar>
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
                              <Phone
                                fontSize="small"
                                sx={{ color: "#6F0B14" }}
                              />
                              <Typography variant="body2">
                                {visitor.phone_number || "N/A"}
                              </Typography>
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>
                          {getVisitorTypeChip(visitor.visit_type)}
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
                            title={format(
                              new Date(visitor.created_at),
                              "PPP p",
                            )}
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
                                {format(new Date(visitor.created_at), "dd MMM")}
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
                                {getTimeAgo(visitor.created_at)}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            {visitor.approved_status === "Pending" && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleApprove(visitor)}
                                    disabled={actionLoading[visitor.id]}
                                    sx={{
                                      backgroundColor: "#00800020",
                                      color: "#008000",
                                      "&:hover": {
                                        backgroundColor: "#008000",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    {actionLoading[visitor.id] === "approve" ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <CheckCircle fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleReject(visitor)}
                                    disabled={actionLoading[visitor.id]}
                                    sx={{
                                      backgroundColor: "#B31B1B20",
                                      color: "#B31B1B",
                                      "&:hover": {
                                        backgroundColor: "#B31B1B",
                                        color: "white",
                                      },
                                    }}
                                  >
                                    {actionLoading[visitor.id] === "reject" ? (
                                      <CircularProgress size={20} />
                                    ) : (
                                      <Cancel fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {visitor.approved_status === "Approved" && (
                              <Tooltip title="Check In">
                                <IconButton
                                  size="small"
                                  onClick={() => handleCheckIn(visitor)}
                                  disabled={actionLoading[visitor.id]}
                                  sx={{
                                    backgroundColor: "#6F0B1420",
                                    color: "#6F0B14",
                                    "&:hover": {
                                      backgroundColor: "#6F0B14",
                                      color: "white",
                                    },
                                  }}
                                >
                                  {actionLoading[visitor.id] === "checkin" ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <ExitToApp fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                            {visitor.approved_status === "Reschedule" && (
                              <Tooltip title="View Reschedule">
                                <IconButton
                                  size="small"
                                  onClick={() => handleReschedule(visitor)}
                                  sx={{
                                    backgroundColor: "#E8610020",
                                    color: "#E86100",
                                    "&:hover": {
                                      backgroundColor: "#E86100",
                                      color: "white",
                                    },
                                  }}
                                >
                                  <Schedule fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Details Row */}
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={8}
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
                              <Divider
                                sx={{ mb: 2, borderColor: "#6F0B1420" }}
                              />

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
                                          sx={{
                                            fontSize: 16,
                                            color: "#6F0B14",
                                          }}
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
                                {/* Rescheduled At - Only show for Reschedule status */}
                                {/* Rescheduled At */}
                                {visitor.approved_status === "Reschedule" &&
                                  visitor.rescheduled_at && (
                                    <Grid item xs={12} sm={6} md={4}>
                                      <Paper
                                        variant="outlined"
                                        sx={{
                                          p: 2,
                                          borderColor: "#E8610030",
                                          backgroundColor: "#FFF4E815",
                                        }}
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
                                          <Schedule
                                            sx={{
                                              fontSize: 16,
                                              color: "#E86100",
                                            }}
                                          />
                                          Rescheduled For
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                          sx={{ color: "#E86100" }}
                                        >
                                          {format(
                                            new Date(visitor.rescheduled_at),
                                            "dd MMM yyyy",
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block", mt: 0.3 }}
                                        >
                                          {format(
                                            new Date(visitor.rescheduled_at),
                                            "hh:mm a",
                                          )}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ display: "block", mt: 0.3 }}
                                        >
                                          {getTimeAgo(visitor.rescheduled_at)}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}

                                {/* Reschedule Reason */}
                                {visitor.approved_status === "Reschedule" &&
                                  visitor.rejected_reschedule_reason && (
                                    <Grid item xs={12} sm={6} md={4}>
                                      <Paper
                                        variant="outlined"
                                        sx={{
                                          p: 2,
                                          borderColor: "#E8610030",
                                          backgroundColor: "#FFF4E815",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            mb: 1,
                                            color: "#E86100",
                                          }}
                                        >
                                          <Description
                                            sx={{
                                              fontSize: 16,
                                              color: "#E86100",
                                            }}
                                          />
                                          Reschedule Reason
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight="500"
                                          sx={{ color: "#E86100" }}
                                        >
                                          {visitor.rejected_reschedule_reason}
                                        </Typography>
                                      </Paper>
                                    </Grid>
                                  )}

                                {/* Rejection Reason */}
                                {visitor.approved_status === "Rejected" &&
                                  visitor.rejected_reschedule_reason && (
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
                                          sx={{
                                            fontSize: 16,
                                            color: "#6F0B14",
                                          }}
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

                                {/* Card ID */}
                                {visitor.card_id && (
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
                                          sx={{
                                            fontSize: 16,
                                            color: "#6F0B14",
                                          }}
                                        />
                                        Card ID
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="500"
                                      >
                                        {visitor.card_id}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                )}

                                {/* OTP */}
                                {/* {visitor.visitor_otp && (
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
                                        <Fingerprint
                                          sx={{
                                            fontSize: 16,
                                            color: "#6F0B14",
                                          }}
                                        />
                                        OTP
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight="500"
                                      >
                                        {visitor.visitor_otp}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                )} */}

                                {/* Card Status */}
                                {visitor.card_status && (
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
                                        <QrCodeScanner
                                          sx={{
                                            fontSize: 16,
                                            color: "#6F0B14",
                                          }}
                                        />
                                        Card Status
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={visitor.card_status}
                                        sx={{
                                          backgroundColor:
                                            visitor.card_status === "Active"
                                              ? "#00800020"
                                              : "#A29EB6",
                                          color:
                                            visitor.card_status === "Active"
                                              ? "#008000"
                                              : "#FFFFFF",
                                          fontWeight: 500,
                                        }}
                                      />
                                    </Paper>
                                  </Grid>
                                )}

                                {/* Scan Status */}
                                {visitor.is_card_scan && (
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
                                        <QrCodeScanner
                                          sx={{
                                            fontSize: 16,
                                            color: "#6F0B14",
                                          }}
                                        />
                                        Scan Status
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={visitor.is_card_scan}
                                        sx={{
                                          backgroundColor:
                                            visitor.is_card_scan === "Scanned"
                                              ? "#00800020"
                                              : "#DBA40020",
                                          color:
                                            visitor.is_card_scan === "Scanned"
                                              ? "#008000"
                                              : "#DBA400",
                                          fontWeight: 500,
                                        }}
                                        icon={
                                          visitor.is_card_scan === "Scanned" ? (
                                            <Check />
                                          ) : (
                                            <Warning />
                                          )
                                        }
                                      />
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
                                      window.open(
                                        visitor.id_proof_image,
                                        "_blank",
                                      );
                                    }}
                                  >
                                    View ID Proof
                                  </Button>
                                )}
                              </Grid>
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
        </>
      )}
      {/* Image Preview Dialog */}
      <Dialog
        open={!!imagePreview}
        onClose={() => setImagePreview(null)}
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
          <Typography variant="h6">ID Proof</Typography>
          <IconButton
            onClick={() => setImagePreview(null)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <img
              src={imagePreview}
              alt="ID Proof"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog for Rejection */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: "#B31B1B", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Cancel />
            <Typography variant="h6">Reject Visitor</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please provide a reason for rejecting{" "}
            {confirmDialog.visitor?.visitor_name}'s visit
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            fullWidth
            multiline
            rows={4}
            value={confirmDialog.reason}
            onChange={(e) =>
              setConfirmDialog({ ...confirmDialog, reason: e.target.value })
            }
            error={confirmDialog.reason === ""}
            helperText={confirmDialog.reason === "" ? "Reason is required" : ""}
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
            onClick={() => handleReject(confirmDialog.visitor)}
            variant="contained"
            disabled={!confirmDialog.reason}
            sx={{
              backgroundColor: "#B31B1B",
              "&:hover": {
                backgroundColor: "#8A1515",
              },
              "&.Mui-disabled": {
                backgroundColor: "#A29EB6",
              },
            }}
          >
            Reject Visitor
          </Button>
        </DialogActions>
      </Dialog>
      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialog.open}
        onClose={() => setRescheduleDialog({ open: false, visitor: null })}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#E86100",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Schedule />
            <Typography variant="h6">Rescheduled Visit</Typography>
          </Box>
          <IconButton
            onClick={() => setRescheduleDialog({ open: false, visitor: null })}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h5"
              fontWeight={600}
              color="#E86100"
              gutterBottom
            >
              {rescheduleDialog.visitor?.visitor_name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visit has been rescheduled
            </Typography>
          </Box>

          {rescheduleDialog.visitor?.rescheduled_at && (
            <Paper
              sx={{
                p: 3,
                backgroundColor: "#E8610020",
                borderColor: "#E86100",
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
              >
                <CalendarToday sx={{ fontSize: 16, color: "#E86100" }} />
                Rescheduled At
              </Typography>
              <Typography variant="h6" fontWeight={700} color="#E86100">
                {format(
                  new Date(rescheduleDialog.visitor.rescheduled_at),
                  "dd MMM yyyy, HH:mm",
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getTimeAgo(rescheduleDialog.visitor.rescheduled_at)}
              </Typography>
            </Paper>
          )}

          <Paper sx={{ p: 2, borderColor: "#6F0B1420" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
            >
              <Description sx={{ fontSize: 16, color: "#6F0B14" }} />
              Purpose
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {rescheduleDialog.visitor?.purpose || "N/A"}
            </Typography>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRescheduleDialog({ open: false, visitor: null })}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
