import React, { useState, useEffect, useCallback } from "react";
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
  Collapse,
  TableSortLabel,
} from "@mui/material";
import { Breadcrumbs, Link } from "@mui/material";
import { FaEye } from "react-icons/fa";
import { ArrowBack, ChevronRight, PersonAdd } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AddFlatDialog from "../../components/dialogs/AdminDialogs/AddFlat";
import {
  Edit,
  Delete,
  Add,
  Search,
  Bed,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { IoIosHome } from "react-icons/io";
import { supabase } from "../../api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import AddOwnerDialog from "../../components/dialogs/AdminDialogs/AddOwnerDialog";
import FlatMembersDialog from "../../components/dialogs/AdminDialogs/FlatMembersDialog";

export default function Flats() {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const [flats, setFlats] = useState([]);
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buildingLoading, setBuildingLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [openAddOwner, setOpenAddOwner] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [flatMembers, setFlatMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);

  const [buildingName, setBuildingName] = useState("Loading...");
  const [sortConfig, setSortConfig] = useState({
    key: "floor_number",
    direction: "asc",
  });
  const societyId = Number(localStorage.getItem("societyId"));

  const theme = {
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    secondary: "#10b981",
    secondaryLight: "#34d399",
    warning: "#f59e0b",
    warningLight: "#fbbf24",
    background: "#f8fafc",
    cardBackground: "#ffffff",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
  };

  // Fetch building details
  const fetchBuilding = useCallback(async () => {
    setBuildingLoading(true);
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, description, flat_limit")
        .eq("id", buildingId)
        .single();

      if (error) throw error;
      setBuilding(data);
    } catch (error) {
      console.error("Error fetching building:", error);
      toast.error("Failed to fetch building details");
    } finally {
      setBuildingLoading(false);
    }
  }, [buildingId]);

  // const fetchFlats = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from("flats")
  //       .select(
  //         `
  //         id, flat_number, floor_number, bhk_type, area_sqft,
  //         occupancy_status, is_active, created_at,
  //         updated_at,building_id, society_id
  //       `
  //       )
  //       .eq("building_id", buildingId)
  //       .eq("is_delete", false)
  //       .order("floor_number", { ascending: true })
  //       .order("flat_number", { ascending: true });

  //     if (error) throw error;

  //     // Map occupancy status colors
  //     const mappedFlats = data.map((flat) => ({
  //       ...flat,
  //       statusColor:
  //         flat.occupancy_status === "Occupied"
  //           ? theme.success
  //           : flat.occupancy_status === "Blocked"
  //           ? theme.warning
  //           : theme.secondary,
  //     }));

  //     setFlats(mappedFlats);
  //   } catch (error) {
  //     console.error("Error fetching flats:", error);
  //     toast.error("Failed to fetch flats");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [buildingId]);
  const fetchFlats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("flats")
        .select(
          `
        id, flat_number, floor_number, bhk_type, area_sqft, 
        occupancy_status, is_active, created_at, updated_at,
        building_id, society_id, device_id
      `,
        )
        .eq("building_id", buildingId)
        .eq("is_delete", false)
        .order("floor_number", { ascending: true })
        .order("flat_number", { ascending: true });

      if (error) throw error;

      const mappedFlats = data.map((flat) => ({
        ...flat,
        statusColor:
          flat.occupancy_status === "Occupied"
            ? theme.success
            : flat.occupancy_status === "Blocked"
              ? theme.warning
              : theme.secondary,
      }));

      setFlats(mappedFlats);
    } catch (error) {
      console.error("Error fetching flats:", error);
      toast.error("Failed to fetch flats");
    } finally {
      setLoading(false);
    }
  }, [buildingId]);
  // const fetchFlatMembers = async (flat) => {
  //   setLoadingMembers(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from("users")
  //       .select(
  //         "id, name, email, number, role_type, whatsapp_number, profile_url",
  //       )
  //       .eq("flat_id", flat.id)
  //       .eq("is_delete", false);

  //     if (error) throw error;

  //     setFlatMembers(data);
  //     setOpenMembersDialog(true);
  //   } catch (err) {
  //     console.error("Error fetching flat members:", err);
  //     toast.error("Failed to fetch flat members");
  //   } finally {
  //     setLoadingMembers(false);
  //   }
  // };
  const fetchFlatMembers = async (flat) => {
    setLoadingMembers(true);
    try {
      // Fetch users assigned to this flat from user_flats with the users table relationship
      const { data, error } = await supabase
        .from("user_flats")
        .select(
          `
        user_id,
        users (
          id,
          name,
          email,
          number,
          whatsapp_number,
          profile_url,
          role_type,
          is_delete
        )
      `,
        )
        .eq("flat_id", flat.id)
        .eq("users.is_delete", false);

      if (error) throw error;

      const members = data
        .filter((item) => item.users)
        .map((item) => ({
          ...item.users,
          isAssignedToFlat: true,
        }));

      setFlatMembers(members);
      setOpenMembersDialog(true);
    } catch (err) {
      console.error("Error fetching flat members:", err);
      toast.error("Failed to fetch flat members");
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (buildingId) {
      fetchBuilding();
      fetchFlats();
    }
  }, [buildingId]);

  // Toggle row expansion
  const toggleRowExpansion = (flatId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [flatId]: !prev[flatId],
    }));
  };

  // Update flat status
  const handleToggleStatus = async (flatId, currentStatus) => {
    const newStatus = currentStatus === "Occupied" ? "Vacant" : "Occupied";

    const { error } = await supabase
      .from("flats")
      .update({ occupancy_status: newStatus })
      .eq("id", flatId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Flat ${newStatus.toLowerCase()}!`);
      fetchFlats();
    }
  };

  // Delete flat
  const handleDeleteFlat = async (flatId) => {
    if (!window.confirm("Are you sure you want to delete this flat?")) return;

    const { error } = await supabase
      .from("flats")
      .update({ is_delete: true })
      .eq("id", flatId);

    if (error) {
      toast.error("Failed to delete flat");
    } else {
      toast.success("Flat deleted successfully!");
      fetchFlats();
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Filter and sort flats
  const filteredFlats = flats
    .filter(
      (flat) =>
        flat.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flat.bhk_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flat.floor_number?.toString().includes(searchTerm),
    )
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const paginatedFlats = filteredFlats.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const flatLimitReached =
    typeof building?.flat_limit === "number" &&
    flats.length >= building.flat_limit;

  return (
    <div className="min-h-screen p-4 md:p-6 font-roboto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
        <div className="mt-3">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() =>
              window.history.back() || navigate("/admin/buildings")
            }
            style={{
              borderColor: theme.border,
              color: theme.textPrimary,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            }}
            className="font-roboto"
          >
            Back to Buildings
          </Button>
        </div>
        <div className="mb-6 p-4 md:p-6 ">
          <Breadcrumbs
            separator={
              <ChevronRight
                fontSize="small"
                style={{ color: theme.textSecondary }}
              />
            }
            aria-label="breadcrumb"
            className="font-roboto"
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() =>
                window.history.back() || navigate("/admin/buildings")
              }
              style={{
                color: theme.textPrimary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = `${theme.primary}10`)
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <IoIosHome />
              <span>Buildings</span>
            </Link>

            <Typography
              color="primary"
              className="font-roboto font-semibold"
              style={{ color: theme.primary, padding: "4px 8px" }}
            >
              {buildingLoading ? "Loading..." : building?.name || "Building"}
            </Typography>

            <Typography
              color="text.secondary"
              className="font-roboto"
              style={{ color: theme.textSecondary, padding: "4px 8px" }}
            >
              Flats ({flats.length})
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Typography
                variant="h4"
                className="font-roboto font-bold text-primary mb-2"
              >
                Flats/Shop/Office Management
              </Typography>
              <Typography className="font-roboto text-gray-600">
                Manage and monitor flats, shops, and office units with occupancy
                and availability details
              </Typography>
              {buildingLoading ? (
                <Typography className="text-gray-600">
                  Loading building details...
                </Typography>
              ) : building ? (
                <div>
                  <Typography
                    className="text-lg font-semibold"
                    style={{ color: theme.primary }}
                  >
                    {building.name}
                  </Typography>
                  <Typography className="text-sm text-gray-600">
                    {building.address || `Building ID: ${buildingId}`}
                  </Typography>
                  {typeof building?.flat_limit === "number" && (
                    <Alert
                      severity={flatLimitReached ? "warning" : "info"}
                      sx={{ mt: 1 }}
                    >
                      Flat Limit: {flats.length} / {building.flat_limit}
                      {flatLimitReached && " — You cannot add more flats."}
                    </Alert>
                  )}
                </div>
              ) : (
                <Typography className="text-gray-600">
                  Building ID: {buildingId}
                </Typography>
              )}
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <button
                // onClick={() => setOpenDialog(true)}
                onClick={() => {
                  if (flatLimitReached) {
                    toast.warning(
                      `Your building flat limit (${building.flat_limit}) is over.`,
                    );
                    return;
                  }
                  setOpenDialog(true);
                }}
                disabled={flatLimitReached}
                className="
                                    group
                                    bg-white
                                    font-roboto
                                    font-medium
                                    px-8
                                    py-3.5
                                    text-primary
                                    text-sm
                                    rounded-xl
                                    border-2
                                    border-primary
                                    hover:bg-primary
                                    hover:text-white
                                    transition-all
                                    duration-300
                                    relative
                                    overflow-hidden
                                    flex
                                    items-center
                                    gap-3
                                    shadow-sm
                                    hover:shadow-md
                                  "
              >
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-primary group-hover:bg-white"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />

                <svg
                  className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="tracking-wide">New Flat/Office/Shop</span>

                <div
                  className="
                                      absolute
                                      inset-0
                                      bg-primary
                                      transform
                                      -translate-x-full
                                      group-hover:translate-x-0
                                      transition-transform
                                      duration-300
                                      -z-10
                                    "
                />
              </button>
            </motion.div>
          </div>
        </div>
        {/* Search & Filter */}
        <Card
          className="rounded-lg border shadow-sm mb-6"
          style={{ borderColor: theme.border }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Typography
                variant="h6"
                className="font-semibold"
                style={{ color: theme.textPrimary }}
              >
                Showing {filteredFlats.length} of {flats.length} flats
              </Typography>
              <TextField
                placeholder="Search flats by number, BHK, or floor..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full md:w-64"
                InputProps={{
                  startAdornment: (
                    <Search
                      className="mr-2"
                      style={{ color: theme.textSecondary }}
                    />
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root:hover fieldset": {
                    borderColor: theme.primaryLight,
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: theme.primary,
                    borderWidth: 2,
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Flats Table */}
        <Card
          className="rounded-lg border shadow-sm overflow-hidden"
          style={{ borderColor: theme.border }}
        >
          {loading ? (
            <Box className="flex justify-center p-12">
              <CircularProgress style={{ color: theme.primary }} />
            </Box>
          ) : filteredFlats.length === 0 ? (
            <Alert
              severity="info"
              sx={{ m: 3 }}
              style={{ backgroundColor: `${theme.info}10`, color: theme.info }}
            >
              {searchTerm
                ? "No flats found matching your search."
                : "No flats found for this building. Add your first flat!"}
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead style={{ backgroundColor: theme.background }}>
                    <TableRow>
                      <TableCell width="50"></TableCell>

                      <TableCell style={{ fontWeight: 600 }}>ID</TableCell>

                      <TableCell style={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={sortConfig.key === "flat_number"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("flat_number")}
                        >
                          Flat No
                        </TableSortLabel>
                      </TableCell>

                      <TableCell style={{ fontWeight: 600 }}>
                        <TableSortLabel
                          active={sortConfig.key === "floor_number"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("floor_number")}
                        >
                          Floor
                        </TableSortLabel>
                      </TableCell>

                      <TableCell style={{ fontWeight: 600 }}>
                        Created At
                      </TableCell>

                      <TableCell align="center" style={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedFlats.map((flat) => (
                      <React.Fragment key={flat.id}>
                        <TableRow
                          hover
                          style={{ cursor: "pointer" }}
                          onClick={() => toggleRowExpansion(flat.id)}
                        >
                          <TableCell>
                            <IconButton size="small">
                              {expandedRows[flat.id] ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                          </TableCell>

                          {/* ID */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {flat.id}
                            </Typography>
                          </TableCell>

                          {/* Flat Number */}
                          <TableCell>
                            <Typography className="font-semibold">
                              {flat.flat_number}
                            </Typography>
                          </TableCell>

                          {/* Floor */}
                          <TableCell>{flat.floor_number ?? "-"}</TableCell>

                          {/* Created At */}
                          <TableCell>
                            {new Date(flat.created_at).toLocaleDateString()}
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <div className="flex items-center justify-center gap-1">
                              {/* USER ACTION */}
                              <IconButton
                                size="small"
                                title="Add Owner"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFlat(flat);
                                  setOpenAddOwner(true);
                                }}
                              >
                                <PersonAdd sx={{ color: "#6F0B14" }} />
                              </IconButton>

                              <IconButton
                                size="small"
                                title="View Members"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFlat(flat);
                                  fetchFlatMembers(flat);
                                }}
                              >
                                <FaEye sx={{ color: "#6F0B14" }} />
                              </IconButton>

                              {/* EDIT */}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // setSelectedDeviceId(flat.device_id || "");
                                  setSelectedFlat(flat);
                                  setOpenDialog(true);
                                }}
                                title="Edit Flat"
                              >
                                <Edit
                                  fontSize="small"
                                  style={{ color: theme.primary }}
                                />
                              </IconButton>

                              {/* DELETE */}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFlat(flat.id);
                                }}
                              >
                                <Delete
                                  fontSize="small"
                                  style={{ color: theme.error }}
                                />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={7}
                          >
                            <Collapse
                              in={expandedRows[flat.id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box
                                sx={{
                                  margin: 2,
                                  padding: 2,
                                  backgroundColor: `${theme.background}80`,
                                  borderRadius: 1,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  gutterBottom
                                  className="font-semibold"
                                  style={{ color: theme.textPrimary }}
                                >
                                  Flat Details
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Typography
                                      variant="body2"
                                      className="font-medium"
                                      style={{ color: theme.textSecondary }}
                                    >
                                      Created At
                                    </Typography>
                                    <Typography variant="body1">
                                      {new Date(
                                        flat.created_at,
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography
                                      variant="body2"
                                      className="font-medium"
                                      style={{ color: theme.textSecondary }}
                                    >
                                      Last Updated
                                    </Typography>
                                    <Typography variant="body1">
                                      {new Date(
                                        flat.updated_at,
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </div>
                                  <div>
                                    <Typography
                                      variant="body2"
                                      className="font-medium"
                                      style={{ color: theme.textSecondary }}
                                    >
                                      Status
                                    </Typography>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Chip
                                        label={
                                          flat.is_active ? "Active" : "Inactive"
                                        }
                                        size="small"
                                        style={{
                                          backgroundColor: flat.is_active
                                            ? `${theme.success}15`
                                            : `${theme.error}15`,
                                          color: flat.is_active
                                            ? theme.success
                                            : theme.error,
                                        }}
                                      />
                                    </Box>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Typography
                                    variant="body2"
                                    className="font-medium mb-2"
                                    style={{ color: theme.textSecondary }}
                                  >
                                    Quick Actions
                                  </Typography>
                                  <div className="flex gap-2">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => {
                                        setSelectedFlat(flat);
                                        fetchFlatMembers(flat);
                                      }}
                                      style={{
                                        borderColor: theme.primary,
                                        color: theme.primary,
                                      }}
                                    >
                                      View Residents
                                    </Button>
                                  </div>
                                </div>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.border}` }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredFlats.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  style={{ color: theme.textPrimary }}
                />
              </Box>
            </>
          )}
        </Card>
      </motion.div>
      <AddFlatDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setSelectedFlat(null);
          fetchFlats();
        }}
        building={building}
        societyId={societyId}
        flat={selectedFlat}
      />
      <FlatMembersDialog
        open={openMembersDialog}
        onClose={() => setOpenMembersDialog(false)}
        members={flatMembers}
        loading={loadingMembers}
        fetchMembers={() => fetchFlatMembers(selectedFlat)}
      />

      {openAddOwner && selectedFlat && (
        <AddOwnerDialog
          open={openAddOwner}
          flat={selectedFlat}
          onClose={() => {
            setOpenAddOwner(false);
            setSelectedFlat(null);
          }}
        />
      )}
    </div>
  );
}
