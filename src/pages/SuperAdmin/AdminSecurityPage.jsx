import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  CircularProgress,
  TablePagination,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Badge,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Tooltip,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Security as SecurityIcon,
  Business,
  Apartment,
  Refresh,
  People,
  Add,
  CheckCircle,
  Cancel,
  Visibility,
  Phone,
  Email,
  CalendarToday,
  Home,
  AssignmentInd,
  LocationCity,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

export default function AdminSecurity() {
  // State declarations
  const [societies, setSocieties] = useState([]);
  const [securityGuards, setSecurityGuards] = useState([]);
  const [filteredGuards, setFilteredGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSociety, setSelectedSociety] = useState("all");
  const [showSocietyDetails, setShowSocietyDetails] = useState(false);
  const [selectedSocietyDetails, setSelectedSocietyDetails] = useState(null);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [guardDetailsOpen, setGuardDetailsOpen] = useState(false);

  // Theme colors
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

  // Fetch societies
  const fetchSocieties = async () => {
    setLoadingSocieties(true);
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("id, name, city, state, is_active, address, pincode")
        .eq("is_delete", false)
        .order("name");

      if (error) throw error;
      setSocieties(data || []);
    } catch (error) {
      console.error("Error fetching societies:", error);
      toast.error("Failed to fetch societies");
    } finally {
      setLoadingSocieties(false);
    }
  };

  // Fetch all security guards
  const fetchAllSecurityGuards = async () => {
    setLoading(true);
    try {
      // First, fetch all security guards
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(
          `
          id, 
          registed_user_id, 
          name, 
          email, 
          number, 
          role_type, 
          building_id, 
          society_id,
          is_active, 
          created_at,
          profile_url,
          updated_at,
          whatsapp_number,
          move_in_date,
          move_out_date
        `
        )
        .eq("role_type", "Security")
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      if (!usersData || usersData.length === 0) {
        setSecurityGuards([]);
        setFilteredGuards([]);
        setLoading(false);
        return;
      }

      // Get unique society IDs from users
      const societyIds = [
        ...new Set(
          usersData
            .filter((user) => user.society_id)
            .map((user) => user.society_id)
        ),
      ];

      // Get unique building IDs from users
      const buildingIds = [
        ...new Set(
          usersData
            .filter((user) => user.building_id)
            .map((user) => user.building_id)
        ),
      ];

      // Fetch societies data
      let societiesData = [];
      if (societyIds.length > 0) {
        const { data: societiesResult, error: societiesError } = await supabase
          .from("societies")
          .select("id, name, city, state, address")
          .in("id", societyIds)
          .eq("is_delete", false);

        if (societiesError) throw societiesError;
        societiesData = societiesResult || [];
      }

      // Fetch buildings data
      let buildingsData = [];
      if (buildingIds.length > 0) {
        const { data: buildingsResult, error: buildingsError } = await supabase
          .from("buildings")
          .select("id, name, building_type")
          .in("id", buildingIds)
          .eq("is_delete", false);

        if (buildingsError) throw buildingsError;
        buildingsData = buildingsResult || [];
      }

      // Combine all data
      const guardsWithDetails = usersData.map((guard) => {
        const society = societiesData.find((s) => s.id === guard.society_id);
        const building = buildingsData.find((b) => b.id === guard.building_id);

        return {
          ...guard,
          society_name: society?.name || "Not Assigned",
          society_city: society?.city || "N/A",
          society_state: society?.state || "N/A",
          society_address: society?.address || "N/A",
          building_name: building?.name || "Not Assigned",
          building_type: building?.building_type || "N/A",
          society: society || null,
          building: building || null,
          short_id:
            guard.registed_user_id?.substring(0, 8).toUpperCase() || "N/A",
          formatted_date: guard.created_at
            ? new Date(guard.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A",
        };
      });

      setSecurityGuards(guardsWithDetails);
      applyFilters(guardsWithDetails, searchTerm, activeStatusFilter);
    } catch (error) {
      console.error("Error fetching all security guards:", error);
      toast.error("Failed to fetch security guards");
    } finally {
      setLoading(false);
    }
  };

  // Fetch security guards by society
  const fetchSecurityGuardsBySociety = async (societyId) => {
    setLoading(true);
    try {
      // Fetch users for specific society
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(
          `
          id, 
          registed_user_id, 
          name, 
          email, 
          number, 
          role_type, 
          building_id, 
          society_id,
          is_active, 
          created_at,
          profile_url,
          updated_at,
          whatsapp_number,
          move_in_date,
          move_out_date
        `
        )
        .eq("role_type", "Security")
        .eq("society_id", societyId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      if (!usersData || usersData.length === 0) {
        setSecurityGuards([]);
        setFilteredGuards([]);
        setLoading(false);
        return;
      }

      // Get society details
      const { data: societyData, error: societyError } = await supabase
        .from("societies")
        .select("id, name, city, state, address")
        .eq("id", societyId)
        .single();

      if (societyError && societyError.code !== "PGRST116") {
        throw societyError;
      }

      // Get unique building IDs
      const buildingIds = [
        ...new Set(
          usersData
            .filter((user) => user.building_id)
            .map((user) => user.building_id)
        ),
      ];

      // Fetch buildings data
      let buildingsData = [];
      if (buildingIds.length > 0) {
        const { data: buildingsResult, error: buildingsError } = await supabase
          .from("buildings")
          .select("id, name, building_type")
          .in("id", buildingIds)
          .eq("is_delete", false);

        if (buildingsError) throw buildingsError;
        buildingsData = buildingsResult || [];
      }

      // Combine all data
      const guardsWithDetails = usersData.map((guard) => {
        const building = buildingsData.find((b) => b.id === guard.building_id);

        return {
          ...guard,
          society_name: societyData?.name || "Not Assigned",
          society_city: societyData?.city || "N/A",
          society_state: societyData?.state || "N/A",
          society_address: societyData?.address || "N/A",
          building_name: building?.name || "Not Assigned",
          building_type: building?.building_type || "N/A",
          society: societyData || null,
          building: building || null,
          short_id:
            guard.registed_user_id?.substring(0, 8).toUpperCase() || "N/A",
          formatted_date: guard.created_at
            ? new Date(guard.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "N/A",
        };
      });

      setSecurityGuards(guardsWithDetails);
      applyFilters(guardsWithDetails, searchTerm, activeStatusFilter);
    } catch (error) {
      console.error("Error fetching security guards by society:", error);
      toast.error("Failed to fetch security guards");
    } finally {
      setLoading(false);
    }
  };

  // Memoized calculations
  const getSocietySecurityCount = useCallback(
    (societyId) => {
      return securityGuards.filter((guard) => guard.society_id === societyId)
        .length;
    },
    [securityGuards]
  );

  const getActiveSecurityCount = useCallback(
    (societyId) => {
      return securityGuards.filter(
        (guard) => guard.society_id === societyId && guard.is_active
      ).length;
    },
    [securityGuards]
  );

  const getInactiveSecurityCount = useCallback(
    (societyId) => {
      return securityGuards.filter(
        (guard) => guard.society_id === societyId && !guard.is_active
      ).length;
    },
    [securityGuards]
  );

  const getTotalSecurityCount = useCallback(() => {
    return securityGuards.length;
  }, [securityGuards]);

  const getTotalActiveSecurityCount = useCallback(() => {
    return securityGuards.filter((guard) => guard.is_active).length;
  }, [securityGuards]);

  const getTotalInactiveSecurityCount = useCallback(() => {
    return securityGuards.filter((guard) => !guard.is_active).length;
  }, [securityGuards]);

  // Apply filters function
  const applyFilters = (guards, search, statusFilter) => {
    let filtered = guards;

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(
        (guard) =>
          guard.name?.toLowerCase().includes(search.toLowerCase()) ||
          guard.email?.toLowerCase().includes(search.toLowerCase()) ||
          guard.number?.includes(search) ||
          guard.society_name?.toLowerCase().includes(search.toLowerCase()) ||
          guard.building_name?.toLowerCase().includes(search.toLowerCase()) ||
          guard.registed_user_id
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          guard.short_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((guard) =>
        statusFilter === "active" ? guard.is_active : !guard.is_active
      );
    }

    setFilteredGuards(filtered);
    setPage(0);
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(securityGuards, value, activeStatusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setActiveStatusFilter(value);
    applyFilters(securityGuards, searchTerm, value);
  };

  // Handle delete
  // const handleDelete = async (userId) => {
  //   if (!window.confirm("Are you sure you want to delete this security guard?"))
  //     return;

  //   try {
  //     const { error } = await supabase
  //       .from("users")
  //       .update({
  //         is_delete: true,
  //         updated_at: new Date().toISOString(),
  //       })
  //       .eq("id", userId);

  //     if (error) throw error;

  //     toast.success("Security guard removed!");

  //     // Remove from local state
  //     const updatedGuards = securityGuards.filter(
  //       (guard) => guard.id !== userId
  //     );
  //     setSecurityGuards(updatedGuards);
  //     applyFilters(updatedGuards, searchTerm, activeStatusFilter);
  //   } catch (error) {
  //     console.error("Error deleting security guard:", error);
  //     toast.error("Failed to delete security guard");
  //   }
  // };

  // Handle view guard details
  const handleViewGuardDetails = (guard) => {
    setSelectedGuard(guard);
    setGuardDetailsOpen(true);
  };

  // Handle view society details
  const handleViewSocietyDetails = (societyId) => {
    const society = societies.find((s) => s.id === societyId);
    if (society) {
      setSelectedSocietyDetails(society);
      setShowSocietyDetails(true);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchSocieties();
    if (selectedSociety === "all") {
      fetchAllSecurityGuards();
    } else {
      fetchSecurityGuardsBySociety(selectedSociety);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSocieties();
    fetchAllSecurityGuards();
  }, []);

  // Handle society change
  useEffect(() => {
    if (selectedSociety === "all") {
      fetchAllSecurityGuards();
    } else if (selectedSociety) {
      fetchSecurityGuardsBySociety(selectedSociety);
    }
  }, [selectedSociety]);

  // Paginated guards
  const paginatedGuards = useMemo(() => {
    return filteredGuards.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredGuards, page, rowsPerPage]);

  // Render society wise view
  const renderSocietyWiseView = () => {
    if (loadingSocieties) {
      return (
        <Box className="flex justify-center items-center py-20">
          <CircularProgress style={{ color: theme.primary }} />
          <Typography className="ml-4" style={{ color: theme.textSecondary }}>
            Loading societies...
          </Typography>
        </Box>
      );
    }

    if (societies.length === 0) {
      return (
        <Alert severity="info" className="mt-6">
          <Typography variant="h6" className="mb-2">
            No Societies Found
          </Typography>
          <Typography>
            There are no societies registered in the system yet.
          </Typography>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <Typography variant="h6" style={{ color: theme.textPrimary }}>
          Security Overview by Society
          <span
            className="ml-2 text-sm font-normal"
            style={{ color: theme.textSecondary }}
          >
            ({societies.length} societies)
          </span>
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {societies.map((society) => {
            const totalGuards = getSocietySecurityCount(society.id);
            const activeGuards = getActiveSecurityCount(society.id);
            const inactiveGuards = getInactiveSecurityCount(society.id);

            return (
              <motion.div
                key={society.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="rounded-xl border shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.cardBg,
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="bg-gradient-to-br from-red-50 to-red-100"
                          style={{ color: theme.primary }}
                        >
                          <Business />
                        </Avatar>
                        <div>
                          <Typography
                            className="font-bold text-lg truncate max-w-[200px]"
                            style={{ color: theme.textPrimary }}
                            title={society.name}
                          >
                            {society.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ color: theme.textSecondary }}
                          >
                            {society.city}, {society.state}
                          </Typography>
                        </div>
                      </div>
                      <Chip
                        label={society.is_active ? "Active" : "Inactive"}
                        size="small"
                        className="shadow-sm"
                        style={{
                          backgroundColor: society.is_active
                            ? `${theme.success}15`
                            : `${theme.reject}15`,
                          color: society.is_active
                            ? theme.success
                            : theme.reject,
                          fontWeight: 500,
                          border: `1px solid ${
                            society.is_active ? theme.success : theme.reject
                          }40`,
                        }}
                      />
                    </div>

                    {/* Security Stats */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <People
                            style={{ color: theme.primary, fontSize: 18 }}
                          />
                          <Typography
                            variant="body2"
                            style={{
                              color: theme.textPrimary,
                              fontWeight: 500,
                            }}
                          >
                            Total Guards
                          </Typography>
                        </div>
                        <Badge
                          badgeContent={totalGuards}
                          style={{
                            backgroundColor: theme.primary,
                            color: theme.white,
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle
                              fontSize="small"
                              style={{ color: theme.success }}
                            />
                            <Typography
                              variant="body2"
                              style={{ color: theme.success, fontWeight: 600 }}
                            >
                              Active
                            </Typography>
                          </div>
                          <Typography
                            variant="h6"
                            style={{ color: theme.success, fontWeight: 700 }}
                          >
                            {activeGuards}
                          </Typography>
                        </div>

                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Cancel
                              fontSize="small"
                              style={{ color: theme.reject }}
                            />
                            <Typography
                              variant="body2"
                              style={{ color: theme.reject, fontWeight: 600 }}
                            >
                              Inactive
                            </Typography>
                          </div>
                          <Typography
                            variant="h6"
                            style={{ color: theme.reject, fontWeight: 700 }}
                          >
                            {inactiveGuards}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSocietyDetails(society.id);
                        }}
                        style={{
                          borderColor: theme.primary,
                          color: theme.primary,
                          textTransform: "none",
                          fontWeight: 500,
                          borderRadius: "8px",
                        }}
                        startIcon={<Visibility />}
                      >
                        Details
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSociety(society.id);
                          setViewMode("all");
                        }}
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}, #8B1A1A)`,
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(111, 11, 20, 0.2)",
                        }}
                        startIcon={<People />}
                      >
                        View Guards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render all security view (table view)
  const renderAllSecurityView = () => {
    return (
      <>
        {/* Filters and Search */}
        <Card className="rounded-xl border shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <Typography
                    variant="h6"
                    className="font-semibold"
                    style={{ color: theme.textPrimary }}
                  >
                    {selectedSociety === "all"
                      ? "All Security Guards"
                      : "Society Security Guards"}
                    <span
                      className="ml-2 text-sm font-normal"
                      style={{ color: theme.textSecondary }}
                    >
                      ({filteredGuards.length} guards found)
                    </span>
                  </Typography>
                  {selectedSociety !== "all" &&
                    societies.find((s) => s.id === selectedSociety) && (
                      <Typography
                        variant="body2"
                        style={{ color: theme.primary, fontWeight: 500 }}
                      >
                        Society:{" "}
                        {societies.find((s) => s.id === selectedSociety)?.name}
                      </Typography>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <FormControl size="small" className="w-48">
                    <InputLabel style={{ color: theme.textSecondary }}>
                      Filter by Society
                    </InputLabel>
                    <Select
                      value={selectedSociety}
                      onChange={(e) => setSelectedSociety(e.target.value)}
                      label="Filter by Society"
                      style={{ color: theme.textPrimary }}
                    >
                      <MenuItem value="all">
                        <em>All Societies</em>
                      </MenuItem>
                      {societies.map((society) => (
                        <MenuItem key={society.id} value={society.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate max-w-[150px]">
                              {society.name}
                            </span>
                            <Chip
                              label={getSocietySecurityCount(society.id)}
                              size="small"
                              className="ml-2"
                              style={{
                                backgroundColor: theme.lightBackground,
                                color: theme.primary,
                              }}
                            />
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" className="w-40">
                    <InputLabel style={{ color: theme.textSecondary }}>
                      Status
                    </InputLabel>
                    <Select
                      value={activeStatusFilter}
                      onChange={handleStatusFilterChange}
                      label="Status"
                      style={{ color: theme.textPrimary }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            fontSize="small"
                            style={{ color: theme.success }}
                          />
                          <span>Active Only</span>
                        </div>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <div className="flex items-center gap-2">
                          <Cancel
                            fontSize="small"
                            style={{ color: theme.reject }}
                          />
                          <span>Inactive Only</span>
                        </div>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TextField
                  placeholder="Search guards by name, ID, email, phone..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full md:w-64"
                  InputProps={{
                    startAdornment: (
                      <Search
                        style={{ color: theme.hintText }}
                        className="mr-2"
                      />
                    ),
                    style: {
                      color: theme.textPrimary,
                      borderRadius: "8px",
                    },
                  }}
                />
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={refreshData}
                    style={{
                      color: theme.primary,
                      backgroundColor: theme.lightBackground,
                    }}
                    className="hover:shadow-md"
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Guards Table */}
        <Card className="rounded-xl border shadow-sm overflow-hidden">
          {loading ? (
            <Box className="flex flex-col justify-center items-center p-12">
              <CircularProgress style={{ color: theme.primary }} size={50} />
              <Typography
                className="mt-4"
                style={{ color: theme.textSecondary }}
              >
                Loading security guards...
              </Typography>
            </Box>
          ) : filteredGuards.length === 0 ? (
            <Alert
              severity={
                searchTerm ||
                selectedSociety !== "all" ||
                activeStatusFilter !== "all"
                  ? "info"
                  : "warning"
              }
              sx={{ m: 3 }}
            >
              {searchTerm
                ? "No security guards found matching your search."
                : selectedSociety !== "all"
                ? "No security guards assigned to this society."
                : activeStatusFilter !== "all"
                ? `No ${activeStatusFilter} security guards found.`
                : "No security guards found in the system."}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead
                    style={{
                      backgroundColor: theme.lightBackground,
                      borderBottom: `2px solid ${theme.border}`,
                    }}
                  >
                    <TableRow>
                      <TableCell
                        style={{
                          fontWeight: 700,
                          color: theme.textPrimary,
                          fontSize: "0.95rem",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <SecurityIcon fontSize="small" />
                          Security Guard
                        </div>
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: 700,
                          color: theme.textPrimary,
                          fontSize: "0.95rem",
                        }}
                      >
                        Contact Info
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: 700,
                          color: theme.textPrimary,
                          fontSize: "0.95rem",
                        }}
                      >
                        Society & Building
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: 700,
                          color: theme.textPrimary,
                          fontSize: "0.95rem",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: 700,
                          color: theme.textPrimary,
                          fontSize: "0.95rem",
                          textAlign: "center",
                        }}
                      >
                        View
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedGuards.map((guard) => (
                      <TableRow
                        key={guard.id}
                        hover
                        style={{
                          transition: "background-color 0.2s",
                          borderBottom: `1px solid ${theme.border}`,
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {guard.profile_url ? (
                              <Avatar
                                src={guard.profile_url}
                                sx={{
                                  width: 45,
                                  height: 45,
                                  border: `2px solid ${theme.lightBackground}`,
                                }}
                              />
                            ) : (
                              <Avatar
                                className="bg-gradient-to-br from-red-50 to-red-100"
                                style={{
                                  color: theme.primary,
                                  border: `2px solid ${theme.lightBackground}`,
                                }}
                              >
                                <SecurityIcon fontSize="small" />
                              </Avatar>
                            )}
                            <div>
                              <Typography
                                className="font-semibold hover:text-red-700 cursor-pointer"
                                style={{ color: theme.textPrimary }}
                                onClick={() => handleViewGuardDetails(guard)}
                              >
                                {guard.name || "Unnamed Guard"}
                              </Typography>
                              <div className="flex items-center gap-2 mt-1">
                                <AssignmentInd
                                  fontSize="small"
                                  style={{
                                    color: theme.hintText,
                                    fontSize: 14,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  style={{ color: theme.textSecondary }}
                                >
                                  ID: {guard.short_id}
                                </Typography>
                              </div>
                              <Typography
                                variant="caption"
                                style={{ color: theme.hintText }}
                                className="flex items-center gap-1"
                              >
                                <CalendarToday fontSize="inherit" />
                                Joined: {guard.formatted_date}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {guard.email && (
                              <div className="flex items-center gap-2">
                                <Email
                                  fontSize="small"
                                  style={{ color: theme.hintText }}
                                />
                                <Typography
                                  className="font-medium truncate max-w-[180px]"
                                  style={{ color: theme.textPrimary }}
                                  title={guard.email}
                                >
                                  {guard.email}
                                </Typography>
                              </div>
                            )}
                            {guard.number && (
                              <div className="flex items-center gap-2">
                                <Phone
                                  fontSize="small"
                                  style={{ color: theme.hintText }}
                                />
                                <Typography
                                  variant="body2"
                                  style={{ color: theme.textSecondary }}
                                >
                                  {guard.number}
                                </Typography>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Business
                                style={{ color: theme.primary }}
                                fontSize="small"
                              />
                              <div>
                                <Typography
                                  className="font-medium"
                                  style={{ color: theme.textPrimary }}
                                >
                                  {guard.society_name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: theme.textSecondary }}
                                >
                                  {guard.society_city}
                                  {guard.society_state
                                    ? `, ${guard.society_state}`
                                    : ""}
                                </Typography>
                              </div>
                            </div>
                            {guard.building_name !== "Not Assigned" && (
                              <Chip
                                icon={<Apartment />}
                                label={guard.building_name}
                                size="small"
                                className="bg-red-50 hover:bg-red-100"
                                style={{
                                  color: theme.primary,
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Tooltip
                              title={
                                guard.is_active ? "Deactivate" : "Activate"
                              }
                            ></Tooltip>
                            <Chip
                              label={guard.is_active ? "Active" : "Inactive"}
                              size="small"
                              className="shadow-sm"
                              style={{
                                backgroundColor: guard.is_active
                                  ? `${theme.success}15`
                                  : `${theme.reject}15`,
                                color: guard.is_active
                                  ? theme.success
                                  : theme.reject,
                                fontWeight: 600,
                                border: `1px solid ${
                                  guard.is_active ? theme.success : theme.reject
                                }40`,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex items-center justify-center gap-2">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewGuardDetails(guard)}
                                className="hover:bg-red-50"
                                style={{ color: theme.primary }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(guard.id)}
                                className="hover:bg-red-50"
                                style={{ color: theme.reject }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{
                  p: 2,
                  borderTop: `1px solid ${theme.border}`,
                  backgroundColor: theme.lightBackground,
                }}
              >
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredGuards.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </Box>
            </>
          )}
        </Card>
      </>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Typography
                variant="h4"
                className="font-bold mb-2 bg-gradient-to-r from-red-900 to-red-700 bg-clip-text text-transparent"
              >
                Security Management Dashboard
              </Typography>
              <Typography
                className="text-lg"
                style={{ color: theme.textSecondary }}
              >
                {viewMode === "all"
                  ? selectedSociety === "all"
                    ? "Manage all security guards across societies"
                    : `Managing security guards for "${
                        societies.find((s) => s.id === selectedSociety)?.name ||
                        "selected society"
                      }"`
                  : "View society-wise security overview"}
              </Typography>
            </div>

            {/* View Mode Toggle */}
            <Box
              className="bg-white rounded-xl border shadow-sm"
              style={{ borderColor: theme.border }}
            >
              <Tabs
                value={viewMode}
                onChange={(e, newValue) => {
                  setViewMode(newValue);
                  if (newValue === "society") {
                    setSelectedSociety("all");
                  }
                }}
                textColor="inherit"
                style={{ color: theme.textPrimary }}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: theme.primary,
                    height: 3,
                    borderRadius: "3px",
                  },
                }}
              >
                <Tab
                  label={
                    <div className="flex items-center gap-2">
                      <SecurityIcon fontSize="small" />
                      <span>Security Guards</span>
                    </div>
                  }
                  value="all"
                  style={{
                    color:
                      viewMode === "all" ? theme.primary : theme.textSecondary,
                    fontWeight: viewMode === "all" ? 700 : 500,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    minHeight: "48px",
                  }}
                />
                <Tab
                  label={
                    <div className="flex items-center gap-2">
                      <Business fontSize="small" />
                      <span>Society Wise</span>
                    </div>
                  }
                  value="society"
                  style={{
                    color:
                      viewMode === "society"
                        ? theme.primary
                        : theme.textSecondary,
                    fontWeight: viewMode === "society" ? 700 : 500,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    minHeight: "48px",
                  }}
                />
              </Tabs>
            </Box>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div whileHover={{ scale: 1.03 }}>
              <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Total Security Guards
                      </Typography>
                      <Typography
                        variant="h4"
                        className="font-bold mt-1"
                        style={{ color: theme.textPrimary }}
                      >
                        {getTotalSecurityCount()}
                      </Typography>
                    </div>
                    <Avatar
                      className="bg-gradient-to-br from-red-50 to-red-100"
                      style={{ color: theme.primary }}
                    >
                      <People />
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Active Guards
                      </Typography>
                      <Typography
                        variant="h4"
                        className="font-bold mt-1"
                        style={{ color: theme.success }}
                      >
                        {getTotalActiveSecurityCount()}
                      </Typography>
                    </div>
                    <Avatar
                      className="bg-gradient-to-br from-green-50 to-green-100"
                      style={{ color: theme.success }}
                    >
                      <CheckCircle />
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Inactive Guards
                      </Typography>
                      <Typography
                        variant="h4"
                        className="font-bold mt-1"
                        style={{ color: theme.reject }}
                      >
                        {getTotalInactiveSecurityCount()}
                      </Typography>
                    </div>
                    <Avatar
                      className="bg-gradient-to-br from-gray-50 to-gray-100"
                      style={{ color: theme.reject }}
                    >
                      <Cancel />
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Card className="rounded-xl border shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Total Societies
                      </Typography>
                      <Typography
                        variant="h4"
                        className="font-bold mt-1"
                        style={{ color: theme.textPrimary }}
                      >
                        {societies.length}
                      </Typography>
                    </div>
                    <Avatar
                      className="bg-gradient-to-br from-blue-50 to-blue-100"
                      style={{ color: theme.primary }}
                    >
                      <Business />
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "all" ? renderAllSecurityView() : renderSocietyWiseView()}

        {/* Back Button for Society View */}
        {viewMode === "society" && selectedSociety !== "all" && (
          <Box className="mt-8 flex justify-center">
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedSociety("all");
                setViewMode("society");
              }}
              startIcon={<Business />}
              style={{
                borderColor: theme.primary,
                color: theme.primary,
                borderRadius: "8px",
                padding: "8px 24px",
                fontWeight: 600,
              }}
            >
              Back to All Societies
            </Button>
          </Box>
        )}
      </motion.div>

      {/* Security Guard Details Dialog */}
      <Dialog
        open={guardDetailsOpen}
        onClose={() => setGuardDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedGuard && (
          <>
            <DialogTitle
              className="border-b"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedGuard.profile_url ? (
                    <Avatar
                      src={selectedGuard.profile_url}
                      sx={{ width: 60, height: 60 }}
                    />
                  ) : (
                    <Avatar
                      className="bg-gradient-to-br from-red-50 to-red-100"
                      sx={{ width: 60, height: 60 }}
                    >
                      <SecurityIcon />
                    </Avatar>
                  )}
                  <div>
                    <Typography
                      variant="h5"
                      style={{ color: theme.textPrimary, fontWeight: 700 }}
                    >
                      {selectedGuard.name || "Unnamed Guard"}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Security ID: {selectedGuard.short_id}
                    </Typography>
                  </div>
                </div>
                <Chip
                  label={selectedGuard.is_active ? "Active" : "Inactive"}
                  style={{
                    backgroundColor: selectedGuard.is_active
                      ? `${theme.success}15`
                      : `${theme.reject}15`,
                    color: selectedGuard.is_active
                      ? theme.success
                      : theme.reject,
                    fontWeight: 600,
                    border: `1px solid ${
                      selectedGuard.is_active ? theme.success : theme.reject
                    }40`,
                  }}
                />
              </div>
            </DialogTitle>
            <DialogContent className="pt-6">
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: theme.primary,
                      fontWeight: 600,
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    <AssignmentInd />
                    Personal Information
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Email Address
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ color: theme.textPrimary, fontWeight: 500 }}
                      >
                        {selectedGuard.email || "Not provided"}
                      </Typography>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Phone Number
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ color: theme.textPrimary, fontWeight: 500 }}
                      >
                        {selectedGuard.number || "Not provided"}
                      </Typography>
                    </div>
                    {selectedGuard.whatsapp_number && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Typography
                          variant="body2"
                          style={{ color: theme.textSecondary }}
                        >
                          WhatsApp Number
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{ color: theme.textPrimary, fontWeight: 500 }}
                        >
                          {selectedGuard.whatsapp_number}
                        </Typography>
                      </div>
                    )}
                  </div>
                </Grid>

                {/* Assignment Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: theme.primary,
                      fontWeight: 600,
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "10px",
                      gap: "8px",
                    }}
                  >
                    <Home />
                    Assignment Information
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Business style={{ color: theme.primary }} />
                        <Typography
                          variant="body2"
                          style={{ color: theme.primary, fontWeight: 600 }}
                        >
                          Society
                        </Typography>
                      </div>
                      <Typography
                        variant="h6"
                        style={{ color: theme.textPrimary, fontWeight: 700 }}
                      >
                        {selectedGuard.society_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        {selectedGuard.society_city}
                        {selectedGuard.society_state
                          ? `, ${selectedGuard.society_state}`
                          : ""}
                      </Typography>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Apartment style={{ color: theme.primary }} />
                        <Typography
                          variant="body2"
                          style={{ color: theme.primary, fontWeight: 600 }}
                        >
                          Building
                        </Typography>
                      </div>
                      <Typography
                        variant="h6"
                        style={{ color: theme.textPrimary, fontWeight: 700 }}
                      >
                        {selectedGuard.building_name}
                      </Typography>
                      {selectedGuard.building_type &&
                        selectedGuard.building_type !== "N/A" && (
                          <Typography
                            variant="body2"
                            style={{ color: theme.textSecondary }}
                          >
                            Type: {selectedGuard.building_type}
                          </Typography>
                        )}
                    </div>
                  </div>
                </Grid>

                {/* Dates Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: theme.primary,
                      fontWeight: 600,
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CalendarToday />
                    Dates
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Joined Date
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ color: theme.textPrimary, fontWeight: 500 }}
                      >
                        {selectedGuard.formatted_date}
                      </Typography>
                    </div>
                    {selectedGuard.move_in_date && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Typography
                          variant="body2"
                          style={{ color: theme.textSecondary }}
                        >
                          Move In Date
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{ color: theme.textPrimary, fontWeight: 500 }}
                        >
                          {new Date(
                            selectedGuard.move_in_date
                          ).toLocaleDateString("en-IN")}
                        </Typography>
                      </div>
                    )}
                    {selectedGuard.move_out_date && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Typography
                          variant="body2"
                          style={{ color: theme.textSecondary }}
                        >
                          Move Out Date
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{ color: theme.textPrimary, fontWeight: 500 }}
                        >
                          {new Date(
                            selectedGuard.move_out_date
                          ).toLocaleDateString("en-IN")}
                        </Typography>
                      </div>
                    )}
                  </div>
                </Grid>

                {/* Status Information */}
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: theme.primary,
                      fontWeight: 600,
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle />
                    Status Information
                  </Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Current Status
                      </Typography>
                      <div className="flex items-center gap-2 mt-2">
                        <Typography
                          variant="body1"
                          style={{
                            color: selectedGuard.is_active
                              ? theme.success
                              : theme.reject,
                            fontWeight: 600,
                          }}
                        >
                          {selectedGuard.is_active ? "Active" : "Inactive"}
                        </Typography>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Last Updated
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{ color: theme.textPrimary, fontWeight: 500 }}
                      >
                        {selectedGuard.updated_at
                          ? new Date(selectedGuard.updated_at).toLocaleString(
                              "en-IN"
                            )
                          : "Not available"}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              className="border-t p-4"
              style={{ borderColor: theme.border }}
            >
              <Button
                onClick={() => setGuardDetailsOpen(false)}
                style={{ color: theme.textSecondary }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Society Details Dialog */}
      <Dialog
        open={showSocietyDetails}
        onClose={() => setShowSocietyDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSocietyDetails && (
          <>
            <DialogTitle
              className="border-b"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  className="bg-gradient-to-br from-red-50 to-red-100"
                  style={{ color: theme.primary }}
                >
                  <Business />
                </Avatar>
                <div>
                  <Typography
                    variant="h5"
                    style={{ color: theme.textPrimary, fontWeight: 700 }}
                  >
                    {selectedSocietyDetails.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={{ color: theme.textSecondary }}
                  >
                    Society Details
                  </Typography>
                </div>
              </div>
            </DialogTitle>
            <DialogContent className="pt-6">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Typography
                      variant="subtitle2"
                      style={{
                        color: theme.textSecondary,
                        marginBottom: "8px",
                      }}
                    >
                      <LocationCity
                        style={{ fontSize: 16, marginRight: "8px" }}
                      />
                      Location
                    </Typography>
                    <Typography
                      style={{ color: theme.textPrimary, fontWeight: 500 }}
                    >
                      {selectedSocietyDetails.city},{" "}
                      {selectedSocietyDetails.state}
                    </Typography>
                    {selectedSocietyDetails.address && (
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary, marginTop: "4px" }}
                      >
                        {selectedSocietyDetails.address}
                      </Typography>
                    )}
                    {selectedSocietyDetails.pincode && (
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Pincode: {selectedSocietyDetails.pincode}
                      </Typography>
                    )}
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    style={{
                      color: theme.primary,
                      fontWeight: 600,
                      marginBottom: "16px",
                    }}
                  >
                    Security Statistics
                  </Typography>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <Typography
                        variant="h4"
                        style={{ color: theme.primary, fontWeight: 700 }}
                      >
                        {getSocietySecurityCount(selectedSocietyDetails.id)}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Total Guards
                      </Typography>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Typography
                        variant="h4"
                        style={{ color: theme.success, fontWeight: 700 }}
                      >
                        {getActiveSecurityCount(selectedSocietyDetails.id)}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Active Guards
                      </Typography>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <Typography
                        variant="h4"
                        style={{ color: theme.reject, fontWeight: 700 }}
                      >
                        {getInactiveSecurityCount(selectedSocietyDetails.id)}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary }}
                      >
                        Inactive Guards
                      </Typography>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Chip
                        label={
                          selectedSocietyDetails.is_active
                            ? "Active"
                            : "Inactive"
                        }
                        style={{
                          backgroundColor: selectedSocietyDetails.is_active
                            ? `${theme.success}15`
                            : `${theme.reject}15`,
                          color: selectedSocietyDetails.is_active
                            ? theme.success
                            : theme.reject,
                          fontWeight: 600,
                          fontSize: "1rem",
                          padding: "8px 16px",
                        }}
                      />
                      <Typography
                        variant="body2"
                        style={{ color: theme.textSecondary, marginTop: "8px" }}
                      >
                        Society Status
                      </Typography>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              className="border-t p-4"
              style={{ borderColor: theme.border }}
            >
              <Button
                onClick={() => setShowSocietyDetails(false)}
                style={{ color: theme.textSecondary }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedSociety(selectedSocietyDetails.id);
                  setViewMode("all");
                  setShowSocietyDetails(false);
                }}
                style={{
                  backgroundColor: theme.primary,
                  color: theme.white,
                }}
              >
                View Security Guards
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
