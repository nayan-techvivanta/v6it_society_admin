import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import BadgeIcon from "@mui/icons-material/Badge";
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
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import { supabase } from "../../api/supabaseClient";

// Styled components
const StatusChip = styled(Chip)(({ status }) => ({
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
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

// Animation
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [stats, setStats] = useState({
    totalSocieties: 0,
    totalBuildings: 0,
    totalFlats: 0,
    totalMembers: 0,
    tenantM: 0,
    tenantO: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [societyFilter, setSocietyFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchAdminData = async () => {
      const profileId = localStorage.getItem("profileId");
      if (!profileId) {
        setError("Please login to access user data.");
        setLoading(false);
        return;
      }
      setAdminId(profileId);
      await fetchAllData(profileId);
    };
    fetchAdminData();
  }, []);

  const fetchAllData = async (profileId) => {
    setLoading(true);
    try {
      let societyIds = [];
      const { data: assignedSocieties } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", profileId);

      if (assignedSocieties && assignedSocieties.length > 0) {
        societyIds = assignedSocieties.map((item) => item.society_id);
      } else {
        const storedSocietyId = localStorage.getItem("societyId");
        if (storedSocietyId) {
          societyIds = [storedSocietyId];
        }
      }

      if (societyIds.length === 0) {
        setError("No societies are assigned to you yet.");
        setLoading(false);
        return;
      }

      // Societies
      const { data: societiesData } = await supabase
        .from("societies")
        .select("id, name, address, city")
        .in("id", societyIds);

      setSocieties(societiesData || []);

      // Buildings
      const { data: buildingsData } = await supabase
        .from("buildings")
        .select("*")
        .eq("is_delete", false)
        .in("society_id", societyIds);

      const buildingsWithSociety = buildingsData.map((building) => ({
        ...building,
        society_name:
          societiesData.find((s) => s.id === building.society_id)?.name ||
          "Unknown",
      }));
      setBuildings(buildingsWithSociety || []);

      // Flats
      const buildingIds = buildingsData.map((b) => b.id);
      if (buildingIds.length > 0) {
        const { data: flatsData } = await supabase
          .from("flats")
          .select("*")
          .eq("is_delete", false)
          .in("building_id", buildingIds)
          .order("building_id, flat_number");

        const flatsWithDetails = flatsData.map((flat) => {
          const building = buildingsData.find((b) => b.id === flat.building_id);
          const society = societiesData.find((s) => s.id === flat.society_id);
          return {
            ...flat,
            building_name: building?.name || "Unknown",
            society_name: society?.name || "Unknown",
          };
        });
        setFlats(flatsWithDetails || []);

        // Members
        // const flatIds = flatsData.map((f) => f.id);
        // if (flatIds.length > 0) {
        //   const { data: membersData } = await supabase
        //     .from("users")
        //     .select("*")
        //     .eq("is_delete", false)
        //     .in("flat_id", flatIds)
        //     .in("role_type", ["Tanent-M", "Tanent-O"])
        //     .order("created_at", { ascending: false });

        //   const membersWithDetails = membersData.map((member) => {
        //     const flat = flatsData.find((f) => f.id === member.flat_id);
        //     const building = buildingsData.find(
        //       (b) => b.id === flat?.building_id,
        //     );
        //     const society = societiesData.find(
        //       (s) => s.id === flat?.society_id,
        //     );
        //     return {
        //       ...member,
        //       full_name: member.name,
        //       phone_number: member.number,
        //       flat_number: flat?.flat_number || "N/A",
        //       building_name: building?.name || "N/A",
        //       society_name: society?.name || "N/A",
        //       floor_number: flat?.floor_number,
        //       bhk_type: flat?.bhk_type,
        //       area_sqft: flat?.area_sqft,
        //       occupancy_status: flat?.occupancy_status,
        //       building_id: flat?.building_id,
        //       society_id: flat?.society_id,
        //     };
        //   });

        //   setMembers(membersWithDetails || []);
        //   setFilteredMembers(membersWithDetails || []);
        //   updateStats(
        //     membersWithDetails,
        //     societiesData,
        //     buildingsData,
        //     flatsData,
        //   );
        // } else {
        //   setMembers([]);
        //   setFilteredMembers([]);
        //   updateStats([], societiesData, buildingsData, flatsData);
        // }
        // Members
        const flatIds = flatsData.map((f) => f.id);
        if (flatIds.length > 0) {
          const { data: userFlatsData, error: userFlatsError } = await supabase
            .from("user_flats")
            .select(
              `
      flat_id,
      user_id,
      users (
        id,
        name,
        email,
        number,
        whatsapp_number,
        profile_url,
        role_type,
        is_active,
        created_at,
        is_delete
      )
    `,
            )
            .in("flat_id", flatIds)
            .eq("users.is_delete", false);

          if (userFlatsError) throw userFlatsError;

          const membersWithDetails = userFlatsData
            .filter((uf) => uf.users) // ensure user exists
            .map((uf) => {
              const flat = flatsData.find((f) => f.id === uf.flat_id);
              const building = buildingsData.find(
                (b) => b.id === flat?.building_id,
              );
              const society = societiesData.find(
                (s) => s.id === flat?.society_id,
              );

              return {
                ...uf.users,
                full_name: uf.users.name,
                phone_number: uf.users.number,
                flat_number: flat?.flat_number || "N/A",
                building_name: building?.name || "N/A",
                society_name: society?.name || "N/A",
                floor_number: flat?.floor_number,
                bhk_type: flat?.bhk_type,
                area_sqft: flat?.area_sqft,
                occupancy_status: flat?.occupancy_status,
                building_id: flat?.building_id,
                society_id: flat?.society_id,
              };
            });

          setMembers(membersWithDetails || []);
          setFilteredMembers(membersWithDetails || []);
          updateStats(
            membersWithDetails,
            societiesData,
            buildingsData,
            flatsData,
          );
        } else {
          setMembers([]);
          setFilteredMembers([]);
          updateStats([], societiesData, buildingsData, flatsData);
        }
      } else {
        setFlats([]);
        setMembers([]);
        setFilteredMembers([]);
        updateStats([], societiesData, buildingsData, []);
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (member) =>
          member.full_name?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.phone_number?.toLowerCase().includes(term) ||
          member.flat_number?.toLowerCase().includes(term) ||
          member.building_name?.toLowerCase().includes(term) ||
          member.society_name?.toLowerCase().includes(term),
      );
    }

    if (roleFilter !== "all")
      result = result.filter((member) => member.role_type === roleFilter);
    if (societyFilter !== "all")
      result = result.filter(
        (member) => member.society_id?.toString() === societyFilter,
      );
    if (buildingFilter !== "all")
      result = result.filter(
        (member) => member.building_id?.toString() === buildingFilter,
      );

    if (selectedTab === 1)
      result = result.filter((member) => member.role_type === "Tanent-M");
    else if (selectedTab === 2)
      result = result.filter((member) => member.role_type === "Tanent-O");

    setFilteredMembers(result);
  }, [
    members,
    searchTerm,
    selectedTab,
    roleFilter,
    societyFilter,
    buildingFilter,
  ]);

  const handleRefresh = async () => {
    if (adminId) await fetchAllData(adminId);
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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

  // Dialog Helper Components
  const SectionHeader = ({ icon, title }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box
        sx={{
          backgroundColor: "rgba(111, 11, 20, 0.1)",
          borderRadius: 2,
          p: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6F0B14",
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        sx={{ ml: 2, fontWeight: 600, color: "#6F0B14" }}
      >
        {title}
      </Typography>
    </Box>
  );

  const InfoCard = ({ icon, label, value, breakWord }) => (
    <Grid item xs={12} md={6}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
        }}
      >
        <Box display="flex" gap={2}>
          <Box
            sx={{
              backgroundColor: "rgba(111, 11, 20, 0.1)",
              borderRadius: 2,
              p: 1.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6F0B14",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography
              fontWeight={600}
              sx={{ wordBreak: breakWord ? "break-all" : "normal" }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Grid>
  );

  const ListItemCard = ({ icon, label, value }) => (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        p: 2,
      }}
    >
      <Box display="flex" gap={2} alignItems="center">
        <Box
          sx={{
            backgroundColor: "rgba(111, 11, 20, 0.1)",
            borderRadius: 2,
            p: 1.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6F0B14",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography fontWeight={600}>{value || "N/A"}</Typography>
        </Box>
      </Box>
    </Paper>
  );

  const StatCard = ({ icon, label, value }) => (
    <Grid item xs={6}>
      <Paper
        sx={{
          p: 2,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
        }}
      >
        <Box textAlign="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              mb: 1,
            }}
          >
            {icon}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography fontWeight={600}>{value}</Typography>
        </Box>
      </Paper>
    </Grid>
  );

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
                User Management
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
                "&:hover": { backgroundColor: "rgba(111, 11, 20, 0.08)" },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: "50px" }}
      >
        <Card
          sx={{
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
            border: "1px solid rgba(111, 11, 20, 0.1)",
          }}
        >
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
                  "& .Mui-selected": { color: "#6F0B14 !important" },
                  "& .MuiTabs-indicator": { backgroundColor: "#6F0B14" },
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
                      <MenuItem key={society.id} value={society.id}>
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
                      <MenuItem key={building.id} value={building.id}>
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
        </Card>
      </motion.div>

      {/* Members Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
      >
        <Card
          sx={{
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
            border: "1px solid rgba(111, 11, 20, 0.1)",
          }}
        >
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
                              src={member.profile_url}
                              sx={{ bgcolor: "rgba(111, 11, 20, 0.1)" }}
                            >
                              {member.full_name?.charAt(0) || "U"}
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
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
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
                            Flat {member.flat_number}
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
        </Card>
      </motion.div>

      {/* Member Details Dialog */}
      <Dialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        {selectedMember && (
          <>
            <Box
              sx={{
                background: "linear-gradient(135deg, #6F0B14 0%, #8a1021 100%)",
                px: 4,
                py: 3,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Avatar
                  src={selectedMember.profile_url}
                  sx={{
                    width: 70,
                    height: 70,
                    bgcolor: "rgba(255,255,255,0.2)",
                    fontSize: "2rem",
                    border: "3px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {selectedMember.full_name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography fontSize="1.2rem" fontWeight={600} noWrap>
                    {selectedMember.full_name || "Unknown"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                    <RoleChip
                      label={selectedMember.role_type || "Unknown"}
                      role={selectedMember.role_type}
                      sx={{
                        color: "white",
                        borderColor: "rgba(255,255,255,0.4)",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        fontWeight: 600,
                        height: 22,
                      }}
                    />
                    <Chip
                      label={selectedMember.is_active ? "ACTIVE" : "INACTIVE"}
                      size="small"
                      sx={{
                        backgroundColor: selectedMember.is_active
                          ? "rgba(46, 204, 113, 0.9)"
                          : "rgba(231, 76, 60, 0.9)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        height: 22,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 4, alignItems: "center" }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Member ID
                  </Typography>
                  <Typography fontWeight={600}>{selectedMember.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Joined Date
                  </Typography>
                  <Typography fontWeight={600}>
                    {formatDate(selectedMember.created_at)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <DialogContent sx={{ p: 0, backgroundColor: "#fafafa" }}>
              {/* Contact Info */}
              <Box sx={{ p: 3, borderBottom: "1px solid #eee" }}>
                <SectionHeader
                  icon={<PhoneIcon />}
                  title="Contact Information"
                />
                <Grid container spacing={2}>
                  <InfoCard
                    icon={<PhoneIcon />}
                    label="Phone Number"
                    value={selectedMember.phone_number || "Not provided"}
                  />
                  <InfoCard
                    icon={<EmailIcon />}
                    label="Email Address"
                    value={selectedMember.email || "Not provided"}
                    breakWord
                  />
                </Grid>
              </Box>

              {/* Location + Flat */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SectionHeader
                      icon={<LocationIcon />}
                      title="Location Details"
                    />
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <ListItemCard
                        icon={<ApartmentIcon />}
                        label="Society"
                        value={selectedMember.society_name}
                      />
                      <ListItemCard
                        icon={<BuildingIcon />}
                        label="Building"
                        value={selectedMember.building_name}
                      />
                      <ListItemCard
                        icon={<HomeIcon />}
                        label="Flat Number"
                        value={`Flat ${selectedMember.flat_number}`}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <SectionHeader
                      icon={<HomeIcon />}
                      title="Flat Information"
                    />
                    <Grid container spacing={2}>
                      <StatCard
                        label="BHK Type"
                        value={selectedMember.bhk_type}
                        icon="🏠"
                      />
                      <StatCard
                        label="Area"
                        value={
                          selectedMember.area_sqft
                            ? `${selectedMember.area_sqft} sq.ft`
                            : "N/A"
                        }
                        icon="📐"
                      />
                      <StatCard
                        label="Floor"
                        value={
                          selectedMember.floor_number
                            ? `Floor ${selectedMember.floor_number}`
                            : "N/A"
                        }
                        icon="🏢"
                      />
                      <Grid item xs={6}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #e0e0e0",
                            backgroundColor: "#fff",
                          }}
                        >
                          <Box textAlign="center">
                            <Box
                              sx={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                backgroundColor: "#f5f5f5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.5rem",
                                mb: 1,
                              }}
                            >
                              👥
                            </Box>
                            <Typography variant="caption">Occupancy</Typography>
                            <StatusChip
                              label={
                                selectedMember.occupancy_status || "Vacant"
                              }
                              status={selectedMember.occupancy_status}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                p: 3,
                backgroundColor: "#f8f9fa",
                borderTop: "1px solid #eee",
              }}
            >
              <Button
                onClick={() => setMemberDialogOpen(false)}
                variant="contained"
                startIcon={<CloseIcon />}
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  background:
                    "linear-gradient(135deg, #6F0B14 0%, #8a1021 100%)",
                  color: "#fff",
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #5a0910 0%, #6F0B14 100%)",
                  },
                }}
              >
                Close Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
