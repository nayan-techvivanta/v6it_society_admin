import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  Select,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Business as BuildingIcon,
  Apartment as ApartmentIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { supabase } from "../../api/supabaseClient";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
  border: "1px solid rgba(111, 11, 20, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
  },
}));

const StatsCard = styled(Card)(({ theme, color = "#6F0B14" }) => ({
  borderRadius: "12px",
  background: "#ffffff",
  border: `1px solid ${color}20`,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: color,
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: "0.75rem",
  ...(status === "Occupied" && {
    backgroundColor: "#E6F4E6",
    color: "#008000",
    border: "1px solid #C8E6C9",
  }),
  ...(status === "Vacant" && {
    backgroundColor: "#FFF3E0",
    color: "#EF6C00",
    border: "1px solid #FFE0B2",
  }),
  ...(status === "Blocked" && {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    border: "1px solid #FFCDD2",
  }),
}));

const RoleChip = styled(Chip)(({ role }) => ({
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  fontSize: "0.75rem",
  ...(role === "Tanent-M" && {
    backgroundColor: "rgba(111, 11, 20, 0.1)",
    color: "#6F0B14",
    border: "1px solid rgba(111, 11, 20, 0.2)",
  }),
  ...(role === "Tanent-O" && {
    backgroundColor: "rgba(0, 128, 0, 0.1)",
    color: "#008000",
    border: "1px solid rgba(0, 128, 0, 0.2)",
  }),
}));

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function PMUsers() {
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pmId, setPmId] = useState(null);

  // Data states
  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalSocieties: 0,
    totalBuildings: 0,
    totalFlats: 0,
    totalMembers: 0,
    tenantM: 0,
    tenantO: 0,
  });

  // Filters and UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [societyFilter, setSocietyFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Dialog states
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  // Fetch PM data and all related information
  useEffect(() => {
    const fetchPMData = async () => {
      const profileId = localStorage.getItem("profileId");
      if (!profileId) {
        setError("Please login to access user data.");
        setLoading(false);
        return;
      }
      setPmId(profileId);
      await fetchAllData(profileId);
    };
    fetchPMData();
  }, []);

  // Main data fetching function - UPDATED to match your schema
  const fetchAllData = async (pmId) => {
    setLoading(true);
    try {
      // Step 1: Get societies assigned to PM
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", pmId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setError("No societies are assigned to you yet.");
        setLoading(false);
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      // Step 2: Get societies details
      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name, address, city")
        .in("id", societyIds);

      if (societiesError) throw societiesError;
      setSocieties(societiesData || []);

      // Step 3: Get buildings of those societies
      const { data: buildingsData, error: buildingError } = await supabase
        .from("buildings")
        .select("*")
        .eq("is_delete", false)
        .in("society_id", societyIds);

      if (buildingError) throw buildingError;

      const buildingsWithSociety = buildingsData.map((building) => ({
        ...building,
        society_name:
          societiesData.find((s) => s.id === building.society_id)?.name ||
          "Unknown Society",
      }));

      setBuildings(buildingsWithSociety || []);

      const buildingIds = buildingsData.map((b) => b.id);

      if (buildingIds.length === 0) {
        setFlats([]);
        setMembers([]);
        setFilteredMembers([]);
        updateStats([], societiesData, buildingsData, []);
        setLoading(false);
        return;
      }

      // Step 4: Get flats of those buildings
      const { data: flatsData, error: flatsError } = await supabase
        .from("flats")
        .select("*")
        .eq("is_delete", false)
        .in("building_id", buildingIds)
        .order("building_id, flat_number");

      if (flatsError) throw flatsError;

      const flatsWithDetails = flatsData.map((flat) => {
        const building = buildingsData.find((b) => b.id === flat.building_id);
        const society = societiesData.find((s) => s.id === flat.society_id);
        return {
          ...flat,
          building_name: building?.name || "Unknown Building",
          society_name: society?.name || "Unknown Society",
        };
      });

      setFlats(flatsWithDetails || []);

      // Step 5: Get users who are in these societies (from users table directly)
      // Your users table has society_id field
      const { data: membersData, error: membersError } = await supabase
        .from("users")
        .select("*")
        .eq("is_delete", false)
        .in("society_id", societyIds)
        .in("role_type", ["Tanent-M", "Tanent-O"])
        .order("created_at", { ascending: false });

      if (membersError) throw membersError;

      // Step 6: Get user_flats for these users to get flat details
      const userIds = membersData?.map((member) => member.id) || [];
      let userFlatsData = [];

      if (userIds.length > 0) {
        const { data, error: userFlatsError } = await supabase
          .from("user_flats")
          .select("*")
          .in("user_id", userIds);

        if (userFlatsError) throw userFlatsError;
        userFlatsData = data || [];
      }

      // Step 7: Combine members with flat, building, society details
      const membersWithDetails = (membersData || []).map((member) => {
        const userFlat = userFlatsData.find((uf) => uf.user_id === member.id);
        const flat = flatsData.find((f) => f.id === userFlat?.flat_id);
        const building = buildingsData.find((b) => b.id === flat?.building_id);
        const society = societiesData.find((s) => s.id === member.society_id);

        return {
          id: member.id,
          full_name: member.name, // Your field is 'name' not 'full_name'
          email: member.email,
          phone_number: member.number, // Your field is 'number' not 'phone_number'
          role_type: member.role_type,
          created_at: member.created_at,
          updated_at: member.updated_at,
          is_active: member.is_active,
          is_delete: member.is_delete,
          profile_url: member.profile_url,
          registed_user_id: member.registed_user_id,
          whatsapp_number: member.whatsapp_number,
          move_in_date: member.move_in_date,
          move_out_date: member.move_out_date,
          // Flat details
          flat_number: flat?.flat_number || "N/A",
          building_name: building?.name || "N/A",
          society_name: society?.name || "N/A",
          floor_number: flat?.floor_number,
          bhk_type: flat?.bhk_type,
          area_sqft: flat?.area_sqft,
          occupancy_status: flat?.occupancy_status,
          building_id: flat?.building_id,
          society_id: member.society_id, // Use member's society_id directly
          flat_id: userFlat?.flat_id,
        };
      });

      setMembers(membersWithDetails || []);
      setFilteredMembers(membersWithDetails || []);
      updateStats(
        membersWithDetails || [],
        societiesData,
        buildingsData,
        flatsData,
      );

      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update statistics
  const updateStats = (
    membersData,
    societiesData,
    buildingsData,
    flatsData,
  ) => {
    const tenantMCount = membersData.filter(
      (m) => m.role_type === "Tanent-M",
    ).length;
    const tenantOCount = membersData.filter(
      (m) => m.role_type === "Tanent-O",
    ).length;

    setStats({
      totalSocieties: societiesData?.length || 0,
      totalBuildings: buildingsData?.length || 0,
      totalFlats: flatsData?.length || 0,
      totalMembers: membersData.length,
      tenantM: tenantMCount,
      tenantO: tenantOCount,
    });
  };

  // Apply filters
  useEffect(() => {
    let result = [...members];

    // Search filter - UPDATED to use correct field names
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (member) =>
          member.full_name?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.phone_number?.toLowerCase().includes(term) ||
          member.flat_number?.toString().toLowerCase().includes(term) ||
          member.building_name?.toLowerCase().includes(term) ||
          member.society_name?.toLowerCase().includes(term),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((member) => member.role_type === roleFilter);
    }

    // Society filter
    if (societyFilter !== "all") {
      result = result.filter(
        (member) => member.society_id?.toString() === societyFilter,
      );
    }

    // Building filter
    if (buildingFilter !== "all") {
      result = result.filter(
        (member) => member.building_id?.toString() === buildingFilter,
      );
    }

    // Tab filter (Tenant-M or Tenant-O)
    if (selectedTab === 1) {
      result = result.filter((member) => member.role_type === "Tanent-M");
    } else if (selectedTab === 2) {
      result = result.filter((member) => member.role_type === "Tanent-O");
    }

    setFilteredMembers(result);
  }, [
    members,
    searchTerm,
    selectedTab,
    roleFilter,
    societyFilter,
    buildingFilter,
  ]);

  // Handle refresh
  const handleRefresh = async () => {
    if (pmId) {
      await fetchAllData(pmId);
    }
  };

  // Handle view member details
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress sx={{ color: "#6F0B14" }} />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: "12px" }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Box sx={{ mb: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#6F0B14",
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 400,
                  mb: 1,
                }}
              >
                Member Management
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "#A29EB6", fontFamily: "'Roboto', sans-serif" }}
              >
                Manage members across your assigned societies
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                color: "#6F0B14",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "rgba(111, 11, 20, 0.08)",
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Tabs and Filters */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <StyledCard sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    minHeight: "48px",
                  },
                  "& .Mui-selected": {
                    color: "#6F0B14 !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#6F0B14",
                  },
                }}
              >
                <Tab
                  icon={<PeopleIcon />}
                  iconPosition="start"
                  label={`All Members (${stats.totalMembers})`}
                />
                <Tab
                  icon={<PersonIcon />}
                  iconPosition="start"
                  label={`Tenant-M (${stats.tenantM})`}
                />
                <Tab
                  icon={<FamilyIcon />}
                  iconPosition="start"
                  label={`Tenant-O (${stats.tenantO})`}
                />
              </Tabs>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search members by name, phone, flat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#6F0B14" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      backgroundColor: "rgba(111, 11, 20, 0.03)",
                    },
                  }}
                  size="small"
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: "'Roboto', sans-serif" }}>
                    Role Type
                  </InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Role Type"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                    }}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="Tanent-M">Tenant-M</MenuItem>
                    <MenuItem value="Tanent-O">Tenant-O</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: "'Roboto', sans-serif" }}>
                    Society
                  </InputLabel>
                  <Select
                    value={societyFilter}
                    onChange={(e) => setSocietyFilter(e.target.value)}
                    label="Society"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                    }}
                  >
                    <MenuItem value="all">All Societies</MenuItem>
                    {societies.map((society) => (
                      <MenuItem key={society.id} value={society.id.toString()}>
                        {society.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontFamily: "'Roboto', sans-serif" }}>
                    Building
                  </InputLabel>
                  <Select
                    value={buildingFilter}
                    onChange={(e) => setBuildingFilter(e.target.value)}
                    label="Building"
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                    }}
                  >
                    <MenuItem value="all">All Buildings</MenuItem>
                    {buildings.map((building) => (
                      <MenuItem
                        key={building.id}
                        value={building.id.toString()}
                      >
                        {building.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setSocietyFilter("all");
                    setBuildingFilter("all");
                  }}
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                    color: "#6F0B14",
                    borderColor: "#6F0B14",
                    borderRadius: "8px",
                    textTransform: "none",
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>

            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#A29EB6", fontFamily: "'Roboto', sans-serif" }}
              >
                Showing {filteredMembers.length} of {members.length} members
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#6F0B14",
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                }}
              >
                {societies.length} societies • {buildings.length} buildings •{" "}
                {flats.length} flats
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
      >
        <StyledCard>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "rgba(111, 11, 20, 0.05)" }}>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Member
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Contact
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Location
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Flat Details
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Role & Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                        textAlign: "center",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <PeopleIcon
                            sx={{ fontSize: 64, color: "#A29EB6", mb: 2 }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#666",
                              fontFamily: "'Roboto', sans-serif",
                              mb: 1,
                            }}
                          >
                            No members found
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            {searchTerm
                              ? `No members match "${searchTerm}"`
                              : "No members found for your assigned properties"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: "rgba(111, 11, 20, 0.1)",
                                width: 40,
                                height: 40,
                              }}
                              src={member.profile_url || undefined}
                            >
                              {!member.profile_url &&
                                (member.full_name?.charAt(0) || "U")}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily: "'Roboto', sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                {member.full_name || "Unknown"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontFamily: "'Roboto', sans-serif",
                                }}
                              >
                                ID: {member.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Roboto', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 0.5,
                              }}
                            >
                              <PhoneIcon fontSize="small" />
                              {member.phone_number || "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontFamily: "'Roboto', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <EmailIcon fontSize="small" />
                              {member.email || "No email"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Roboto', sans-serif",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 0.5,
                              }}
                            >
                              <ApartmentIcon fontSize="small" />
                              {member.society_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontFamily: "'Roboto', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <BuildingIcon fontSize="small" />
                              {member.building_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Roboto', sans-serif",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mb: 0.5,
                              }}
                            >
                              <HomeIcon fontSize="small" />
                              {member.flat_number === "N/A"
                                ? "No Flat Assigned"
                                : `Flat ${member.flat_number}`}
                              {member.floor_number &&
                                ` (Floor ${member.floor_number})`}
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontFamily: "'Roboto', sans-serif",
                                }}
                              >
                                {member.bhk_type || "N/A"} •{" "}
                                {member.area_sqft
                                  ? `${member.area_sqft} sq.ft`
                                  : ""}
                              </Typography>
                              <StatusChip
                                label={member.occupancy_status || "Vacant"}
                                status={member.occupancy_status}
                                size="small"
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="column" gap={1}>
                            <RoleChip
                              label={member.role_type || "Unknown"}
                              role={member.role_type}
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#666",
                                fontFamily: "'Roboto', sans-serif",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <CalendarIcon fontSize="small" />
                              Joined: {formatDate(member.created_at)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewMember(member)}
                              sx={{ color: "#6F0B14" }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Member Details Dialog */}
      <Dialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedMember && (
          <>
            <DialogTitle
              sx={{ fontFamily: "'Roboto', sans-serif", color: "#6F0B14" }}
            >
              Member Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: "rgba(111, 11, 20, 0.1)",
                        fontSize: "3rem",
                      }}
                      src={selectedMember.profile_url || undefined}
                    >
                      {!selectedMember.profile_url &&
                        (selectedMember.full_name?.charAt(0) || "U")}
                    </Avatar>
                    <Box textAlign="center">
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        {selectedMember.full_name || "Unknown"}
                      </Typography>
                      <RoleChip
                        label={selectedMember.role_type || "Unknown"}
                        role={selectedMember.role_type}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    {/* Contact Information */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#6F0B14",
                          fontFamily: "'Roboto', sans-serif",
                          mb: 1,
                        }}
                      >
                        Contact Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Phone Number
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <PhoneIcon fontSize="small" />
                            {selectedMember.phone_number || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Email Address
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <EmailIcon fontSize="small" />
                            {selectedMember.email || "No email"}
                          </Typography>
                        </Grid>
                        {selectedMember.whatsapp_number && (
                          <Grid item xs={12} sm={6}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#A29EB6",
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              WhatsApp Number
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              {selectedMember.whatsapp_number}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>

                    {/* Location Information */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#6F0B14",
                          fontFamily: "'Roboto', sans-serif",
                          mb: 1,
                        }}
                      >
                        Location Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Society
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <ApartmentIcon fontSize="small" />
                            {selectedMember.society_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Building
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <BuildingIcon fontSize="small" />
                            {selectedMember.building_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Flat Number
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <HomeIcon fontSize="small" />
                            {selectedMember.flat_number === "N/A"
                              ? "No Flat Assigned"
                              : `Flat ${selectedMember.flat_number}`}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Flat Details */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#6F0B14",
                          fontFamily: "'Roboto', sans-serif",
                          mb: 1,
                        }}
                      >
                        Flat Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            BHK Type
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {selectedMember.bhk_type || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Area (sq.ft)
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {selectedMember.area_sqft || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Floor
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {selectedMember.floor_number || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Occupancy Status
                          </Typography>
                          <StatusChip
                            label={selectedMember.occupancy_status || "Vacant"}
                            status={selectedMember.occupancy_status}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Additional Information */}
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#6F0B14",
                          fontFamily: "'Roboto', sans-serif",
                          mb: 1,
                        }}
                      >
                        Additional Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Member ID
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {selectedMember.id}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Account Status
                          </Typography>
                          <Chip
                            label={
                              selectedMember.is_active ? "Active" : "Inactive"
                            }
                            size="small"
                            sx={{
                              backgroundColor: selectedMember.is_active
                                ? "#E6F4E6"
                                : "#FFEBEE",
                              color: selectedMember.is_active
                                ? "#008000"
                                : "#C62828",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#A29EB6",
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Joined Date
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarIcon fontSize="small" />
                            {formatDate(selectedMember.created_at)}
                          </Typography>
                        </Grid>
                        {selectedMember.move_in_date && (
                          <Grid item xs={6} sm={4}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#A29EB6",
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              Move-in Date
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "'Roboto', sans-serif" }}
                            >
                              {formatDate(selectedMember.move_in_date)}
                            </Typography>
                          </Grid>
                        )}
                        {selectedMember.move_out_date && (
                          <Grid item xs={6} sm={4}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#A29EB6",
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              Move-out Date
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "'Roboto', sans-serif" }}
                            >
                              {formatDate(selectedMember.move_out_date)}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setMemberDialogOpen(false)}
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  color: "#6F0B14",
                  borderColor: "#6F0B14",
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
