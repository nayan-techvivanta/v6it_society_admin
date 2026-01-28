import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Badge,
  Tabs,
  Tab,
  Collapse,
  CardMedia,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Search,
  FilterList,
  Refresh,
  Visibility,
  CheckCircle,
  Cancel,
  Schedule,
  DirectionsWalk,
  DirectionsCar,
  LocalShipping,
  Build,
  MoreVert,
  Person,
  Phone,
  Home,
  CreditCard,
  Apartment,
  Domain,
  Download,
  CalendarToday,
  AccessTime,
  LocationCity,
  AdminPanelSettings,
  Image as ImageIcon,
  Verified,
  QrCode,
  ExpandMore,
  ExpandLess,
  PermIdentity,
  Receipt,
  DriveEta,
  Notes,
  Security,
  ScheduleSend,
  ExitToApp,
  TaskAlt,
  LocationOn,
  EventNote,
  CreditCardOff,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import { FaAddressCard, FaMobileAlt, FaPhone } from "react-icons/fa";

dayjs.extend(relativeTime);

export default function SuperAdminVisitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [societyFilter, setSocietyFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    checkedOut: 0,
    societies: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [expandedRows, setExpandedRows] = useState([]);

  const statusConfig = {
    Pending: {
      color: "#DBA400",
      bgColor: "rgba(219, 164, 0, 0.1)",
      icon: <Schedule />,
      label: "Pending",
    },
    Approved: {
      color: "#008000",
      bgColor: "rgba(0, 128, 0, 0.1)",
      icon: <CheckCircle />,
      label: "Approved",
    },
    Rejected: {
      color: "#B31B1B",
      bgColor: "rgba(179, 27, 27, 0.1)",
      icon: <Cancel />,
      label: "Rejected",
    },
    Reschedule: {
      color: "#E86100",
      bgColor: "rgba(232, 97, 0, 0.1)",
      icon: <ScheduleSend />,
      label: "Reschedule",
    },
    Checkout: {
      color: "#6F0B14",
      bgColor: "rgba(111, 11, 20, 0.1)",
      icon: <ExitToApp />,
      label: "Checked Out",
    },
  };

  const visitorTypeConfig = {
    Guest: {
      icon: <DirectionsWalk />,
      color: "#6F0B14",
      label: "Guest",
    },
    Delivery: {
      icon: <LocalShipping />,
      color: "#E86100",
      label: "Delivery",
    },
    Cab: {
      icon: <DirectionsCar />,
      color: "#008000",
      label: "Cab",
    },
    Maintenance: {
      icon: <Build />,
      color: "#DBA400",
      label: "Maintenance",
    },
    Other: {
      icon: <MoreVert />,
      color: "#A29EB6",
      label: "Other",
    },
  };

  // Fetch all societies
  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setSocieties(data || []);
    } catch (error) {
      console.error("Error fetching societies:", error);
    }
  };

  // Fetch all visitors from all societies
  const fetchVisitors = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("visitors")
        .select(
          `
          *,
          societies:society_id (id, name),
          buildings:building_id (name),
          flats:flat_id (flat_number)
          is_card_scan
        `,
        )
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq("approved_status", statusFilter);
      }

      if (visitorTypeFilter !== "all") {
        query = query.eq("visitor_type", visitorTypeFilter);
      }

      if (societyFilter !== "all") {
        query = query.eq("society_id", societyFilter);
      }

      // Apply date filter
      if (dateFilter !== "all") {
        const today = dayjs().startOf("day");
        switch (dateFilter) {
          case "today":
            query = query.gte("created_at", today.toISOString());
            break;
          case "week":
            query = query.gte(
              "created_at",
              today.subtract(7, "day").toISOString(),
            );
            break;
          case "month":
            query = query.gte(
              "created_at",
              today.subtract(30, "day").toISOString(),
            );
            break;
          default:
            break;
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data
      const processedVisitors = (data || []).map((visitor) => ({
        ...visitor,
        society_name: visitor.societies?.name || "Unknown Society",
        building_name: visitor.buildings?.name || null,
        flat_number: visitor.flats?.flat_number || visitor.flat_number || null,
      }));

      setVisitors(processedVisitors);
      calculateStats(processedVisitors);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (visitorsData) => {
    const societyCount = new Set(visitorsData.map((v) => v.society_id)).size;

    setStats({
      total: visitorsData.length,
      pending: visitorsData.filter((v) => v.approved_status === "Pending")
        .length,
      approved: visitorsData.filter((v) => v.approved_status === "Approved")
        .length,
      checkedOut: visitorsData.filter((v) => v.approved_status === "Checkout")
        .length,
      societies: societyCount,
    });
  };

  const toggleRowExpand = (visitorId) => {
    setExpandedRows((prev) =>
      prev.includes(visitorId)
        ? prev.filter((id) => id !== visitorId)
        : [...prev, visitorId],
    );
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.visitor_name?.toLowerCase().includes(searchLower) ||
      visitor.phone_number?.toLowerCase().includes(searchLower) ||
      visitor.flat_number?.toLowerCase().includes(searchLower) ||
      visitor.society_name?.toLowerCase().includes(searchLower) ||
      visitor.building_name?.toLowerCase().includes(searchLower) ||
      visitor.vehicle_number?.toLowerCase().includes(searchLower) ||
      visitor.purpose?.toLowerCase().includes(searchLower)
    );
  });

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).fromNow();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    switch (newValue) {
      case 0: // All
        setStatusFilter("all");
        break;
      case 1: // Pending
        setStatusFilter("Pending");
        break;
      case 2: // Approved
        setStatusFilter("Approved");
        break;
      case 3: // Checkout
        setStatusFilter("Checkout");
        break;
      case 4: // Reschedule
        setStatusFilter("Reschedule");
        break;
      default:
        setStatusFilter("all");
    }
  };
  const getCardScanStatus = (status) => {
    switch (status) {
      case "Scan":
        return "Scanned";
      case "WrongScan":
        return "Wrong Scan";
      case "NotScan":
        return "Not Scanned";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    fetchVisitors();
    fetchSocieties();
  }, [statusFilter, visitorTypeFilter, dateFilter, societyFilter]);

  return (
    <div className="p-6 font-roboto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-primary">
            All Society Visitors
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Super Admin - View visitors from all societies
          </Typography>
        </div>
      </div>

      {/* Tabs */}
      <Paper className="mb-6">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          className="border-b"
        >
          <Tab
            label={
              <div className="flex items-center gap-2">
                <span>All Visitors</span>
                {stats.total > 0 && (
                  <Badge
                    badgeContent={stats.total}
                    color="primary"
                    className="ml-2"
                  />
                )}
              </div>
            }
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <Schedule className="text-pending" fontSize="small" />
                <span>Pending</span>
                {stats.pending > 0 && (
                  <Badge
                    badgeContent={stats.pending}
                    color="warning"
                    className="ml-2"
                  />
                )}
              </div>
            }
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <CheckCircle className="text-success" fontSize="small" />
                <span>Approved</span>
                {stats.approved > 0 && (
                  <Badge
                    badgeContent={stats.approved}
                    color="success"
                    className="ml-2"
                  />
                )}
              </div>
            }
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <ExitToApp className="text-primary" fontSize="small" />
                <span>Checked Out</span>
                {stats.checkedOut > 0 && (
                  <Badge
                    badgeContent={stats.checkedOut}
                    color="info"
                    className="ml-2"
                  />
                )}
              </div>
            }
          />
          <Tab
            label={
              <div className="flex items-center gap-2">
                <ScheduleSend className="text-pending" fontSize="small" />
                <span>Reschedule</span>
              </div>
            }
          />
        </Tabs>
      </Paper>

      {/* Filters Section */}
      <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-hintText" />
                  </InputAdornment>
                ),
                className: "bg-white",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Society</InputLabel>
              <Select
                value={societyFilter}
                label="Society"
                onChange={(e) => setSocietyFilter(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="all">All Societies</MenuItem>
                {societies.map((society) => (
                  <MenuItem key={society.id} value={society.id}>
                    {society.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Visitor Type</InputLabel>
              <Select
                value={visitorTypeFilter}
                label="Visitor Type"
                onChange={(e) => setVisitorTypeFilter(e.target.value)}
                className="bg-white"
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

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateFilter}
                label="Date Range"
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3} className="text-right">
            <Typography variant="caption" className="text-hintText">
              Showing {filteredVisitors.length} of {visitors.length} visitors
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Visitors Table with Collapsible Rows */}
      <Paper className="shadow-sm border border-gray-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-lightBackground">
              <TableRow>
                <TableCell
                  width="50"
                  className="font-semibold text-primary"
                ></TableCell>
                <TableCell className="font-semibold text-primary">
                  Visitor Details
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Society & Location
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Visitor Type
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Visit purpose
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Visit Time
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Scaning Status
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Status
                </TableCell>
                <TableCell className="font-semibold text-primary text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <CircularProgress className="text-primary mb-4" />
                      <Typography variant="body1" className="text-hintText">
                        Loading visitors...
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Person className="text-hintText text-4xl mb-4" />
                      <Typography variant="h6" className="text-hintText mb-2">
                        {searchTerm ? "No visitors found" : "No visitors yet"}
                      </Typography>
                      <Typography variant="body2" className="text-hintText">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Visitors will appear here"}
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor) => (
                  <React.Fragment key={visitor.id}>
                    {/* Main Row */}
                    <TableRow hover className="hover:bg-lightBackground/50">
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpand(visitor.id)}
                        >
                          {expandedRows.includes(visitor.id) ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {visitor.image_url ? (
                            <Avatar
                              src={visitor.image_url}
                              alt={visitor.visitor_name}
                              className="border-2 border-primary/20"
                            />
                          ) : (
                            <Avatar className="bg-primary/10">
                              {visitorTypeConfig[visitor.visitor_type]?.icon ||
                                visitorTypeConfig.Other.icon}
                            </Avatar>
                          )}
                          <div className="flex flex-col space-y-1">
                            {/* Visitor Name */}
                            <Typography
                              variant="subtitle1"
                              className="font-semibold text-gray-800"
                            >
                              {visitor.visitor_name || "Unknown Visitor"}
                            </Typography>

                            {/* Phone Number */}
                            {visitor.phone_number && (
                              <div className="flex items-center space-x-1">
                                <FaMobileAlt className="text-gray-400 w-3 h-3" />{" "}
                                {/* optional phone icon */}
                                <Typography
                                  variant="body2"
                                  className="text-gray-500"
                                >
                                  {visitor.phone_number}
                                </Typography>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Domain fontSize="small" className="text-primary" />
                            <Typography variant="body2" className="font-medium">
                              {visitor.society_name}
                            </Typography>
                          </div>
                          <div className="flex items-center space-x-2">
                            {visitor.building_name ? (
                              <>
                                <Apartment
                                  fontSize="small"
                                  className="text-hintText"
                                />
                                <Typography
                                  variant="caption"
                                  className="text-hintText"
                                >
                                  {visitor.building_name}
                                  {visitor.flat_number &&
                                    ` • Flat ${visitor.flat_number}`}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="caption"
                                className="text-hintText italic"
                              >
                                No building specified
                              </Typography>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Box className="space-y-1">
                          <Typography variant="body2" className="font-medium">
                            {visitor.visitor_type || "Not specified"}
                          </Typography>

                          {visitor.card_number && (
                            <Tooltip
                              title={`Card Number: ${visitor.card_number}`}
                              arrow
                            >
                              <Chip
                                icon={<FaAddressCard size={12} />}
                                label={visitor.card_number}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.75rem",
                                  height: 22,
                                  padding: "0.5px",
                                  color: "text.secondary",
                                  borderColor: "divider",
                                  backgroundColor: "grey.50",
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <Typography variant="body2">
                            {visitor.purpose || "No purpose specified"}
                          </Typography>
                          {visitor.vehicle_number && (
                            <Typography
                              variant="caption"
                              className="text-hintText"
                            >
                              <DriveEta fontSize="inherit" />{" "}
                              {visitor.vehicle_number}
                            </Typography>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {formatDateTime(visitor.in_time)}
                        </Typography>
                        <Typography variant="caption" className="text-hintText">
                          {getTimeAgo(visitor.in_time)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {getCardScanStatus(visitor.is_card_scan)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Chip
                            icon={statusConfig[visitor.approved_status]?.icon}
                            label={visitor.approved_status}
                            size="small"
                            style={{
                              backgroundColor:
                                statusConfig[visitor.approved_status]?.bgColor,
                              color:
                                statusConfig[visitor.approved_status]?.color,
                              border: `1px solid ${
                                statusConfig[visitor.approved_status]?.color
                              }`,
                            }}
                            className="font-medium"
                          />
                          {/* {visitor.visitor_otp && (
                            <Chip
                              label={`OTP: ${visitor.visitor_otp}`}
                              size="small"
                              className="bg-primary/10 text-primary"
                              icon={<Security fontSize="small" />}
                            />
                          )} */}
                        </div>
                      </TableCell>

                      <TableCell align="center">
                        <div className="flex justify-center space-x-1">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedVisitor(visitor);
                                setDetailDialogOpen(true);
                              }}
                              className="text-primary hover:bg-lightBackground"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* {visitor.approved_status === "Pending" && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleStatusUpdate(visitor.id, "Approved")
                                  }
                                  className="text-success hover:bg-green-50"
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleStatusUpdate(visitor.id, "Rejected")
                                  }
                                  className="text-reject hover:bg-red-50"
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )} */}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Collapsible Detail Row */}
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={7}
                      >
                        <Collapse
                          in={expandedRows.includes(visitor.id)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box className="p-4 bg-gray-50">
                            <Grid container spacing={3}>
                              {/* Visitor Images */}
                              <Grid item xs={12} md={4}>
                                <Card className="h-full">
                                  <CardContent>
                                    <Typography
                                      variant="subtitle1"
                                      className="font-semibold mb-3 flex items-center"
                                    >
                                      <PermIdentity className="mr-2" />
                                      Visitor Photos
                                    </Typography>
                                    <div className="space-y-4">
                                      {visitor.image_url && (
                                        <div>
                                          <Typography
                                            variant="caption"
                                            className="text-hintText block mb-2"
                                          >
                                            Profile Photo
                                          </Typography>
                                          <CardMedia
                                            component="img"
                                            image={visitor.image_url}
                                            alt="Visitor"
                                            className="rounded-lg h-48 object-cover"
                                          />
                                        </div>
                                      )}
                                      {visitor.id_proof_image && (
                                        <div>
                                          <Typography
                                            variant="caption"
                                            className="text-hintText block mb-2"
                                          >
                                            ID Proof
                                          </Typography>
                                          <CardMedia
                                            component="img"
                                            image={visitor.id_proof_image}
                                            alt="ID Proof"
                                            className="rounded-lg h-48 object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Visit Details */}
                              <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                  {/* Basic Info */}
                                  <Grid item xs={12}>
                                    <Card>
                                      <CardContent>
                                        <Typography
                                          variant="subtitle1"
                                          className="font-semibold mb-3 flex items-center"
                                        >
                                          <Notes className="mr-2" />
                                          Visit Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid item xs={12} sm={6}>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Visit Type
                                            </Typography>
                                            <Typography variant="body2">
                                              {visitor.visit_type === "normal"
                                                ? "Normal Visit"
                                                : "Pre-Registered"}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Card Status
                                            </Typography>
                                            <Chip
                                              label={
                                                visitor.card_status || "N/A"
                                              }
                                              size="small"
                                              className={
                                                visitor.card_status === "OUT"
                                                  ? "bg-reject/10 text-reject"
                                                  : "bg-success/10 text-success"
                                              }
                                            />
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Card Number
                                            </Typography>
                                            <Typography variant="body2">
                                              {visitor.card_number || "N/A"}
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={12} sm={6}>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Card ID
                                            </Typography>
                                            <Typography variant="body2">
                                              {visitor.card_id || "N/A"}
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </CardContent>
                                    </Card>
                                  </Grid>

                                  {/* Security Information */}
                                  {/* <Grid item xs={12} sm={6}>
                                    <Card className="h-full">
                                      <CardContent>
                                        <Typography
                                          variant="subtitle1"
                                          className="font-semibold mb-3 flex items-center"
                                        >
                                          <Security className="mr-2" />
                                          Security Information
                                        </Typography>
                                        {/* {visitor.visitor_otp && (
                                          <div className="text-center">
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block mb-2"
                                            >
                                              Security OTP
                                            </Typography>
                                            <Typography
                                              variant="h4"
                                              className="font-bold text-primary tracking-widest"
                                            >
                                              {visitor.visitor_otp}
                                            </Typography>
                                          </div>
                                        )} 
                                        {visitor.verified_by_guard && (
                                          <div className="mt-3">
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Verified By Guard
                                            </Typography>
                                            <Typography variant="body2">
                                              ID: {visitor.verified_by_guard}
                                            </Typography>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </Grid> */}

                                  {/* Timing Information */}
                                  <Grid item xs={12} sm={6}>
                                    <Card className="h-full">
                                      <CardContent>
                                        <Typography
                                          variant="subtitle1"
                                          className="font-semibold mb-3 flex items-center"
                                        >
                                          <AccessTime className="mr-2" />
                                          Timing Information
                                        </Typography>
                                        <div className="space-y-2">
                                          <div>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Check-in Time
                                            </Typography>
                                            <Typography variant="body2">
                                              {formatDateTime(visitor.in_time)}
                                            </Typography>
                                          </div>
                                          <div>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Created At
                                            </Typography>
                                            <Typography variant="body2">
                                              {formatDateTime(
                                                visitor.created_at,
                                              )}
                                            </Typography>
                                          </div>
                                          <div>
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block"
                                            >
                                              Last Updated
                                            </Typography>
                                            <Typography variant="body2">
                                              {formatDateTime(
                                                visitor.updated_at,
                                              )}
                                            </Typography>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </Grid>

                                  {/* Additional Notes */}
                                  {visitor.rejected_reschedule_reason && (
                                    <Grid item xs={12}>
                                      <Card className="bg-red-50 border-red-200">
                                        <CardContent>
                                          <Typography
                                            variant="subtitle1"
                                            className="font-semibold text-reject mb-2 flex items-center"
                                          >
                                            <Cancel className="mr-2" />
                                            {visitor.approved_status ===
                                            "Reschedule"
                                              ? "Reschedule Reason"
                                              : "Rejection Reason"}
                                          </Typography>
                                          <Typography variant="body2">
                                            {visitor.rejected_reschedule_reason}
                                          </Typography>
                                          {visitor.rescheduled_at && (
                                            <Typography
                                              variant="caption"
                                              className="text-hintText block mt-2"
                                            >
                                              Rescheduled for:{" "}
                                              {formatDateTime(
                                                visitor.rescheduled_at,
                                              )}
                                            </Typography>
                                          )}
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}
                                </Grid>
                              </Grid>
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
      </Paper>

      {/* Visitor Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: "rounded-2xl",
          sx: { maxHeight: "90vh" },
        }}
      >
        {selectedVisitor && (
          <>
            {/* Dialog Header */}
            <DialogTitle className="bg-gradient-to-r from-primary to-primary/90 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h5" className="font-bold">
                    Visitor Details
                  </Typography>
                  <Typography variant="body2" className="text-white/90 mt-1">
                    Complete visitor information and tracking
                  </Typography>
                </div>
                <div className="flex items-center gap-3">
                  <Chip
                    label={selectedVisitor.visitor_type}
                    size="small"
                    className="bg-white/20 text-white border-white/30 font-medium"
                    icon={visitorTypeConfig[selectedVisitor.visitor_type]?.icon}
                  />
                  <Avatar className="bg-white/20">
                    <Person className="text-white" />
                  </Avatar>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="p-0 overflow-hidden">
              {/* Main Content Container */}
              <div className="p-6">
                <Grid container spacing={3}>
                  {/* Left Column - Images (xs=12 md=4) */}
                  <Grid item xs={12} md={4}>
                    {/* Profile Photo */}
                    <Card className="mb-4 overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <Typography
                          variant="subtitle1"
                          className="font-medium flex items-center"
                        >
                          <ImageIcon className="mr-2" fontSize="small" />
                          Profile Photo
                        </Typography>
                      </div>
                      <CardMedia
                        component="img"
                        image={
                          selectedVisitor.image_url ||
                          "/api/placeholder/400/300"
                        }
                        alt="Visitor Profile"
                        className="h-72 object-cover bg-gray-100"
                      />
                    </Card>

                    {/* ID Proof Document */}
                    {selectedVisitor.id_proof_image && (
                      <Card className="overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                          <Typography
                            variant="subtitle1"
                            className="font-medium flex items-center"
                          >
                            <Badge className="mr-2" fontSize="small" />
                            ID Proof Document
                          </Typography>
                        </div>
                        <CardMedia
                          component="img"
                          image={selectedVisitor.id_proof_image}
                          alt="ID Proof"
                          className="h-56 object-cover bg-gray-100"
                        />
                      </Card>
                    )}
                  </Grid>

                  {/* Right Column - All Details (xs=12 md=8) */}
                  <Grid item xs={12} md={8}>
                    {/* Visitor Header */}
                    <div className="mb-6">
                      <Typography
                        variant="h4"
                        className="font-bold text-gray-900 mb-3"
                      >
                        {selectedVisitor.visitor_name}
                      </Typography>
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip
                          label={selectedVisitor.visitor_type}
                          size="medium"
                          className="font-medium"
                          style={{
                            backgroundColor: `${visitorTypeConfig[selectedVisitor.visitor_type]?.color}15`,
                            color:
                              visitorTypeConfig[selectedVisitor.visitor_type]
                                ?.color,
                          }}
                          icon={
                            visitorTypeConfig[selectedVisitor.visitor_type]
                              ?.icon
                          }
                        />
                        <Chip
                          icon={
                            statusConfig[selectedVisitor.approved_status]?.icon
                          }
                          label={selectedVisitor.approved_status}
                          size="medium"
                          className="font-medium"
                          style={{
                            backgroundColor:
                              statusConfig[selectedVisitor.approved_status]
                                ?.bgColor,
                            color:
                              statusConfig[selectedVisitor.approved_status]
                                ?.color,
                          }}
                        />
                        {selectedVisitor.visitor_otp && (
                          <Chip
                            label={`OTP: ${selectedVisitor.visitor_otp}`}
                            size="medium"
                            className="bg-primary/10 text-primary font-bold"
                            icon={<Security fontSize="small" />}
                          />
                        )}
                      </div>
                    </div>

                    {/* Row 1: Contact + Vehicle */}
                    <Grid container spacing={2} className="mb-4">
                      <Grid item xs={12} sm={6}>
                        <Card className="h-full">
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              className="font-medium mb-3 flex items-center text-gray-700"
                            >
                              <Phone
                                className="mr-2 text-primary"
                                fontSize="small"
                              />
                              Contact Information
                            </Typography>
                            <Typography
                              variant="h6"
                              className="font-bold text-gray-900 mb-1"
                            >
                              {selectedVisitor.phone_number || "Not provided"}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-gray-500"
                            >
                              Primary contact number
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card className="h-full">
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              className="font-medium mb-3 flex items-center text-gray-700"
                            >
                              <DirectionsCar
                                className="mr-2 text-primary"
                                fontSize="small"
                              />
                              Vehicle Information
                            </Typography>
                            <Typography
                              variant="h6"
                              className="font-bold text-gray-900"
                            >
                              {selectedVisitor.vehicle_number || "No vehicle"}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Society Information */}
                    <Card className="mb-4">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          className="font-medium mb-3 flex items-center text-gray-700"
                        >
                          <Domain
                            className="mr-2 text-primary"
                            fontSize="small"
                          />
                          Society Information
                        </Typography>
                        <Typography
                          variant="h6"
                          className="font-bold text-gray-900 mb-1"
                        >
                          {selectedVisitor.society_name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          Society ID: {selectedVisitor.society_id}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Location Details */}
                    <Card className="mb-4">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          className="font-medium mb-3 flex items-center text-gray-700"
                        >
                          <LocationOn
                            className="mr-2 text-primary"
                            fontSize="small"
                          />
                          Location Details
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={4}>
                            <div>
                              <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                              >
                                Building
                              </Typography>
                              <Typography
                                variant="h6"
                                className="font-bold text-gray-900"
                              >
                                {selectedVisitor.building_name ||
                                  "Not specified"}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-gray-500"
                              >
                                Building ID: {selectedVisitor.building_id}
                              </Typography>
                            </div>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <div>
                              <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                              >
                                Flat Number
                              </Typography>
                              <Typography
                                variant="h6"
                                className="font-bold text-gray-900"
                              >
                                {selectedVisitor.flat_number || "Not specified"}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-gray-500"
                              >
                                Flat ID: {selectedVisitor.flat_id}
                              </Typography>
                            </div>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <div>
                              <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                              >
                                Unit Type
                              </Typography>
                              <Typography
                                variant="h6"
                                className="font-bold text-gray-900"
                              >
                                {selectedVisitor.unit_type || "Residential"}
                              </Typography>
                            </div>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Row 2: Purpose + Timing */}
                    <Grid container spacing={2} className="mb-4">
                      <Grid item xs={12} md={8}>
                        <Card className="h-full">
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              className="font-medium mb-3 flex items-center text-gray-700"
                            >
                              <EventNote
                                className="mr-2 text-primary"
                                fontSize="small"
                              />
                              Purpose of Visit
                            </Typography>
                            <Typography
                              variant="body1"
                              className="text-gray-800"
                            >
                              {selectedVisitor.purpose ||
                                "No purpose specified"}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card className="h-full">
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              className="font-medium mb-3 flex items-center text-gray-700"
                            >
                              <AccessTime
                                className="mr-2 text-primary"
                                fontSize="small"
                              />
                              Timing Information
                            </Typography>
                            <div className="space-y-3">
                              <div>
                                <Typography
                                  variant="caption"
                                  className="text-gray-500 block"
                                >
                                  Check-in Time
                                </Typography>
                                <Typography
                                  variant="body1"
                                  className="font-bold text-gray-900"
                                >
                                  {formatDateTime(selectedVisitor.in_time)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className="text-gray-500"
                                >
                                  {getTimeAgo(selectedVisitor.in_time)}
                                </Typography>
                              </div>
                              {selectedVisitor.partial_checkout_at && (
                                <div>
                                  <Typography
                                    variant="caption"
                                    className="text-gray-500 block"
                                  >
                                    Partial Checkout
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    className="font-bold text-warning"
                                  >
                                    {formatDateTime(
                                      selectedVisitor.partial_checkout_at,
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="text-gray-500"
                                  >
                                    {getTimeAgo(
                                      selectedVisitor.partial_checkout_at,
                                    )}
                                  </Typography>
                                </div>
                              )}
                              {selectedVisitor.checkout_at && (
                                <div>
                                  <Typography
                                    variant="caption"
                                    className="text-gray-500 block"
                                  >
                                    Final Checkout
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    className="font-bold text-error"
                                  >
                                    {formatDateTime(
                                      selectedVisitor.checkout_at,
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="text-gray-500"
                                  >
                                    {getTimeAgo(selectedVisitor.checkout_at)}
                                  </Typography>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Card Information (Conditional) */}
                    {selectedVisitor.card_id && (
                      <Card className="bg-gray-50 mb-4">
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            className="font-medium mb-3 flex items-center text-gray-700"
                          >
                            <CreditCard
                              className="mr-2 text-primary"
                              fontSize="small"
                            />
                            Card Information
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                              >
                                Card ID
                              </Typography>
                              <Typography
                                variant="body1"
                                className="font-bold text-gray-900"
                              >
                                {selectedVisitor.card_id}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                              >
                                Card Status
                              </Typography>
                              <Chip
                                label={selectedVisitor.card_status || "N/A"}
                                size="small"
                                className={`font-medium ${
                                  selectedVisitor.card_status === "OUT"
                                    ? "bg-error/10 text-error"
                                    : "bg-success/10 text-success"
                                }`}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                              >
                                Card Number
                              </Typography>
                              <Typography
                                variant="body1"
                                className="font-bold text-gray-900"
                              >
                                {selectedVisitor.card_number || "N/A"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                    {/* Card Scan Status (Always Visible) */}
                    <Card className="bg-emerald-50/50 mb-4 border border-emerald-200/50">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          className="font-medium mb-3 flex items-center text-emerald-700"
                        >
                          <CreditCardOff className="mr-2" fontSize="small" />
                          Card Scan Status
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography
                              variant="body2"
                              className="text-gray-500 mb-1"
                            >
                              Scan Result
                            </Typography>
                            <Chip
                              label={getCardScanStatus(
                                selectedVisitor.is_card_scan,
                              )}
                              size="medium"
                              className={`
                    font-medium px-3 py-1
                    ${
                      selectedVisitor.is_card_scan === "Scan"
                        ? "bg-success/20 text-success border-success/30"
                        : selectedVisitor.is_card_scan === "WrongScan"
                          ? "bg-warning/20 text-warning border-warning/30"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                    }
                  `}
                              icon={
                                selectedVisitor.is_card_scan === "Scan" ? (
                                  <CheckCircle fontSize="small" />
                                ) : selectedVisitor.is_card_scan ===
                                  "WrongScan" ? (
                                  <Warning fontSize="small" />
                                ) : (
                                  <RadioButtonUnchecked fontSize="small" />
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <Typography
                              variant="body2"
                              className="text-gray-600"
                            >
                              {selectedVisitor.is_card_scan === "Scan" &&
                                "Card successfully scanned and verified."}
                              {selectedVisitor.is_card_scan === "WrongScan" &&
                                "Card scan failed - incorrect or damaged card."}
                              {selectedVisitor.is_card_scan === "NotScan" &&
                                "No card scan attempted or detected."}
                              {!selectedVisitor.is_card_scan &&
                                "Scan status not recorded."}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Rejection Reason (Conditional) */}
                    {selectedVisitor.rejected_reschedule_reason &&
                      selectedVisitor.approved_status !== "Approved" &&
                      selectedVisitor.approved_status !== "Checkout" && (
                        <Card className="bg-red-50 border border-red-200">
                          <CardContent>
                            <Typography
                              variant="subtitle1"
                              className="font-medium text-red-600 mb-2 flex items-center"
                            >
                              {selectedVisitor.approved_status ===
                              "Reschedule" ? (
                                <>
                                  <Schedule className="mr-2" fontSize="small" />
                                  Reschedule Reason
                                </>
                              ) : (
                                <>
                                  <Cancel className="mr-2" fontSize="small" />
                                  Rejection Reason
                                </>
                              )}
                            </Typography>
                            <Typography
                              variant="body1"
                              className="text-gray-800"
                            >
                              {selectedVisitor.rejected_reschedule_reason}
                            </Typography>
                            {selectedVisitor.rescheduled_at && (
                              <Typography
                                variant="caption"
                                className="text-gray-500 block mt-2"
                              >
                                Rescheduled for:{" "}
                                {formatDateTime(selectedVisitor.rescheduled_at)}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      )}
                  </Grid>
                </Grid>
              </div>
            </DialogContent>

            {/* Dialog Actions */}
            <DialogActions className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end w-full items-center">
                <Button
                  onClick={() => setDetailDialogOpen(false)}
                  variant="outlined"
                  className="border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-gray-50"
                >
                  Close
                </Button>
              </div>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
