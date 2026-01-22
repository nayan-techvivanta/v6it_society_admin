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
  CardMedia,
  Divider,
} from "@mui/material";
import {
  Search,
  FilterList,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  PriorityHigh,
  Help,
  BugReport,
  Assignment,
  Description,
  Image as ImageIcon,
  Person,
  Apartment,
  Domain,
  CalendarToday,
  AccessTime,
  Download,
  FilterAlt,
  MoreVert,
  Chat,
  TaskAlt,
  Pending,
  ClosedCaption,
  SmsFailed,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.extend(relativeTime);

export default function AdminTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [users, setUsers] = useState({});
  const [societies, setSocieties] = useState({});
  const [buildings, setBuildings] = useState({});

  const priorityConfig = {
    high: {
      color: "#B31B1B",
      bgColor: "rgba(179, 27, 27, 0.1)",
      icon: <PriorityHigh />,
      label: "High",
    },
    medium: {
      color: "#DBA400",
      bgColor: "rgba(219, 164, 0, 0.1)",
      icon: <Help />,
      label: "Medium",
    },
    low: {
      color: "#008000",
      bgColor: "rgba(0, 128, 0, 0.1)",
      icon: <BugReport />,
      label: "Low",
    },
  };

  const statusConfig = {
    open: {
      color: "#DBA400",
      bgColor: "rgba(219, 164, 0, 0.1)",
      icon: <Assignment />,
      label: "Open",
    },
    in_progress: {
      color: "#6F0B14",
      bgColor: "rgba(111, 11, 20, 0.1)",
      icon: <Pending />,
      label: "In Progress",
    },
    resolved: {
      color: "#008000",
      bgColor: "rgba(0, 128, 0, 0.1)",
      icon: <TaskAlt />,
      label: "Resolved",
    },
    closed: {
      color: "#A29EB6",
      bgColor: "rgba(162, 158, 182, 0.1)",
      icon: <ClosedCaption />,
      label: "Closed",
    },
  };

  // Fetch all related data
  const fetchRelatedData = async (ticketsData) => {
    try {
      console.log("📌 fetchRelatedData called");
      console.log("🧾 Tickets received:", ticketsData);

      if (!ticketsData || ticketsData.length === 0) return;

      // ---------------- USERS ----------------
      const userIds = [
        ...new Set(ticketsData.map((t) => t.user_id).filter(Boolean)),
      ];
      console.log("👤 User IDs:", userIds);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      if (usersError) console.error("❌ Users error:", usersError);

      // ---------------- SOCIETIES ----------------
      const societyIds = [
        ...new Set(ticketsData.map((t) => t.society_id).filter(Boolean)),
      ];
      console.log("🏢 Society IDs:", societyIds);

      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name")
        .in("id", societyIds);

      if (societiesError) console.error("❌ Societies error:", societiesError);

      // ---------------- BUILDINGS ----------------
      const buildingIds = [
        ...new Set(ticketsData.map((t) => t.building_id).filter(Boolean)),
      ];
      console.log("🏗️ Building IDs:", buildingIds);

      const { data: buildingsData, error: buildingsError } = await supabase
        .from("buildings")
        .select("id, name")
        .in("id", buildingIds);

      if (buildingsError) console.error("❌ Buildings error:", buildingsError);

      // ---------------- MAPS ----------------
      const usersMap = {};
      usersData?.forEach((u) => (usersMap[u.id] = u));

      const societiesMap = {};
      societiesData?.forEach((s) => (societiesMap[s.id] = s));

      const buildingsMap = {};
      buildingsData?.forEach((b) => (buildingsMap[b.id] = b));

      console.log("🗺️ Users Map:", usersMap);
      console.log("🗺️ Societies Map:", societiesMap);
      console.log("🗺️ Buildings Map:", buildingsMap);

      setUsers(usersMap);
      setSocieties(societiesMap);
      setBuildings(buildingsMap);
    } catch (err) {
      console.error("🔥 fetchRelatedData error:", err);
    }
  };

  // --------------------------------------------------
  // Fetch all tickets
  // --------------------------------------------------
  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log("📌 fetchTickets called");

      const societyId = localStorage.getItem("societyId");
      console.log("🏢 Society ID:", societyId);

      let query = supabase.from("ticket").select("*").order("created_at");

      if (societyId) {
        query = query.eq("society_id", societyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Ticket fetch error:", error);
        throw error;
      }

      console.log("🎫 Tickets fetched:", data);

      setTickets(data || []);
      calculateStats(data || []);

      if (data && data.length > 0) {
        console.log("➡️ Fetching related data");
        await fetchRelatedData(data);
      } else {
        console.log("⚠️ No tickets found");
      }
    } catch (error) {
      console.error("🔥 Error fetching tickets:", error);
    } finally {
      setLoading(false);
      console.log("⏹️ fetchTickets finished");
    }
  };

  const calculateStats = (ticketsData) => {
    const stats = {
      total: ticketsData.length,
      open: ticketsData.filter((t) => !t.resolved_at && !t.closed_at).length,
      inProgress: ticketsData.filter((t) => t.in_progress && !t.resolved_at)
        .length,
      resolved: ticketsData.filter((t) => t.resolved_at && !t.closed_at).length,
      closed: ticketsData.filter((t) => t.closed_at).length,
    };
    setStats(stats);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone.",
      )
    ) {
      try {
        const { error } = await supabase
          .from("ticket")
          .delete()
          .eq("id", ticketId);

        if (error) throw error;

        setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));

        // Update stats
        const deletedTicket = tickets.find((t) => t.id === ticketId);
        if (deletedTicket) {
          setStats((prev) => ({
            ...prev,
            total: prev.total - 1,
            // Update specific status counts if needed
          }));
        }
      } catch (error) {
        console.error("Error deleting ticket:", error);
      }
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      const updates = {};

      switch (newStatus) {
        case "in_progress":
          updates.in_progress = true;
          updates.resolved_at = null;
          updates.closed_at = null;
          break;
        case "resolved":
          updates.resolved_at = new Date().toISOString();
          updates.closed_at = null;
          break;
        case "closed":
          updates.closed_at = new Date().toISOString();
          updates.resolved_at = new Date().toISOString();
          break;
        default:
          updates.in_progress = false;
          updates.resolved_at = null;
          updates.closed_at = null;
      }

      const { error } = await supabase
        .from("ticket")
        .update(updates)
        .eq("id", ticketId);

      if (error) throw error;

      // Update local state
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updates } : ticket,
        ),
      );

      // Update stats
      fetchTickets(); // Refresh to recalculate stats
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      ticket.details?.toLowerCase().includes(searchLower) ||
      users[ticket.user_id]?.name?.toLowerCase().includes(searchLower) ||
      societies[ticket.society_id]?.name?.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && !ticket.resolved_at && !ticket.closed_at) ||
      (statusFilter === "in_progress" &&
        ticket.in_progress &&
        !ticket.resolved_at) ||
      (statusFilter === "resolved" &&
        ticket.resolved_at &&
        !ticket.closed_at) ||
      (statusFilter === "closed" && ticket.closed_at);

    return matchesSearch && matchesStatus;
  });

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).fromNow();
  };

  const getTicketStatus = (ticket) => {
    if (ticket.closed_at) return "closed";
    if (ticket.resolved_at) return "resolved";
    if (ticket.in_progress) return "in_progress";
    return "open";
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6 font-roboto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-primary">
            Support Tickets
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Manage and track all support tickets
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTickets}
            className="border-primary text-primary hover:bg-lightBackground"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {stats.total}
                  </Typography>
                </div>
                <Avatar className="bg-primary/10">
                  <Description className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-pending">
                    {stats.open}
                  </Typography>
                </div>
                <Avatar className="bg-pending/10">
                  <Assignment className="text-pending" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    In Progress
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {stats.inProgress}
                  </Typography>
                </div>
                <Avatar className="bg-primary/10">
                  <Pending className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Resolved
                  </Typography>
                  <Typography variant="h4" className="font-bold text-success">
                    {stats.resolved}
                  </Typography>
                </div>
                <Avatar className="bg-success/10">
                  <TaskAlt className="text-success" />
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
              placeholder="Search tickets by details or user..."
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
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
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

          <Grid item xs={12} sm={6} md={4} className="text-right">
            <Typography variant="caption" className="text-hintText">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tickets Table */}
      <Paper className="shadow-sm border border-gray-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-lightBackground">
              <TableRow>
                <TableCell className="font-semibold text-primary">
                  Ticket Details
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  User & Location
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Description
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Created Date
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
                  <TableCell colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <CircularProgress className="text-primary mb-4" />
                      <Typography variant="body1" className="text-hintText">
                        Loading tickets...
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Assignment className="text-hintText text-4xl mb-4" />
                      <Typography variant="h6" className="text-hintText mb-2">
                        {searchTerm
                          ? "No tickets found"
                          : "No tickets available"}
                      </Typography>
                      <Typography variant="body2" className="text-hintText">
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Create your first ticket to get started"}
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const ticketStatus = getTicketStatus(ticket);
                  const user = users[ticket.user_id];
                  const society = societies[ticket.society_id];
                  const building = buildings[ticket.building_id];

                  return (
                    <TableRow
                      key={ticket.id}
                      hover
                      className="hover:bg-lightBackground/50"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="bg-primary/10">
                            <Description className="text-primary" />
                          </Avatar>
                          <div>
                            <Typography
                              variant="subtitle2"
                              className="font-semibold"
                            >
                              Ticket #{ticket.id}
                            </Typography>
                            <div className="flex items-center space-x-2 mt-1">
                              <Chip
                                icon={<PriorityHigh />}
                                label="High"
                                size="small"
                                className="bg-red-100 text-red-800"
                              />
                              {ticket.image && (
                                <Chip
                                  icon={<ImageIcon />}
                                  label="Has Image"
                                  size="small"
                                  className="bg-blue-100 text-blue-800"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          {user && (
                            <div className="flex items-center space-x-2">
                              <Person
                                fontSize="small"
                                className="text-primary"
                              />
                              <div>
                                <Typography
                                  variant="body2"
                                  className="font-medium"
                                >
                                  {user.name || "Unknown User"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className="text-hintText"
                                >
                                  ID: {ticket.user_id}
                                </Typography>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            {society ? (
                              <>
                                <Domain
                                  fontSize="small"
                                  className="text-primary"
                                />
                                <Typography
                                  variant="caption"
                                  className="text-hintText"
                                >
                                  {society.name}
                                  {building && ` • ${building.name}`}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="caption"
                                className="text-hintText italic"
                              >
                                No location specified
                              </Typography>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" className="line-clamp-2">
                          {ticket.details || "No description provided"}
                        </Typography>
                        {ticket.details && ticket.details.length > 100 && (
                          <Typography
                            variant="caption"
                            className="text-hintText"
                          >
                            ...more
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {formatDateTime(ticket.created_at)}
                        </Typography>
                        <Typography variant="caption" className="text-hintText">
                          {getTimeAgo(ticket.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={statusConfig[ticketStatus]?.icon}
                          label={statusConfig[ticketStatus]?.label}
                          size="small"
                          style={{
                            backgroundColor:
                              statusConfig[ticketStatus]?.bgColor,
                            color: statusConfig[ticketStatus]?.color,
                            border: `1px solid ${statusConfig[ticketStatus]?.color}`,
                          }}
                          className="font-medium"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <div className="flex justify-center space-x-1">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setDetailDialogOpen(true);
                              }}
                              className="text-primary hover:bg-lightBackground"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as In Progress">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdate(ticket.id, "in_progress")
                              }
                              className="text-blue-600 hover:bg-blue-50"
                              disabled={
                                ticketStatus === "in_progress" ||
                                ticketStatus === "closed"
                              }
                            >
                              <Pending fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Resolved">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleStatusUpdate(ticket.id, "resolved")
                              }
                              className="text-success hover:bg-green-50"
                              disabled={
                                ticketStatus === "resolved" ||
                                ticketStatus === "closed"
                              }
                            >
                              <TaskAlt fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Ticket">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="text-reject hover:bg-red-50"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "rounded-xl",
        }}
      >
        {selectedTicket && (
          <>
            <DialogTitle className="bg-gradient-to-r from-primary to-primary/90 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h5" className="font-bold">
                    Ticket Details
                  </Typography>
                  <Typography variant="body2" className="text-white/90">
                    Complete ticket information
                  </Typography>
                </div>
                <Avatar className="bg-white/20">
                  <Description className="text-white" />
                </Avatar>
              </div>
            </DialogTitle>

            <DialogContent className="p-6">
              <Grid container spacing={3}>
                {/* Ticket Header */}
                <Grid item xs={12}>
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <Typography
                          variant="caption"
                          className="text-primary font-semibold"
                        >
                          TICKET ID
                        </Typography>
                        <Typography
                          variant="h4"
                          className="font-bold text-primary"
                        >
                          #{selectedTicket.id}
                        </Typography>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Chip
                          icon={<PriorityHigh />}
                          label="High Priority"
                          className="bg-red-100 text-red-800 font-bold"
                        />
                        <Chip
                          icon={
                            statusConfig[getTicketStatus(selectedTicket)]?.icon
                          }
                          label={
                            statusConfig[getTicketStatus(selectedTicket)]?.label
                          }
                          style={{
                            backgroundColor:
                              statusConfig[getTicketStatus(selectedTicket)]
                                ?.bgColor,
                            color:
                              statusConfig[getTicketStatus(selectedTicket)]
                                ?.color,
                          }}
                          className="font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </Grid>

                {/* User Information */}
                <Grid item xs={12} md={6}>
                  <Card className="h-full">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center"
                      >
                        <Person className="mr-2" />
                        User Information
                      </Typography>
                      {users[selectedTicket.user_id] ? (
                        <div>
                          <Typography
                            variant="body1"
                            className="font-semibold mb-1"
                          >
                            {users[selectedTicket.user_id].name}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-hintText block"
                          >
                            User ID: {selectedTicket.user_id}
                          </Typography>
                          {users[selectedTicket.user_id].email && (
                            <Typography
                              variant="caption"
                              className="text-hintText block"
                            >
                              Email: {users[selectedTicket.user_id].email}
                            </Typography>
                          )}
                        </div>
                      ) : (
                        <Typography
                          variant="body2"
                          className="text-gray-500 italic"
                        >
                          User information not available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Location Information */}
                <Grid item xs={12} md={6}>
                  <Card className="h-full">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center"
                      >
                        <Domain className="mr-2" />
                        Location Information
                      </Typography>
                      <div className="space-y-2">
                        {societies[selectedTicket.society_id] ? (
                          <div>
                            <Typography
                              variant="body2"
                              className="text-hintText"
                            >
                              Society
                            </Typography>
                            <Typography
                              variant="body1"
                              className="font-semibold"
                            >
                              {societies[selectedTicket.society_id].name}
                            </Typography>
                          </div>
                        ) : (
                          <Typography
                            variant="body2"
                            className="text-gray-500 italic"
                          >
                            Society not specified
                          </Typography>
                        )}
                        {buildings[selectedTicket.building_id] && (
                          <div>
                            <Typography
                              variant="body2"
                              className="text-hintText"
                            >
                              Building
                            </Typography>
                            <Typography
                              variant="body1"
                              className="font-semibold"
                            >
                              {buildings[selectedTicket.building_id].name}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Ticket Description */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center"
                      >
                        <Description className="mr-2" />
                        Ticket Description
                      </Typography>
                      <Typography
                        variant="body1"
                        className="text-gray-800 whitespace-pre-line"
                      >
                        {selectedTicket.details || "No description provided"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Ticket Image */}
                {selectedTicket.image && (
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          className="font-semibold mb-3 flex items-center"
                        >
                          <ImageIcon className="mr-2" />
                          Attached Image
                        </Typography>
                        <CardMedia
                          component="img"
                          image={selectedTicket.image}
                          alt="Ticket Image"
                          className="rounded-lg max-h-96 object-contain"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Timing Information */}
                <Grid item xs={12} md={6}>
                  <Card className="h-full">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center"
                      >
                        <CalendarToday className="mr-2" />
                        Created Date
                      </Typography>
                      <Typography variant="body1" className="font-semibold">
                        {formatDateTime(selectedTicket.created_at)}
                      </Typography>
                      <Typography variant="caption" className="text-hintText">
                        {getTimeAgo(selectedTicket.created_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Status Information */}
                <Grid item xs={12} md={6}>
                  <Card className="h-full">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        className="font-semibold mb-3 flex items-center"
                      >
                        <AccessTime className="mr-2" />
                        Status Information
                      </Typography>
                      <div className="space-y-2">
                        {selectedTicket.resolved_at && (
                          <div>
                            <Typography
                              variant="caption"
                              className="text-hintText block"
                            >
                              Resolved Date
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold text-success"
                            >
                              {formatDateTime(selectedTicket.resolved_at)}
                            </Typography>
                          </div>
                        )}
                        {selectedTicket.closed_at && (
                          <div>
                            <Typography
                              variant="caption"
                              className="text-hintText block"
                            >
                              Closed Date
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold text-gray-600"
                            >
                              {formatDateTime(selectedTicket.closed_at)}
                            </Typography>
                          </div>
                        )}
                        {selectedTicket.in_progress && (
                          <Chip
                            icon={<Pending />}
                            label="In Progress"
                            className="bg-primary/10 text-primary"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions className="p-6 bg-gray-50 border-t">
              <div className="flex justify-between w-full items-center">
                <Button
                  onClick={() => setDetailDialogOpen(false)}
                  variant="outlined"
                  className="border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-lightBackground"
                >
                  Close
                </Button>

                <div className="space-x-3">
                  {getTicketStatus(selectedTicket) === "open" && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedTicket.id, "in_progress");
                        setDetailDialogOpen(false);
                      }}
                      variant="contained"
                      className="bg-primary hover:bg-primary/90 text-white"
                      startIcon={<Pending />}
                    >
                      Mark as In Progress
                    </Button>
                  )}
                  {getTicketStatus(selectedTicket) === "in_progress" && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedTicket.id, "resolved");
                        setDetailDialogOpen(false);
                      }}
                      variant="contained"
                      className="bg-success hover:bg-green-700 text-white"
                      startIcon={<TaskAlt />}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {getTicketStatus(selectedTicket) === "resolved" && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedTicket.id, "closed");
                        setDetailDialogOpen(false);
                      }}
                      variant="contained"
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                      startIcon={<ClosedCaption />}
                    >
                      Close Ticket
                    </Button>
                  )}
                </div>
              </div>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
