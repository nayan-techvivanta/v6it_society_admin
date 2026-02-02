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
} from "@mui/material";
import {
  Search,
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
  AccessTime,
  Image as ImageIcon,
  Security,
  ScheduleSend,
  ExitToApp,
  DriveEta,
  EventNote,
  CreditCardOff,
  RadioButtonUnchecked,
  Warning,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { fetchSocietyVisitors } from "../../api/visitors";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.extend(relativeTime);

export default function PmVisitors() {
  const [visitorGroups, setVisitorGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [societyFilter, setSocietyFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [assignedSocieties, setAssignedSocieties] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    checkedOut: 0,
    societies: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [expandedVisitors, setExpandedVisitors] = useState({});
  const [pmId, setPmId] = useState(null);

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

  // Fetch PM's assigned societies
  const fetchAssignedSocieties = async () => {
    try {
      // Get PM profile ID from localStorage
      const profileId = localStorage.getItem("profileId");
      if (!profileId) {
        console.error("No profile ID found in localStorage");
        setLoading(false);
        return;
      }

      setPmId(profileId);

      // Fetch PM's assigned societies
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", profileId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setAssignedSocieties([]);
        setLoading(false);
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      // Fetch society details
      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name")
        .in("id", societyIds)
        .order("name");

      if (societiesError) throw societiesError;

      setAssignedSocieties(societiesData || []);

      // Fetch visitors for these societies
      await fetchAllVisitors(societiesData);
    } catch (error) {
      console.error("Error fetching assigned societies:", error);
      setLoading(false);
    }
  };

  // Fetch visitors for all assigned societies
  const fetchAllVisitors = async (societies) => {
    try {
      setLoading(true);
      const allGroups = [];
      const allVisitors = [];

      // Fetch visitors for each assigned society
      for (const society of societies) {
        try {
          const result = await fetchSocietyVisitors(society.id.toString());

          if (result.success && result.visitors) {
            const groupsWithSocietyInfo = result.visitors.map((group) => ({
              ...group,
              society_id: society.id,
              society_name: society.name,
              all_visitors: (group.all_visitors || []).map((visitor) => ({
                ...visitor,
                society_id: society.id,
                society_name: society.name,
                flat_number: visitor.flat_number || group.flat_number || null,
              })),
            }));

            allGroups.push(...groupsWithSocietyInfo);

            const flattenedVisitors = result.visitors.flatMap(
              (group) => group.all_visitors || [],
            );
            allVisitors.push(...flattenedVisitors);
          }
        } catch (error) {
          console.error(
            `Error fetching visitors for society ${society.name}:`,
            error,
          );
        }
      }

      setVisitorGroups(allGroups);
      calculateStats(allVisitors);
    } catch (error) {
      console.error("Error fetching all visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch visitors for specific society
  const fetchSocietyVisitorsData = async (societyId) => {
    try {
      const result = await fetchSocietyVisitors(societyId);

      if (result.success && result.visitors) {
        const societyInfo = assignedSocieties.find(
          (s) => s.id === parseInt(societyId),
        );
        return result.visitors.map((group) => ({
          ...group,
          society_id: societyInfo?.id,
          society_name: societyInfo?.name,
          all_visitors: (group.all_visitors || []).map((visitor) => ({
            ...visitor,
            society_id: societyInfo?.id,
            society_name: societyInfo?.name,
            flat_number: visitor.flat_number || group.flat_number || null,
          })),
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching visitors for society ${societyId}:`, error);
      return [];
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

  const toggleVisitorExpand = (visitorId) => {
    setExpandedVisitors((prev) => ({
      ...prev,
      [visitorId]: !prev[visitorId],
    }));
  };

  // Filter groups based on search and filters
  const filteredGroups = visitorGroups.filter((group) => {
    const searchLower = searchTerm.toLowerCase();
    const mainVisitor = group.all_visitors?.[0] || group;

    // Check if any visitor in the group matches the search
    const groupMatchesSearch = group.all_visitors?.some((visitor) => {
      return (
        visitor.visitor_name?.toLowerCase().includes(searchLower) ||
        visitor.phone_number?.toLowerCase().includes(searchLower) ||
        visitor.flat_number?.toLowerCase().includes(searchLower) ||
        visitor.vehicle_number?.toLowerCase().includes(searchLower) ||
        visitor.purpose?.toLowerCase().includes(searchLower) ||
        group.society_name?.toLowerCase().includes(searchLower)
      );
    });

    // Society filter
    if (
      societyFilter !== "all" &&
      group.society_id !== parseInt(societyFilter)
    ) {
      return false;
    }

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

  // Handle refresh
  const handleRefresh = () => {
    if (assignedSocieties.length > 0) {
      if (societyFilter === "all") {
        fetchAllVisitors(assignedSocieties);
      } else {
        fetchSocietyVisitorsData(societyFilter).then((groups) => {
          setVisitorGroups(groups);
          const flattenedVisitors = groups.flatMap(
            (group) => group.all_visitors || [],
          );
          calculateStats(flattenedVisitors);
        });
      }
    }
  };

  // Initial load - fetch assigned societies
  useEffect(() => {
    fetchAssignedSocieties();
  }, []);

  // Apply date filter
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

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      </div>
    );
  }

  // Show no societies assigned message
  if (assignedSocieties.length === 0 && !loading) {
    return (
      <div className="p-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="text-center py-12">
            <Domain className="text-gray-400 text-6xl mb-4 mx-auto" />
            <Typography variant="h5" className="text-gray-600 mb-2">
              No Societies Assigned
            </Typography>
            <Typography variant="body2" className="text-gray-400">
              You are not assigned to any societies yet. Please contact your
              administrator.
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 font-roboto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-primary">
            PM Visitor Management
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Manage visitors for your assigned societies
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Typography variant="caption" className="text-hintText">
            {visitorGroups.length} visitor groups
          </Typography>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={2} className="mb-6">
        <Grid item xs={6} sm={3}>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="caption" className="text-gray-500">
                    Total Visitors
                  </Typography>
                  <Typography variant="h5" className="font-bold text-gray-800">
                    {stats.total}
                  </Typography>
                </div>
                <Avatar className="bg-blue-100 text-blue-600">
                  <Person />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="caption" className="text-gray-500">
                    Societies
                  </Typography>
                  <Typography variant="h5" className="font-bold text-gray-800">
                    {stats.societies}
                  </Typography>
                </div>
                <Avatar className="bg-green-100 text-green-600">
                  <Domain />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="caption" className="text-gray-500">
                    Pending
                  </Typography>
                  <Typography
                    variant="h5"
                    className="font-bold text-yellow-600"
                  >
                    {stats.pending}
                  </Typography>
                </div>
                <Avatar className="bg-yellow-100 text-yellow-600">
                  <Schedule />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="caption" className="text-gray-500">
                    Approved
                  </Typography>
                  <Typography variant="h5" className="font-bold text-green-600">
                    {stats.approved}
                  </Typography>
                </div>
                <Avatar className="bg-green-100 text-green-600">
                  <CheckCircle />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                <Schedule className="text-yellow-600" fontSize="small" />
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
                <CheckCircle className="text-green-600" fontSize="small" />
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
                <ExitToApp className="text-blue-600" fontSize="small" />
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
        </Tabs>
      </Paper>

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
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Society</InputLabel>
              <Select
                value={societyFilter}
                label="Society"
                onChange={(e) => setSocietyFilter(e.target.value)}
              >
                <MenuItem value="all">All Societies</MenuItem>
                {assignedSocieties.map((society) => (
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
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={1} className="text-right">
            <Typography variant="caption" className="text-gray-500">
              {filteredGroups.length} groups
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Visitors List with Grouping */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <CircularProgress />
          <Typography className="ml-3">Loading visitors...</Typography>
        </div>
      ) : filteredGroups.length === 0 ? (
        <Paper className="p-8 text-center">
          <Person className="text-gray-400 text-6xl mb-4 mx-auto" />
          <Typography variant="h6" className="text-gray-500 mb-2">
            {searchTerm ? "No visitor groups found" : "No visitors yet"}
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Visitors will appear here once registered"}
          </Typography>
        </Paper>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const allVisitors = group.all_visitors || [];
            const mainVisitor = allVisitors[0] || group;
            const isExpanded = expandedVisitors[group.id] || false;
            const latestVisitTime = getLatestVisitTime(allVisitors);

            return (
              <Card key={group.id} className="border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  {/* Main Group Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <Avatar className="bg-blue-100 text-blue-600">
                        {visitorTypeConfig[getVisitorType(allVisitors)]?.icon ||
                          visitorTypeConfig.Other.icon}
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <Typography variant="h6" className="font-bold">
                              {mainVisitor.visitor_name || "Unknown Visitor"}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="text-gray-500"
                            >
                              {mainVisitor.phone_number || "No phone"}
                            </Typography>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Chip
                              label={`${group.total_entries || allVisitors.length} visits`}
                              size="small"
                              className="bg-blue-100 text-blue-600"
                            />
                            <IconButton
                              size="small"
                              onClick={() => toggleVisitorExpand(group.id)}
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info Row */}
                  <Grid container spacing={2} className="mb-3">
                    <Grid item xs={12} sm={4}>
                      <div className="flex items-center space-x-2">
                        <Domain className="text-gray-400" fontSize="small" />
                        <Typography variant="body2">
                          {group.society_name || "Unknown Society"}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <div className="flex items-center space-x-2">
                        <Home className="text-gray-400" fontSize="small" />
                        <Typography variant="body2">
                          Flat: {mainVisitor.flat_number || "N/A"}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <div className="flex items-center space-x-2">
                        <AccessTime
                          className="text-gray-400"
                          fontSize="small"
                        />
                        <Typography variant="body2">
                          {formatDateTime(latestVisitTime)}
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>

                  {/* Status Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Chip
                        icon={statusConfig[mainVisitor.approved_status]?.icon}
                        label={mainVisitor.approved_status}
                        size="small"
                        style={{
                          backgroundColor:
                            statusConfig[mainVisitor.approved_status]?.bgColor,
                          color:
                            statusConfig[mainVisitor.approved_status]?.color,
                        }}
                      />
                      {mainVisitor.vehicle_number && (
                        <Chip
                          label={`Vehicle: ${mainVisitor.vehicle_number}`}
                          size="small"
                          variant="outlined"
                          icon={<DriveEta fontSize="small" />}
                        />
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(mainVisitor)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <Collapse in={isExpanded}>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Typography
                        variant="subtitle2"
                        className="font-semibold mb-3"
                      >
                        All Visits ({allVisitors.length})
                      </Typography>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Visit #</TableCell>
                              <TableCell>Visit Type</TableCell>
                              <TableCell>Flat</TableCell>
                              <TableCell>Check-in Time</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Card Scan</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allVisitors.map((visit, index) => (
                              <TableRow key={visit.id}>
                                <TableCell>#{index + 1}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      visit.visit_type === "previsitor"
                                        ? "Pre-Registered"
                                        : "Normal"
                                    }
                                    size="small"
                                    className={
                                      visit.visit_type === "previsitor"
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-gray-100 text-gray-600"
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  {visit.flat_number || "N/A"}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {formatDateTime(
                                      visit.in_time || visit.created_at,
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="text-gray-500"
                                  >
                                    {getTimeAgo(
                                      visit.in_time || visit.created_at,
                                    )}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={visit.approved_status}
                                    size="small"
                                    style={{
                                      backgroundColor:
                                        statusConfig[visit.approved_status]
                                          ?.bgColor,
                                      color:
                                        statusConfig[visit.approved_status]
                                          ?.color,
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={getCardScanStatus(
                                      visit.is_card_scan,
                                    )}
                                    size="small"
                                    className={
                                      visit.is_card_scan === "Scan"
                                        ? "bg-green-100 text-green-600"
                                        : visit.is_card_scan === "WrongScan"
                                          ? "bg-yellow-100 text-yellow-600"
                                          : "bg-gray-100 text-gray-600"
                                    }
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewDetails(visit)}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
                  <Chip
                    label={`Total Entries: ${selectedVisitor.total_entries || "1"}`}
                    size="small"
                    className="bg-white/20 text-white border-white/30 font-medium"
                  />
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="p-0 overflow-hidden">
              <div className="p-6">
                <Grid container spacing={3}>
                  {/* Left Column - Images */}
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

                  {/* Right Column - Details */}
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

                    {/* Contact + Vehicle */}
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

                    {/* Purpose */}
                    <Card className="mb-4">
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
                        <Typography variant="body1" className="text-gray-800">
                          {selectedVisitor.purpose || "No purpose specified"}
                        </Typography>
                      </CardContent>
                    </Card>

                    {/* Timing Information */}
                    <Card className="mb-4">
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
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="body2"
                              className="text-gray-500 mb-1"
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
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="body2"
                              className="text-gray-500 mb-1"
                            >
                              Visit Type
                            </Typography>
                            <Chip
                              label={
                                selectedVisitor.visit_type === "previsitor"
                                  ? "Pre-Registered"
                                  : "Normal"
                              }
                              size="small"
                              className={
                                selectedVisitor.visit_type === "previsitor"
                                  ? "bg-purple-100 text-purple-600"
                                  : "bg-gray-100 text-gray-600"
                              }
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Card Scan Status */}
                    <Card className="mb-4">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          className="font-medium mb-3 flex items-center text-gray-700"
                        >
                          <CreditCardOff
                            className="mr-2 text-primary"
                            fontSize="small"
                          />
                          Card Scan Status
                        </Typography>
                        <Chip
                          label={getCardScanStatus(
                            selectedVisitor.is_card_scan,
                          )}
                          size="medium"
                          className={
                            selectedVisitor.is_card_scan === "Scan"
                              ? "bg-green-100 text-green-600"
                              : selectedVisitor.is_card_scan === "WrongScan"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                          }
                          icon={
                            selectedVisitor.is_card_scan === "Scan" ? (
                              <CheckCircle fontSize="small" />
                            ) : selectedVisitor.is_card_scan === "WrongScan" ? (
                              <Warning fontSize="small" />
                            ) : (
                              <RadioButtonUnchecked fontSize="small" />
                            )
                          }
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </div>
            </DialogContent>

            <DialogActions className="p-4 bg-gray-50 border-t border-gray-200">
              <Button
                onClick={() => setDetailDialogOpen(false)}
                variant="outlined"
                className="border-gray-300 text-gray-700"
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
