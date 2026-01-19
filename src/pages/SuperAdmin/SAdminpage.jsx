import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Card,
  CardContent,
  Collapse,
} from "@mui/material";
import {
  Search,
  Refresh,
  AdminPanelSettings,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Phone,
  Email,
  FilterList,
  LocationCity,
  Apartment,
  ExpandMore,
  ExpandLess,
  Sync,
} from "@mui/icons-material";
import { MdOutlineWhatsapp } from "react-icons/md";
import { supabase } from "../../api/supabaseClient";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";

// Status options
const statusOptions = [
  { value: "active", label: "Active", color: "#008000" },
  { value: "inactive", label: "Inactive", color: "#A29EB6" },
];

// Collapsible Row Component
const CollapsibleRow = ({ user, societyName }) => {
  const [open, setOpen] = useState(false);

  // Safely handle ID
  const userId = user.id ? user.id.toString() : "";
  const displayId = userId.substring
    ? userId.substring(0, 8)
    : userId.slice
    ? userId.slice(0, 8)
    : "N/A";

  return (
    <>
      {/* Main Row */}
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: alpha("#6F0B14", 0.1),
                color: "#6F0B14",
                fontWeight: 600,
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight="600">
                {user.name || "No Name"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {displayId}...
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{user.email}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{user.number || "N/A"}</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {user.whatsapp_number || "N/A"}
          </Typography>
        </TableCell>

        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {societyName ? (
              <Chip
                label={societyName}
                size="small"
                icon={<LocationCity fontSize="small" />}
                sx={{
                  backgroundColor: alpha("#6F0B14", 0.1),
                  color: "#6F0B14",
                  fontWeight: 500,
                }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Not Assigned
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={user.is_active ? "Active" : "Inactive"}
            size="small"
            sx={{
              backgroundColor: user.is_active
                ? alpha("#008000", 0.1)
                : alpha("#A29EB6", 0.1),
              color: user.is_active ? "#008000" : "#A29EB6",
              fontWeight: 500,
            }}
          />
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                p: 3,
                backgroundColor: alpha("#6F0B14", 0.02),
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                color="#6F0B14"
                fontWeight="600"
              >
                Admin Details
              </Typography>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}
                gap={3}
              >
                {/* Personal Information */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Personal Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" sx={{ color: "#6F0B14" }} />
                      <Typography variant="body2">
                        <strong>Email:</strong> {user.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone fontSize="small" sx={{ color: "#6F0B14" }} />
                      <Typography variant="body2">
                        <strong>Number:</strong> {user.number || "Not provided"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MdOutlineWhatsapp size={20} color="#25D366" />
                      <Typography variant="body2">
                        <strong>WhatsApp:</strong>{" "}
                        {user.whatsapp_number || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Assignment Information */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Assignment Details
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationCity
                        fontSize="small"
                        sx={{ color: "#6F0B14" }}
                      />
                      <Typography variant="body2">
                        <strong>Society:</strong>{" "}
                        {societyName || "Not assigned"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AdminPanelSettings
                        fontSize="small"
                        sx={{ color: "#6F0B14" }}
                      />
                      <Typography variant="body2">
                        <strong>Role:</strong>{" "}
                        <span style={{ color: "#6F0B14", fontWeight: 500 }}>
                          Administrator
                        </span>
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Additional Info */}
                <Box gridColumn={{ xs: "span 1", md: "span 2" }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Additional Information
                  </Typography>
                  <Box display="flex" gap={3} flexWrap="wrap">
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Created At
                      </Typography>
                      <Typography variant="body2">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {user.updated_at
                          ? new Date(user.updated_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default function SuperAdminPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    assigned: 0,
    unassigned: 0,
  });

  // Fetch Admins and Societies from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Admins (role_type = "Admin")
      const { data: adminsData, error: adminsError } = await supabase
        .from("users")
        .select("*")
        .eq("role_type", "Admin")
        .order("created_at", { ascending: false });

      if (adminsError) throw adminsError;

      // Fetch Societies
      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("id, name, city")
        .order("name");

      if (societiesError) throw societiesError;
      setSocieties(societiesData || []);

      setAdmins(adminsData || []);

      // Calculate statistics
      const total = adminsData?.length || 0;
      const active = adminsData?.filter((admin) => admin.is_active).length || 0;
      const assigned =
        adminsData?.filter((admin) => admin.society_id).length || 0;
      const unassigned = total - assigned;

      setStats({ total, active, assigned, unassigned });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedSociety("all");
    setStatusFilter("all");
    setShowFilters(false);
  };

  // Get society name from society_id
  const getSocietyName = (societyId) => {
    if (!societyId) return null;
    const society = societies.find((s) => s.id === societyId);
    return society
      ? `${society.name}${society.city ? ` (${society.city})` : ""}`
      : null;
  };

  // Filter Admins based on search and filters
  const filteredAdmins = admins.filter((admin) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (admin.name?.toLowerCase() || "").includes(term) ||
      (admin.email?.toLowerCase() || "").includes(term) ||
      (admin.number?.toLowerCase() || "").includes(term) ||
      (admin.whatsapp_number?.toLowerCase() || "").includes(term);

    const matchesSociety =
      selectedSociety === "all" ||
      (selectedSociety === "assigned" && admin.society_id) ||
      (selectedSociety === "unassigned" && !admin.society_id) ||
      admin.society_id?.toString() === selectedSociety;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && admin.is_active) ||
      (statusFilter === "inactive" && !admin.is_active);

    return matchesSearch && matchesSociety && matchesStatus;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="300" color="#6F0B14" gutterBottom>
          Admin Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all administrators across societies
        </Typography>
      </Box>

      {/* Filters Card */}
      <Paper
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
          mb: 4,
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "flex-start", lg: "center" },
            justifyContent: "space-between",
            gap: 3,
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha("#6F0B14", 0.1),
              }}
            >
              <FilterList sx={{ color: "#6F0B14", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight="600" color="#6F0B14">
              Filters & Search
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                backgroundColor: alpha("#6F0B14", 0.1),
                color: "#6F0B14",
                "&:hover": {
                  backgroundColor: alpha("#6F0B14", 0.2),
                },
                fontWeight: 500,
              }}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button
              startIcon={<Sync />}
              onClick={resetFilters}
              sx={{
                backgroundColor: "action.hover",
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "action.selected",
                },
                fontWeight: 500,
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search administrators by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#A29EB6" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                height: 48,
              },
            }}
          />
        </Box>

        {/* Filter Controls - Collapsible */}
        <Collapse in={showFilters}>
          <Box
            sx={{
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
              pb: 1,
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Society</InputLabel>
                  <Select
                    value={selectedSociety}
                    onChange={(e) => setSelectedSociety(e.target.value)}
                    label="Filter by Society"
                    sx={{
                      borderRadius: 2,
                      height: 48,
                    }}
                  >
                    <MenuItem value="all">All Societies</MenuItem>
                    <MenuItem value="assigned">
                      Assigned to any Society
                    </MenuItem>
                    <MenuItem value="unassigned">Not Assigned</MenuItem>
                    {societies.map((society) => (
                      <MenuItem key={society.id} value={society.id}>
                        {society.name}
                        {society.city ? ` (${society.city})` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Filter by Status"
                    sx={{
                      borderRadius: 2,
                      height: 48,
                    }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Results Summary */}
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {filteredAdmins.length} of {admins.length} administrators
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{
              color: "#6F0B14",
              borderColor: alpha("#6F0B14", 0.3),
              "&:hover": {
                borderColor: "#6F0B14",
                backgroundColor: alpha("#6F0B14", 0.04),
              },
            }}
            variant="outlined"
          >
            Refresh Data
          </Button>
        </Box>
      </Paper>

      {/* Admins Table */}
      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
              <CircularProgress sx={{ color: "#6F0B14" }} />
            </Box>
          ) : filteredAdmins.length === 0 ? (
            <Box sx={{ textAlign: "center", p: 8 }}>
              <AdminPanelSettings
                sx={{ fontSize: 80, color: alpha("#6F0B14", 0.3), mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No administrators found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ||
                selectedSociety !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "No administrators available in the system"}
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead sx={{ backgroundColor: alpha("#6F0B14", 0.05) }}>
                <TableRow>
                  <TableCell width="50px" />
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                    >
                      Administrator
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                    >
                      Email
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                    >
                      Phone Number
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                    >
                      WhatsApp
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                    >
                      Society
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                    >
                      Status
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <CollapsibleRow
                    key={admin.id}
                    user={admin}
                    societyName={getSocietyName(admin.society_id)}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Container>
  );
}
