import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  CircularProgress,
  Avatar,
  Badge,
  Collapse,
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
  DirectionsCar as CarIcon,
  CreditCard,
  Schedule as ScheduleIcon,
  Check,
  Close,
  WatchLater,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

// import { supabase } from "../../api/supabaseClient";
import { fetchSocietyVisitors } from "../../api/visitors";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.extend(relativeTime);
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

export default function VisitorLog() {
  const [visitorGroups, setVisitorGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    checkedOut: 0,
  });
  const [expandedGroups, setExpandedGroups] = useState({});

  const statusConfig = {
    Pending: {
      color: "#DBA400",
      bgColor: "rgba(219, 164, 0, 0.1)",
      icon: <WatchLater />,
    },
    Approved: {
      color: "#008000",
      bgColor: "rgba(0, 128, 0, 0.1)",
      icon: <CheckCircle />,
    },
    Rejected: {
      color: "#B31B1B",
      bgColor: "rgba(179, 27, 27, 0.1)",
      icon: <Close />,
    },
    Reschedule: {
      color: "#E86100",
      bgColor: "rgba(232, 97, 0, 0.1)",
      icon: <ScheduleIcon />,
    },
    Checkout: {
      color: "#6F0B14",
      bgColor: "rgba(111, 11, 20, 0.1)",
      icon: <Check />,
    },
    PartialCheckout: {
      color: "#A29EB6",
      bgColor: "rgba(162, 158, 182, 0.1)",
      icon: <Schedule />,
    },
  };

  const visitorTypeConfig = {
    Guest: {
      icon: <DirectionsWalk />,
      color: "#6F0B14",
    },
    Delivery: {
      icon: <LocalShipping />,
      color: "#E86100",
    },
    Cab: {
      icon: <DirectionsCar />,
      color: "#008000",
    },
    Maintenance: {
      icon: <Build />,
      color: "#DBA400",
    },
    Other: {
      icon: <MoreVert />,
      color: "#A29EB6",
    },
  };

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const societyId = localStorage.getItem("societyId");

      if (!societyId) {
        console.error("Society ID not found in localStorage");
        return;
      }

      const result = await fetchSocietyVisitors(societyId);

      if (result.success && result.visitors) {
        setVisitorGroups(result.visitors);

        const flattenedVisitors = result.visitors.flatMap(
          (group) => group.all_visitors || [],
        );
        calculateStats(flattenedVisitors);
      } else {
        console.error("Failed to fetch visitors:", result.error);
        setVisitorGroups([]);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
      setVisitorGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (visitorsData) => {
    const stats = {
      total: visitorsData.length,
      pending: visitorsData.filter((v) => v.approved_status === "Pending")
        .length,
      approved: visitorsData.filter((v) => v.approved_status === "Approved")
        .length,
      checkedOut: visitorsData.filter((v) => v.approved_status === "Checkout")
        .length,
    };
    setStats(stats);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleGroupExpand = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const filteredGroups = visitorGroups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    const mainVisitor = group.all_visitors?.[0] || group;

    const groupMatchesSearch = group.all_visitors?.some((visitor) => {
      return (
        visitor.visitor_name?.toLowerCase().includes(searchLower) ||
        visitor.phone_number?.toLowerCase().includes(searchLower) ||
        visitor.flat_number?.toLowerCase().includes(searchLower) ||
        visitor.vehicle_number?.toLowerCase().includes(searchLower) ||
        visitor.purpose?.toLowerCase().includes(searchLower)
      );
    });

    if (statusFilter !== "all" && visitorTypeFilter !== "all") {
      return (
        groupMatchesSearch &&
        group.all_visitors?.some((v) => v.approved_status === statusFilter) &&
        group.all_visitors?.some((v) => v.visitor_type === visitorTypeFilter)
      );
    }

    if (statusFilter !== "all") {
      return (
        groupMatchesSearch &&
        group.all_visitors?.some((v) => v.approved_status === statusFilter)
      );
    }

    if (visitorTypeFilter !== "all") {
      return (
        groupMatchesSearch &&
        group.all_visitors?.some((v) => v.visitor_type === visitorTypeFilter)
      );
    }

    return groupMatchesSearch;
  });

  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setDetailDialogOpen(true);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).fromNow();
  };

  const getLatestVisitTime = (allVisitors) => {
    if (!allVisitors || allVisitors.length === 0) return null;
    return allVisitors.reduce((latest, visitor) => {
      const currentTime = visitor.in_time || visitor.created_at;
      return currentTime > latest ? currentTime : latest;
    }, allVisitors[0].in_time || allVisitors[0].created_at);
  };

  const getVisitorType = (allVisitors) => {
    if (!allVisitors || allVisitors.length === 0) return "Guest";
    return allVisitors[0].visitor_type || "Guest";
  };

  const getFlatNumber = (allVisitors) => {
    if (!allVisitors || allVisitors.length === 0) return "N/A";
    return allVisitors[0].flat_number || "N/A";
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter, visitorTypeFilter, dateFilter]);

  // Apply date filter to the groups
  useEffect(() => {
    if (visitorGroups.length > 0) {
      let filtered = [...visitorGroups];

      if (dateFilter !== "all") {
        const today = dayjs().startOf("day");
        filtered = filtered.filter((group) => {
          const latestVisitTime = getLatestVisitTime(group.all_visitors);
          if (!latestVisitTime) return false;

          const visitDate = dayjs(latestVisitTime);
          switch (dateFilter) {
            case "today":
              return visitDate.isSame(today, "day");
            case "week":
              return visitDate.isAfter(today.subtract(7, "day"));
            case "month":
              return visitDate.isAfter(today.subtract(30, "day"));
            default:
              return true;
          }
        });
      }

      // Calculate stats from filtered groups
      const flattenedVisitors = filtered.flatMap(
        (group) => group.all_visitors || [],
      );
      calculateStats(flattenedVisitors);
    }
  }, [visitorGroups, dateFilter]);

  return (
    <div className="p-6 font-roboto max-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h4" className="font-semibold text-primary">
            Visitor Log
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Manage and track all visitor entries
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchVisitors}
          className="bg-button hover:bg-primary text-white normal-case"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Refresh"}
        </Button>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="body2"
                    style={{ color: theme.textSecondary }}
                  >
                    Total Visitors
                  </Typography>
                  <Typography
                    variant="h5"
                    className="font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {stats.total}
                  </Typography>
                </div>
                <Avatar className="bg-blue-50" style={{ color: theme.primary }}>
                  <Person />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="body2"
                    style={{ color: theme.textSecondary }}
                  >
                    Pending
                  </Typography>
                  <Typography
                    variant="h5"
                    className="font-bold"
                    style={{ color: theme.pending }}
                  >
                    {stats.pending}
                  </Typography>
                </div>
                <Avatar
                  className="bg-yellow-50"
                  style={{ color: theme.pending }}
                >
                  <WatchLater />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Approved */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="body2"
                    style={{ color: theme.textSecondary }}
                  >
                    Approved
                  </Typography>
                  <Typography
                    variant="h5"
                    className="font-bold"
                    style={{ color: theme.success }}
                  >
                    {stats.approved}
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
        </Grid>

        {/* Checked Out */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="rounded-lg border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="body2"
                    style={{ color: theme.textSecondary }}
                  >
                    Checked Out
                  </Typography>
                  <Typography
                    variant="h5"
                    className="font-bold"
                    style={{ color: theme.primary }}
                  >
                    {stats.checkedOut}
                  </Typography>
                </div>
                <Avatar className="bg-blue-50" style={{ color: theme.primary }}>
                  <Check />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search visitors..."
              value={searchTerm}
              onChange={handleSearch}
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
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Reschedule">Reschedule</MenuItem>
                <MenuItem value="Checkout">Checkout</MenuItem>
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
        </Grid>
      </Paper>

      {/* Visitors Table */}
      <Paper className="shadow-sm border border-gray-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-lightBackground">
              <TableRow>
                <TableCell className="font-semibold text-primary">
                  Visitor Details
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Flat/Contact
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Purpose & Vehicle
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Visit Time
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Status & Entries
                </TableCell>
                <TableCell className="font-semibold text-primary text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Person className="text-hintText text-4xl mb-4" />
                      <Typography variant="h6" className="text-hintText mb-2">
                        {searchTerm ? "No visitors found" : "No visitors yet"}
                      </Typography>
                      <Typography variant="body2" className="text-hintText">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Visitors will appear here once registered"}
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => {
                  const allVisitors = group.all_visitors || [];
                  const mainVisitor = allVisitors[0] || group;
                  const isExpanded = expandedGroups[group.id] || false;
                  const latestVisitTime = getLatestVisitTime(allVisitors);

                  return (
                    <React.Fragment key={group.id}>
                      {/* Main Group Row */}
                      <TableRow hover className="hover:bg-lightBackground">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <IconButton
                              size="small"
                              onClick={() => toggleGroupExpand(group.id)}
                            >
                              {isExpanded ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                            <Avatar className="bg-primary bg-opacity-10">
                              {visitorTypeConfig[getVisitorType(allVisitors)]
                                ?.icon || visitorTypeConfig.Other.icon}
                            </Avatar>
                            <div>
                              <Typography
                                variant="subtitle2"
                                className="font-semibold"
                              >
                                {mainVisitor.visitor_name || "Unknown Visitor"}
                              </Typography>
                              <div className="flex items-center space-x-2">
                                <Typography
                                  variant="caption"
                                  className="text-hintText"
                                >
                                  {getVisitorType(allVisitors)}
                                </Typography>
                                <Chip
                                  label={`${group.total_entries || allVisitors.length} visits`}
                                  size="small"
                                  className="bg-primary bg-opacity-10 text-primary text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 mb-1">
                            <Home fontSize="small" className="text-hintText" />
                            <Typography variant="body2">
                              {getFlatNumber(allVisitors)}
                            </Typography>
                          </div>
                          {mainVisitor.phone_number && (
                            <div className="flex items-center space-x-2">
                              <Phone
                                fontSize="small"
                                className="text-hintText"
                              />
                              <Typography
                                variant="body2"
                                className="text-hintText"
                              >
                                {mainVisitor.phone_number}
                              </Typography>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="mb-1">
                            <span className="text-hintText font-medium">
                              Purpose:
                            </span>{" "}
                            {mainVisitor.purpose || "No purpose specified"}
                          </Typography>

                          {mainVisitor.vehicle_number && (
                            <div className="flex items-center space-x-2">
                              <CarIcon
                                fontSize="small"
                                className="text-hintText"
                              />
                              <Typography
                                variant="caption"
                                className="text-hintText"
                              >
                                {mainVisitor.vehicle_number}
                              </Typography>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="font-medium">
                            {formatDateTime(latestVisitTime)}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-hintText"
                          >
                            {getTimeAgo(latestVisitTime)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-2">
                            <Chip
                              icon={
                                statusConfig[mainVisitor.approved_status]?.icon
                              }
                              label={mainVisitor.approved_status || "Pending"}
                              size="small"
                              style={{
                                backgroundColor:
                                  statusConfig[mainVisitor.approved_status]
                                    ?.bgColor,
                                color:
                                  statusConfig[mainVisitor.approved_status]
                                    ?.color,
                                border: `1px solid ${
                                  statusConfig[mainVisitor.approved_status]
                                    ?.color
                                }`,
                              }}
                              className="font-medium w-fit"
                            />
                            <div className="flex items-center space-x-1">
                              <Typography
                                variant="caption"
                                className="text-hintText"
                              >
                                <Person fontSize="inherit" /> Total Entries:
                              </Typography>
                              <Typography
                                variant="caption"
                                className="font-semibold text-primary"
                              >
                                {group.total_entries || allVisitors.length}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex justify-center space-x-1">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(mainVisitor)}
                              className="text-primary hover:bg-lightBackground"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Rows for Individual Visits */}
                      {isExpanded && allVisitors.length > 1 && (
                        <TableRow>
                          <TableCell colSpan={6} className="p-0">
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                            >
                              <div className="bg-gray-50 p-4">
                                <Typography
                                  variant="subtitle2"
                                  className="font-semibold mb-3 text-gray-700"
                                >
                                  All Visits ({allVisitors.length})
                                </Typography>
                                <div className="space-y-3">
                                  {allVisitors.map((visit, index) => (
                                    <div
                                      key={visit.id}
                                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex-1">
                                        <Typography
                                          variant="body2"
                                          className="font-medium"
                                        >
                                          Visit #{index + 1}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          className="text-hintText"
                                        >
                                          {formatDateTime(
                                            visit.in_time || visit.created_at,
                                          )}
                                        </Typography>
                                      </div>
                                      <div className="flex-1">
                                        <Typography
                                          variant="caption"
                                          className="text-hintText"
                                        >
                                          Flat:
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          className="font-medium"
                                        >
                                          {visit.flat_number || "N/A"}
                                        </Typography>
                                      </div>
                                      <div className="flex-1">
                                        <Typography
                                          variant="caption"
                                          className="text-hintText"
                                        >
                                          Status:
                                        </Typography>
                                        <Chip
                                          label={
                                            visit.approved_status || "Pending"
                                          }
                                          size="small"
                                          style={{
                                            backgroundColor:
                                              statusConfig[
                                                visit.approved_status
                                              ]?.bgColor,
                                            color:
                                              statusConfig[
                                                visit.approved_status
                                              ]?.color,
                                            border: `1px solid ${
                                              statusConfig[
                                                visit.approved_status
                                              ]?.color
                                            }`,
                                          }}
                                          className="font-medium"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <Typography
                                          variant="caption"
                                          className="text-hintText"
                                        >
                                          Type:
                                        </Typography>
                                        <Typography variant="body2">
                                          {visit.visit_type || "normal"}
                                        </Typography>
                                      </div>
                                      <div>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleViewDetails(visit)
                                          }
                                          className="text-primary"
                                        >
                                          <Visibility fontSize="small" />
                                        </IconButton>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Visitor Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-lg",
        }}
      >
        {selectedVisitor && (
          <>
            <DialogTitle className="bg-primary text-white">
              <Typography variant="h6" className="font-semibold">
                Visitor Details
              </Typography>
            </DialogTitle>
            <DialogContent className="p-6 mt-5">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-16 h-16 bg-primary bg-opacity-10">
                      {visitorTypeConfig[selectedVisitor.visitor_type]?.icon}
                    </Avatar>
                    <div>
                      <Typography variant="h6" className="font-semibold">
                        {selectedVisitor.visitor_name}
                      </Typography>
                      <Chip
                        label={selectedVisitor.visitor_type}
                        size="small"
                        style={{
                          backgroundColor:
                            visitorTypeConfig[selectedVisitor.visitor_type]
                              ?.color + "20",
                          color:
                            visitorTypeConfig[selectedVisitor.visitor_type]
                              ?.color,
                        }}
                      />
                      {selectedVisitor.visit_type && (
                        <Chip
                          label={selectedVisitor.visit_type}
                          size="small"
                          className="ml-2 bg-primary bg-opacity-10 text-primary"
                        />
                      )}
                    </div>
                  </div>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      <Phone fontSize="small" /> Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedVisitor.phone_number || "N/A"}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      <Home fontSize="small" /> Flat Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedVisitor.flat_number || "N/A"}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      Purpose of Visit
                    </Typography>
                    <Typography variant="body1">
                      {selectedVisitor.purpose || "No purpose specified"}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      <CarIcon fontSize="small" /> Vehicle Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedVisitor.vehicle_number || "N/A"}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      <CreditCard fontSize="small" /> Card Details
                    </Typography>
                    <Typography variant="body1">
                      ID: {selectedVisitor.card_id || "N/A"}
                      {selectedVisitor.card_status &&
                        ` • ${selectedVisitor.card_status}`}
                    </Typography>
                    {selectedVisitor.is_card_scan && (
                      <Typography variant="caption" className="text-hintText">
                        Scan Status: {selectedVisitor.is_card_scan}
                      </Typography>
                    )}
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      <ScheduleIcon fontSize="small" /> Check-in Time
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {formatDateTime(
                        selectedVisitor.in_time || selectedVisitor.created_at,
                      )}
                    </Typography>
                    <Typography variant="caption" className="text-hintText">
                      {getTimeAgo(
                        selectedVisitor.in_time || selectedVisitor.created_at,
                      )}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" className="p-3">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-1"
                    >
                      Status
                    </Typography>
                    <Chip
                      icon={statusConfig[selectedVisitor.approved_status]?.icon}
                      label={selectedVisitor.approved_status}
                      size="medium"
                      style={{
                        backgroundColor:
                          statusConfig[selectedVisitor.approved_status]
                            ?.bgColor,
                        color:
                          statusConfig[selectedVisitor.approved_status]?.color,
                        border: `1px solid ${
                          statusConfig[selectedVisitor.approved_status]?.color
                        }`,
                      }}
                      className="font-medium"
                    />
                  </Card>
                </Grid>

                {selectedVisitor.visitor_otp && (
                  <Grid item xs={12}>
                    <Card variant="outlined" className="p-3 bg-lightBackground">
                      <Typography
                        variant="subtitle2"
                        className="text-hintText mb-1"
                      >
                        Security OTP
                      </Typography>
                      <Typography
                        variant="h5"
                        className="text-primary font-bold text-center"
                      >
                        {selectedVisitor.visitor_otp}
                      </Typography>
                    </Card>
                  </Grid>
                )}

                {selectedVisitor.rejected_reschedule_reason && (
                  <Grid item xs={12}>
                    <Card
                      variant="outlined"
                      className="p-3 bg-red-50 border-red-200"
                    >
                      <Typography
                        variant="subtitle2"
                        className="text-reject mb-1 font-semibold"
                      >
                        Rejection/Reschedule Reason
                      </Typography>
                      <Typography variant="body1" className="text-gray-700">
                        {selectedVisitor.rejected_reschedule_reason}
                      </Typography>
                    </Card>
                  </Grid>
                )}

                {selectedVisitor.image_url && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" className="p-3">
                      <Typography
                        variant="subtitle2"
                        className="text-hintText mb-1"
                      >
                        Visitor Image
                      </Typography>
                      <div className="flex justify-center">
                        <img
                          src={selectedVisitor.image_url}
                          alt="Visitor"
                          className="rounded-lg max-h-48 object-cover"
                        />
                      </div>
                    </Card>
                  </Grid>
                )}

                {selectedVisitor.id_proof_image && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" className="p-3">
                      <Typography
                        variant="subtitle2"
                        className="text-hintText mb-1"
                      >
                        ID Proof
                      </Typography>
                      <div className="flex justify-center">
                        <img
                          src={selectedVisitor.id_proof_image}
                          alt="ID Proof"
                          className="rounded-lg max-h-48 object-cover"
                        />
                      </div>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions className="p-4 border-t">
              <Button
                onClick={() => setDetailDialogOpen(false)}
                className="text-primary hover:bg-lightBackground"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
