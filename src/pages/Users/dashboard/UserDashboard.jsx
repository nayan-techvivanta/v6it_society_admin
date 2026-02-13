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
} from "@mui/icons-material";
import { supabase } from "../../../api/supabaseClient";

const normalizeRole = (rawRole = "") => {
  const r = rawRole.toLowerCase().replace("-", "");
  if (r === "tanento") return "tenant_o";
  if (r === "tanentm") return "tenant_m";
  if (r === "security") return "security";
  return r;
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
    userDbId: null, // This will store the users table ID
  });

  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
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
  const [assignCardDialog, setAssignCardDialog] = useState({
    open: false,
    visitor: null,
    cardNumber: "",
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [visitors, activeFilter, search]);

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
      const authUserId = localStorage.getItem("userId"); // This is the registed_user_id (UUID)

      console.log("Initializing with:", {
        societyId,
        buildingId,
        flatId,
        authUserId,
        normalizedRole,
      });

      if (!societyId) {
        throw new Error("Society ID not found. Please login again.");
      }

      // Fetch society name
      let societyName = "N/A";
      if (societyId) {
        const { data: society, error: societyError } = await supabase
          .from("societies")
          .select("name")
          .eq("id", societyId)
          .single();

        if (!societyError && society) {
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

      console.log("User details set:", userInfo);
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
      console.log("Fetching visitors with:", { user, role });

      let query = supabase
        .from("visitors")
        .select("*")
        .eq("society_id", user.societyId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (role === "security" && user.buildingId) {
        query = query.eq("building_id", user.buildingId);
        console.log("Filtering by building:", user.buildingId);
      }

      if ((role === "tenant_o" || role === "tenant_m") && user.flatId) {
        query = query.eq("flat_id", user.flatId);
        console.log("Filtering by flat:", user.flatId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Visitors fetched:", data);
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

    let temp = [...visitors];

    if (activeFilter !== "All") {
      temp = temp.filter((v) => v.approved_status === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(
        (v) =>
          v.visitor_name?.toLowerCase().includes(q) ||
          v.phone_number?.includes(q) ||
          v.vehicle_number?.toLowerCase().includes(q),
      );
    }

    setFilteredVisitors(temp);
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
            updated_at: now,
          };
          successMessage = "Visit rescheduled";
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

      console.log(`Updating visitor ${visitor.id}:`, updateData);

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
    const statusColors = {
      Pending: { bg: "#DBA400", icon: <Schedule sx={{ fontSize: 16 }} /> },
      Approved: { bg: "#008000", icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      Reschedule: { bg: "#E86100", icon: <Schedule sx={{ fontSize: 16 }} /> },
      Rejected: { bg: "#dc2626", icon: <Cancel sx={{ fontSize: 16 }} /> },
      Checkout: { bg: "#6B7280", icon: <ExitToApp sx={{ fontSize: 16 }} /> },
    };

    const color = statusColors[status] || statusColors.Pending;

    return (
      <Chip
        icon={color.icon}
        label={status || "Unknown"}
        size="small"
        sx={{
          bgcolor: color.bg,
          color: "white",
          fontWeight: 500,
          "& .MuiChip-icon": { color: "white" },
        }}
      />
    );
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "—";
    try {
      return new Date(timestamp).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const handleRefresh = () => {
    init();
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ p: 4, maxWidth: 1400, mx: "auto" }}>
        <Skeleton
          variant="rectangular"
          height={100}
          sx={{ mb: 2, borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          height={60}
          sx={{ mb: 2, borderRadius: 2 }}
        />
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={80}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "80vh",
        // bgcolor: "#f5f5f5",
        // fontFamily: "Roboto, sans-serif",
        // pb: 4,
      }}
    >
      <Box
        sx={{
          // maxWidth: 1400,
          mx: "auto",
          // px: { xs: 2, sm: 3, md: 4 },
          // py: { xs: 3, sm: 4 },
        }}
      >
        {/* Society Info Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "#6F0B14",
            color: "white",
            borderRadius: 2,
            background: "linear-gradient(135deg, #6F0B14 0%, #8B0F1A 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {userDetails.societyName}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                {userDetails.buildingName && (
                  <Chip
                    icon={<MeetingRoom sx={{ color: "white !important" }} />}
                    label={userDetails.buildingName}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                  />
                )}
                {userDetails.flatNumber && (
                  <Chip
                    icon={<Home sx={{ color: "white !important" }} />}
                    label={`Flat ${userDetails.flatNumber}`}
                    sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                  />
                )}
              </Stack>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={role || "User"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  textTransform: "capitalize",
                }}
              />
              <IconButton
                size="small"
                onClick={handleRefresh}
                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.1)" }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Search and Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            position: "sticky",
            top: 16,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, phone, or vehicle number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch("")}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              overflowX: "auto",
              pb: 1,
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "grey.300",
                borderRadius: 2,
              },
            }}
          >
            {["All", "Pending", "Approved", "Reschedule"].map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "contained" : "outlined"}
                onClick={() => setActiveFilter(filter)}
                sx={{
                  minWidth: "auto",
                  borderRadius: 20,
                  px: 3,
                  borderColor:
                    filter === "Pending"
                      ? "#DBA400"
                      : filter === "Approved"
                        ? "#008000"
                        : filter === "Reschedule"
                          ? "#E86100"
                          : "#6F0B14",
                  color:
                    activeFilter === filter
                      ? "white"
                      : filter === "Pending"
                        ? "#DBA400"
                        : filter === "Approved"
                          ? "#008000"
                          : filter === "Reschedule"
                            ? "#E86100"
                            : "#6F0B14",
                  bgcolor:
                    activeFilter === filter
                      ? filter === "Pending"
                        ? "#DBA400"
                        : filter === "Approved"
                          ? "#008000"
                          : filter === "Reschedule"
                            ? "#E86100"
                            : "#6F0B14"
                      : "transparent",
                  "&:hover": {
                    bgcolor:
                      activeFilter === filter
                        ? filter === "Pending"
                          ? "#DBA400"
                          : filter === "Approved"
                            ? "#008000"
                            : filter === "Reschedule"
                              ? "#E86100"
                              : "#6F0B14"
                        : `${
                            filter === "Pending"
                              ? "#DBA400"
                              : filter === "Approved"
                                ? "#008000"
                                : filter === "Reschedule"
                                  ? "#E86100"
                                  : "#6F0B14"
                          }10`,
                  },
                }}
              >
                {filter}
                {filter !== "All" && (
                  <Chip
                    size="small"
                    label={
                      visitors.filter((v) => v.approved_status === filter)
                        .length
                    }
                    sx={{
                      ml: 1,
                      height: 20,
                      bgcolor:
                        activeFilter === filter
                          ? "white"
                          : filter === "Pending"
                            ? "#DBA400"
                            : filter === "Approved"
                              ? "#008000"
                              : filter === "Reschedule"
                                ? "#E86100"
                                : "#6F0B14",
                      color:
                        activeFilter === filter
                          ? filter === "Pending"
                            ? "#DBA400"
                            : filter === "Approved"
                              ? "#008000"
                              : filter === "Reschedule"
                                ? "#E86100"
                                : "#6F0B14"
                          : "white",
                      "& .MuiChip-label": { px: 1, fontSize: "0.625rem" },
                    }}
                  />
                )}
              </Button>
            ))}
          </Stack>
        </Paper>

        {/* Visitors Table/Cards */}
        {filteredVisitors.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
            <Info sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Visitors Found
            </Typography>
            <Typography variant="body2" color="textSecondary">
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
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell width={80}>Photo</TableCell>
                  <TableCell>Visitor Name</TableCell>
                  <TableCell>Phone</TableCell>
                  {!isMobile && <TableCell>Type</TableCell>}
                  {!isMobile && <TableCell>Flat</TableCell>}
                  <TableCell>In Time</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <React.Fragment key={visitor.id}>
                    {/* Main Row */}
                    <TableRow
                      sx={{
                        "&:hover": { bgcolor: "#f5f5f5" },
                        cursor: "pointer",
                        bgcolor: expandedRows[visitor.id]
                          ? "#f8f9fa"
                          : "inherit",
                      }}
                      onClick={() =>
                        setExpandedRows((prev) => ({
                          ...prev,
                          [visitor.id]: !prev[visitor.id],
                        }))
                      }
                    >
                      <TableCell>
                        <IconButton size="small">
                          {expandedRows[visitor.id] ? (
                            <KeyboardArrowDown sx={{ color: "#6F0B14" }} />
                          ) : (
                            <KeyboardArrowRight sx={{ color: "#6F0B14" }} />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        <Tooltip
                          title={
                            visitor.image_url ? "Click to preview" : "No image"
                          }
                        >
                          <Avatar
                            src={visitor.image_url}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (visitor.image_url) {
                                setImagePreview(visitor.image_url);
                              }
                            }}
                            sx={{
                              cursor: visitor.image_url ? "pointer" : "default",
                              "&:hover": visitor.image_url
                                ? { opacity: 0.8 }
                                : {},
                              bgcolor: "#6F0B14",
                            }}
                          >
                            {!visitor.image_url && <Person />}
                          </Avatar>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight="medium">
                          {visitor.visitor_name}
                        </Typography>
                      </TableCell>

                      <TableCell>{visitor.phone_number || "—"}</TableCell>

                      {!isMobile && (
                        <TableCell>{visitor.visitor_type || "—"}</TableCell>
                      )}

                      {!isMobile && (
                        <TableCell>{visitor.flat_number || "—"}</TableCell>
                      )}

                      <TableCell>{formatDateTime(visitor.in_time)}</TableCell>

                      <TableCell>
                        {getStatusChip(visitor.approved_status)}
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
                          <Box sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#6F0B14", mb: 2 }}
                            >
                              Additional Details
                            </Typography>

                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: 2,
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Purpose
                                </Typography>
                                <Typography variant="body2">
                                  {visitor.purpose || "—"}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Vehicle Number
                                </Typography>
                                <Typography variant="body2">
                                  {visitor.vehicle_number || "—"}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Card Number
                                </Typography>
                                <Typography variant="body2">
                                  {visitor.card_number || "—"}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Visit Type
                                </Typography>
                                <Typography variant="body2">
                                  {visitor.visit_type || "—"}
                                </Typography>
                              </Box>

                              {visitor.rejected_reschedule_reason && (
                                <Box>
                                  <Typography variant="caption" color="error">
                                    Reason
                                  </Typography>
                                  <Typography variant="body2" color="error">
                                    {visitor.rejected_reschedule_reason}
                                  </Typography>
                                </Box>
                              )}

                              {visitor.checkout_at && (
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="textSecondary"
                                  >
                                    Checkout Time
                                  </Typography>
                                  <Typography variant="body2">
                                    {formatDateTime(visitor.checkout_at)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Action Buttons */}
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
                                      handleVisitorAction(visitor, "approve");
                                    }}
                                    disabled={
                                      actionLoading[`${visitor.id}-approve`]
                                    }
                                  >
                                    {actionLoading[`${visitor.id}-approve`] ? (
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
                                      handleVisitorAction(
                                        visitor,
                                        "reschedule",
                                      );
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
                                    setAssignCardDialog({
                                      open: true,
                                      visitor,
                                      cardNumber: "",
                                    });
                                  }}
                                  disabled={visitor.card_number}
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
                                    handleVisitorAction(visitor, "checkout");
                                  }}
                                  disabled={
                                    visitor.approved_status === "Checkout"
                                  }
                                >
                                  Checkout
                                </Button>
                              </Stack>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!imagePreview}
        onClose={() => setImagePreview(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: "#6F0B14",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Visitor Image
          <IconButton
            onClick={() => setImagePreview(null)}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <img
              src={imagePreview}
              alt="Visitor"
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 8,
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
      >
        <DialogTitle sx={{ bgcolor: "#6F0B14", color: "white" }}>
          Confirm {confirmDialog.action}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to <strong>{confirmDialog.action}</strong>{" "}
            this visitor?
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {confirmDialog.visitor?.visitor_name}
          </Typography>

          {confirmDialog.requiresReason && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason"
              placeholder="Please provide a reason"
              sx={{ mt: 2 }}
              value={confirmDialog.reason}
              onChange={(e) =>
                setConfirmDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
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
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor:
                confirmDialog.action === "reject" ? "#dc2626" : "#6F0B14",
              "&:hover": {
                bgcolor:
                  confirmDialog.action === "reject" ? "#b91c1c" : "#8B0F1A",
              },
            }}
            onClick={() =>
              handleVisitorAction(confirmDialog.visitor, confirmDialog.action, {
                reason: confirmDialog.reason,
              })
            }
            disabled={confirmDialog.requiresReason && !confirmDialog.reason}
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
      >
        <DialogTitle sx={{ bgcolor: "#6F0B14", color: "white" }}>
          Assign Card
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Visitor: <strong>{assignCardDialog.visitor?.visitor_name}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Card Number"
            value={assignCardDialog.cardNumber}
            onChange={(e) =>
              setAssignCardDialog((prev) => ({
                ...prev,
                cardNumber: e.target.value,
              }))
            }
            sx={{ mt: 2 }}
            placeholder="Enter card number"
          />
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
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: "#6F0B14", "&:hover": { bgcolor: "#8B0F1A" } }}
            onClick={() =>
              handleVisitorAction(assignCardDialog.visitor, "assignCard", {
                cardNumber: assignCardDialog.cardNumber,
              })
            }
            disabled={!assignCardDialog.cardNumber}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
