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
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.extend(relativeTime);

export default function VisitorLog() {
  const [visitors, setVisitors] = useState([]);
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
      const societyId = localStorage.getItem("societyId");

      if (!societyId) {
        console.error("Society ID not found in localStorage");
        return;
      }

      let query = supabase
        .from("visitors")
        .select("*")
        .eq("society_id", societyId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq("approved_status", statusFilter);
      }

      if (visitorTypeFilter !== "all") {
        query = query.eq("visitor_type", visitorTypeFilter);
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
              today.subtract(7, "day").toISOString()
            );
            break;
          case "month":
            query = query.gte(
              "created_at",
              today.subtract(30, "day").toISOString()
            );
            break;
          default:
            break;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      setVisitors(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error fetching visitors:", error);
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

  const filteredVisitors = visitors.filter((visitor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      visitor.visitor_name?.toLowerCase().includes(searchLower) ||
      visitor.phone_number?.toLowerCase().includes(searchLower) ||
      visitor.flat_number?.toLowerCase().includes(searchLower) ||
      visitor.vehicle_number?.toLowerCase().includes(searchLower) ||
      visitor.purpose?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (visitor) => {
    setSelectedVisitor(visitor);
    setDetailDialogOpen(true);
  };

  const handleStatusUpdate = async (visitorId, newStatus) => {
    try {
      const { error } = await supabase
        .from("visitors")
        .update({
          approved_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", visitorId);

      if (error) throw error;

      // Refresh the visitor list
      fetchVisitors();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).fromNow();
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter, visitorTypeFilter, dateFilter]);

  return (
    <div className="p-6 font-roboto">
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
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Total Visitors
                  </Typography>
                  <Typography variant="h4" className="font-bold">
                    {stats.total}
                  </Typography>
                </div>
                <Avatar className="bg-primary bg-opacity-10">
                  <Person className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Pending
                  </Typography>
                  <Typography variant="h4" className="font-bold text-pending">
                    {stats.pending}
                  </Typography>
                </div>
                <Avatar className="bg-pending bg-opacity-10">
                  <WatchLater className="text-pending" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Approved
                  </Typography>
                  <Typography variant="h4" className="font-bold text-success">
                    {stats.approved}
                  </Typography>
                </div>
                <Avatar className="bg-success bg-opacity-10">
                  <CheckCircle className="text-success" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Checked Out
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {stats.checkedOut}
                  </Typography>
                </div>
                <Avatar className="bg-primary bg-opacity-10">
                  <Check className="text-primary" />
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
                  Status
                </TableCell>
                <TableCell className="font-semibold text-primary text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisitors.length === 0 ? (
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
                filteredVisitors.map((visitor) => (
                  <TableRow
                    key={visitor.id}
                    hover
                    className="hover:bg-lightBackground"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="bg-primary bg-opacity-10">
                          {visitorTypeConfig[visitor.visitor_type]?.icon ||
                            visitorTypeConfig.Other.icon}
                        </Avatar>
                        <div>
                          <Typography
                            variant="subtitle2"
                            className="font-semibold"
                          >
                            {visitor.visitor_name || "Unknown Visitor"}
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <Typography
                              variant="caption"
                              className="text-hintText"
                            >
                              {visitor.visitor_type || "Guest"}
                            </Typography>
                            {/* {visitor.visitor_otp && (
                              <Chip
                                label={`OTP: ${visitor.visitor_otp}`}
                                size="small"
                                className="bg-primary bg-opacity-10 text-primary text-xs"
                              />
                            )} */}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 mb-1">
                        <Home fontSize="small" className="text-hintText" />
                        <Typography variant="body2">
                          {visitor.flat_number || "N/A"}
                        </Typography>
                      </div>
                      {visitor.phone_number && (
                        <div className="flex items-center space-x-2">
                          <Phone fontSize="small" className="text-hintText" />
                          <Typography variant="body2" className="text-hintText">
                            {visitor.phone_number}
                          </Typography>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className="mb-1">
                        <span className="text-hintText font-medium">
                          Purpose:
                        </span>{" "}
                        {visitor.purpose || "No purpose specified"}
                      </Typography>

                      {visitor.vehicle_number && (
                        <div className="flex items-center space-x-2">
                          <CarIcon fontSize="small" className="text-hintText" />
                          <Typography
                            variant="caption"
                            className="text-hintText"
                          >
                            {visitor.vehicle_number}
                          </Typography>
                        </div>
                      )}
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
                      <Chip
                        icon={statusConfig[visitor.approved_status]?.icon}
                        label={visitor.approved_status || "Pending"}
                        size="small"
                        style={{
                          backgroundColor:
                            statusConfig[visitor.approved_status]?.bgColor,
                          color: statusConfig[visitor.approved_status]?.color,
                          border: `1px solid ${
                            statusConfig[visitor.approved_status]?.color
                          }`,
                        }}
                        className="font-medium"
                      />
                      {visitor.card_status && (
                        <Typography
                          variant="caption"
                          className="text-hintText block mt-1"
                        >
                          <CreditCard fontSize="inherit" />{" "}
                          {visitor.card_status}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex justify-center space-x-1">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(visitor)}
                          className="text-primary hover:bg-lightBackground"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        {visitor.approved_status === "Pending" && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdate(visitor.id, "Approved")
                              }
                              className="text-success hover:bg-green-50"
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdate(visitor.id, "Rejected")
                              }
                              className="text-reject hover:bg-red-50"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
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
                      {formatDateTime(selectedVisitor.in_time)}
                    </Typography>
                    <Typography variant="caption" className="text-hintText">
                      {getTimeAgo(selectedVisitor.in_time)}
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
              </Grid>
            </DialogContent>
            <DialogActions className="p-4 border-t">
              <Button
                onClick={() => setDetailDialogOpen(false)}
                className="text-primary hover:bg-lightBackground"
              >
                Close
              </Button>
              {selectedVisitor.approved_status === "Pending" && (
                <>
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedVisitor.id, "Approved");
                      setDetailDialogOpen(false);
                    }}
                    variant="contained"
                    className="bg-success hover:bg-green-700 text-white"
                    startIcon={<CheckCircle />}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedVisitor.id, "Rejected");
                      setDetailDialogOpen(false);
                    }}
                    variant="contained"
                    className="bg-reject hover:bg-red-800 text-white"
                    startIcon={<Close />}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
