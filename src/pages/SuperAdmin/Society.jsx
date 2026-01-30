import React, { useState, useCallback, useEffect } from "react";
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
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
  Collapse,
  Box,
  Alert,
  CircularProgress,
  TablePagination,
  FormControlLabel,
  Switch,
  styled,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Delete,
  Search,
  FilterList,
  Refresh,
  LocationOn,
  Business,
  PinDrop,
  Public,
  Map,
  Person,
  Phone,
  Email,
  CalendarToday,
  Apartment,
  Home,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import AddSocietyDialog from "../../components/dialogs/AddSocietyDialog";

const PrimarySwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#6F0B14",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#6F0B14",
  },
  "& .MuiSwitch-switchBase.Mui-checked:hover": {
    backgroundColor: "rgba(111, 11, 20, 0.08)",
  },
}));

const statusColors = {
  active: "#008000",
  inactive: "#B31B1B",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
};

const SocietyRow = ({
  society,
  onEdit,
  onDelete,
  onStatusToggle,
  isExpanded,
  onToggleRow,
}) => {
  const currentStatus = society.is_active ? "active" : "inactive";
  const isRowDisabled = !society.is_active;

  return (
    <React.Fragment>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          opacity: isRowDisabled ? 0.6 : 1,
          backgroundColor: isRowDisabled ? "rgba(0,0,0,0.02)" : "inherit",
          "&:hover": {
            backgroundColor: isRowDisabled
              ? "rgba(0,0,0,0.04)"
              : "rgba(111, 11, 20, 0.04)",
          },
          transition: "all 0.2s ease",
        }}
      >
        <TableCell className="p-4">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => onToggleRow(society.id)}
            disabled={isRowDisabled}
            className="text-primary hover:bg-lightBackground"
            sx={{
              "&:hover": { backgroundColor: "rgba(111, 11, 20, 0.1)" },
            }}
          >
            {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        <TableCell className="p-4">
          <Typography className="font-roboto font-semibold text-sm text-gray-800">
            {society.id}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="font-roboto font-semibold"
              sx={{
                bgcolor: isRowDisabled ? "#9ca3af" : "#6F0B14",
                color: "white",
                width: 40,
                height: 40,
                fontSize: "0.875rem",
              }}
            >
              {society.name?.substring(0, 2).toUpperCase() || "SO"}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold text-sm"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {society.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                {society.city}, {society.state}
              </Typography>
            </div>
          </div>
        </TableCell>

        <TableCell className="p-4">
          <Typography
            className="font-roboto text-sm break-all max-w-[200px]"
            sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
          >
            {society.address}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <Typography className="font-roboto text-sm">
            {society.city}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <Typography className="font-roboto text-sm">
            {society.state}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <Typography className="font-roboto text-sm">
            {society.country}
          </Typography>
        </TableCell>
        <TableCell className="p-4" align="center">
          <Chip
            label={society.is_card_facility ? "Yes" : "No"}
            size="small"
            sx={{
              backgroundColor: society.is_card_facility
                ? "rgba(34,197,94,0.15)"
                : "rgba(239,68,68,0.15)",
              color: society.is_card_facility ? "#15803D" : "#B91C1C",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        </TableCell>

        <TableCell className="p-4">
          <Chip
            label={society.pincode}
            className="font-roboto font-medium"
            sx={{
              backgroundColor: isRowDisabled
                ? "rgba(156, 163, 175, 0.1)"
                : "rgba(111, 11, 20, 0.09)",
              color: isRowDisabled ? "#9ca3af" : "#6F0B14",
              opacity: isRowDisabled ? 0.7 : 1,
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          />
        </TableCell>

        <TableCell className="p-4" align="center">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: statusColors[currentStatus] + "15",
              border: `1px solid ${statusColors[currentStatus]}30`,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors[currentStatus],
                mr: 1,
              }}
            />
            <Typography
              className="font-roboto font-medium text-xs"
              sx={{ color: statusColors[currentStatus] }}
            >
              {statusLabels[currentStatus]}
            </Typography>
          </Box>
        </TableCell>

        <TableCell className="p-4" align="center">
          <div className="flex items-center justify-center gap-1">
            {/* Assign / Change Manager */}
            {society.loading ? (
              <CircularProgress size={18} />
            ) : (
              <FormControlLabel
                control={
                  <PrimarySwitch
                    checked={society.is_active}
                    onChange={(e) =>
                      onStatusToggle(society.id, society.is_active)
                    }
                    size="small"
                  />
                }
                sx={{ m: 0 }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => onEdit(society)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(society.id)}
              disabled={isRowDisabled}
              className="text-reject hover:bg-[rgba(179,27,27,0.09)]"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 3 }}>
              {society.loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <Typography
                      variant="h6"
                      className="font-roboto font-semibold text-primary"
                    >
                      Society Details
                    </Typography>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        bgcolor: statusColors[currentStatus] + "20",
                        color: statusColors[currentStatus],
                        border: `1px solid ${statusColors[currentStatus]}40`,
                      }}
                    >
                      {statusLabels[currentStatus]}
                    </Box>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Basic Information */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Society Information
                        </Typography>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="font-roboto font-semibold"
                              sx={{
                                bgcolor: "#6F0B14",
                                color: "white",
                                width: 48,
                                height: 48,
                              }}
                            >
                              {society.name?.substring(0, 2).toUpperCase() ||
                                "SO"}
                            </Avatar>
                            <div>
                              <Typography className="font-roboto font-semibold">
                                {society.name}
                              </Typography>
                              <Typography className="font-roboto text-sm text-hintText">
                                ID: #{society.id.toString().padStart(3, "0")}
                              </Typography>
                            </div>
                          </div>
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-start gap-2">
                              <LocationOn
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Full Address
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {society.address}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Map
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Location
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {society.city}, {society.state},{" "}
                                  {society.country} - {society.pincode}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Contact Information
                        </Typography>
                        <div className="space-y-3">
                          {society.contact_person && (
                            <div className="p-3 bg-lightBackground rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText mb-1">
                                Contact Person
                              </Typography>
                              <Typography className="font-roboto font-semibold flex items-center gap-2">
                                <Person fontSize="small" />
                                {society.contact_person}
                              </Typography>
                            </div>
                          )}

                          {society.contact_phone && (
                            <div className="p-3 bg-lightBackground rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText mb-1">
                                Phone Number
                              </Typography>
                              <Typography className="font-roboto font-semibold flex items-center gap-2">
                                <Phone fontSize="small" />
                                {society.contact_phone}
                              </Typography>
                            </div>
                          )}

                          {society.contact_email && (
                            <div className="p-3 bg-lightBackground rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText mb-1">
                                Email Address
                              </Typography>
                              <Typography className="font-roboto font-semibold flex items-center gap-2">
                                <Email fontSize="small" />
                                {society.contact_email}
                              </Typography>
                            </div>
                          )}

                          {!society.contact_person &&
                            !society.contact_phone &&
                            !society.contact_email && (
                              <Typography className="font-roboto text-sm text-hintText italic">
                                No contact information available
                              </Typography>
                            )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Additional Information
                        </Typography>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Business
                                className="text-primary"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Total Buildings
                                </Typography>
                                <Typography className="font-roboto font-semibold">
                                  {society.building_count || 0}
                                </Typography>
                              </div>
                            </div>
                            <Apartment className="text-primary" />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Home className="text-primary" fontSize="small" />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Created Date
                                </Typography>
                                <Typography className="font-roboto font-semibold">
                                  {society.created_at
                                    ? new Date(
                                        society.created_at,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </Typography>
                              </div>
                            </div>
                            <CalendarToday className="text-primary" />
                          </div>

                          {society.description && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText mb-2">
                                Description
                              </Typography>
                              <Typography className="font-roboto text-sm">
                                {society.description}
                              </Typography>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

// Society Card Component for Mobile
const SocietyCard = ({ society, onEdit, onDelete, onStatusToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const currentStatus = society.is_active ? "active" : "inactive";
  const isRowDisabled = !society.is_active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-3"
      style={{ opacity: isRowDisabled ? 0.7 : 1 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              className="font-roboto font-semibold"
              sx={{
                bgcolor: isRowDisabled ? "#9ca3af" : "#6F0B14",
                color: "white",
                width: 48,
                height: 48,
              }}
            >
              {society.name?.substring(0, 2).toUpperCase() || "SO"}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {society.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                #{society.id.toString().padStart(3, "0")} • {society.city}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <PrimarySwitch
                  checked={society.is_active}
                  onChange={(e) =>
                    onStatusToggle(society.id, society.is_active)
                  }
                  size="small"
                />
              }
              sx={{ m: 0 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Pincode
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {society.pincode}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              State
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {society.state}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Country
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {society.country}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Status
            </Typography>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: statusColors[currentStatus] + "15",
                border: `1px solid ${statusColors[currentStatus]}30`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: statusColors[currentStatus],
                  mr: 1,
                }}
              />
              <Typography
                className="font-roboto font-medium text-xs"
                sx={{ color: statusColors[currentStatus] }}
              >
                {statusLabels[currentStatus]}
              </Typography>
            </Box>
          </div>
        </div>

        <Typography className="font-roboto text-xs text-hintText mb-2">
          Address
        </Typography>
        <Typography className="font-roboto text-sm mb-4">
          {society.address}
        </Typography>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <IconButton
              size="small"
              onClick={() => onEdit(society)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(society.id)}
              disabled={isRowDisabled}
              className="text-reject hover:bg-[rgba(179,27,27,0.09)]"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            className="font-roboto font-medium text-primary"
            endIcon={expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            sx={{ textTransform: "none" }}
          >
            {expanded ? "Show Less" : "View Details"}
          </Button>
        </div>
      </div>

      <Collapse in={expanded}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-gray-50 border-t border-gray-200"
        >
          <Typography className="font-roboto font-semibold text-primary mb-3">
            Additional Details
          </Typography>

          <div className="space-y-3">
            {society.contact_person && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Contact Person
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {society.contact_person}
                </Typography>
              </div>
            )}

            {society.contact_phone && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Contact Phone
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {society.contact_phone}
                </Typography>
              </div>
            )}

            {society.contact_email && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Contact Email
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {society.contact_email}
                </Typography>
              </div>
            )}

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <Typography className="font-roboto text-xs text-hintText mb-1">
                Buildings Count
              </Typography>
              <Typography className="font-roboto text-sm font-medium">
                {society.building_count || 0} buildings
              </Typography>
            </div>
          </div>
        </motion.div>
      </Collapse>
    </motion.div>
  );
};

// Main Society Component
export default function Society() {
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSocieties = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("societies")
        .select(
          `
            *,
            buildings (id)
            user:users ( id, name )
            `,
        )
        .eq("is_delete", false)
        .order("id", { ascending: false });

      if (error) throw error;

      const mapped = data.map((society) => ({
        ...society,
        building_count: society.buildings?.length || 0,
        manager_name: society.user?.name || null,
        loading: false,
      }));

      setSocieties(mapped);
      setFilteredSocieties(mapped);
    } catch (error) {
      console.error("Error fetching societies:", error);
      toast.error("Failed to fetch societies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  useEffect(() => {
    let filtered = societies;

    if (searchTerm) {
      filtered = filtered.filter(
        (society) =>
          society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          society.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          society.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          society.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          society.pincode.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (society) =>
          (society.is_active ? "active" : "inactive") === statusFilter,
      );
    }

    setFilteredSocieties(filtered);
    setPage(0);
  }, [societies, searchTerm, statusFilter]);

  // const handleStatusToggle = useCallback(async (societyId, currentStatus) => {
  //   const newStatus = !currentStatus;

  //   setSocieties((prev) =>
  //     prev.map((s) => (s.id === societyId ? { ...s, is_active: newStatus } : s))
  //   );

  //   const { error } = await supabase
  //     .from("societies")
  //     .update({ is_active: newStatus })
  //     .eq("id", societyId);

  //   if (error) {
  //     toast.error("Failed to update status");

  //     setSocieties((prev) =>
  //       prev.map((s) =>
  //         s.id === societyId ? { ...s, is_active: currentStatus } : s
  //       )
  //     );
  //   } else {
  //     toast.success(`Society ${newStatus ? "activated" : "deactivated"}`);
  //   }
  // }, []);
  const handleStatusToggle = useCallback(async (societyId, currentStatus) => {
    const newStatus = !currentStatus;

    setSocieties((prev) =>
      prev.map((s) => (s.id === societyId ? { ...s, loading: true } : s)),
    );

    const { error } = await supabase
      .from("societies")
      .update({ is_active: newStatus })
      .eq("id", societyId);

    if (error) {
      toast.error("Failed to update status");

      setSocieties((prev) =>
        prev.map((s) =>
          s.id === societyId
            ? { ...s, is_active: currentStatus, loading: false }
            : s,
        ),
      );
    } else {
      toast.success(`Society ${newStatus ? "activated" : "deactivated"}`);

      setSocieties((prev) =>
        prev.map((s) =>
          s.id === societyId
            ? { ...s, is_active: newStatus, loading: false }
            : s,
        ),
      );
    }
  }, []);

  const handleToggleRow = useCallback(
    (societyId) => {
      const isCurrentlyOpen = openRows[societyId];

      if (isCurrentlyOpen) {
        setOpenRows((prev) => ({ ...prev, [societyId]: false }));
      } else {
        setOpenRows((prev) => ({ ...prev, [societyId]: true }));

        setSocieties((prev) =>
          prev.map((society) =>
            society.id === societyId ? { ...society, loading: true } : society,
          ),
        );

        setTimeout(() => {
          setSocieties((prev) =>
            prev.map((society) =>
              society.id === societyId
                ? { ...society, loading: false }
                : society,
            ),
          );
        }, 500);
      }
    },
    [openRows],
  );

  const handleEditSociety = (society) => {
    setSelectedSociety(society);
    setOpenDialog(true);
  };

  const handleDeleteSociety = async (id) => {
    if (!window.confirm("Are you sure you want to delete this society?"))
      return;

    try {
      const { error } = await supabase
        .from("societies")
        .update({ is_delete: true })
        .eq("id", id);

      if (error) throw error;

      // UI se remove
      setSocieties((prev) => prev.filter((s) => s.id !== id));

      toast.success("Society deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete society");
    }
  };

  const handleAddNewSociety = () => {
    setSelectedSociety(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSociety(null);
    fetchSocieties();
  };

  const handleSubmitSociety = () => {
    fetchSocieties();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const paginatedSocieties = filteredSocieties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const headers = [
    "",
    "ID",
    "Name",
    "Address",
    "City",
    "State",
    "Country",
    "Card Facility",
    "Pincode",
    "Status",
    "Actions",
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 font-roboto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Typography
                variant="h4"
                className="font-roboto font-bold text-primary mb-2"
              >
                Societies Management
              </Typography>
              <Typography className="font-roboto text-gray-600">
                Manage and monitor all housing societies
              </Typography>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="inline-block"
            >
              <button
                onClick={handleAddNewSociety}
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
                {/* Underline animation */}
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
                <span className="tracking-wide">New Society</span>

                {/* Hover fill effect */}
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

        {/* Filters and Search Section */}
        <Card className="rounded-xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Typography variant="h6" className="font-roboto font-semibold">
                All Societies ({filteredSocieties.length})
              </Typography>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <TextField
                  placeholder="Search societies..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search className="text-hintText" />
                      </InputAdornment>
                    ),
                    className: "font-roboto rounded-lg",
                  }}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={handleFilterClick}
                    className="font-roboto font-medium border-gray-300 text-gray-700"
                    sx={{ textTransform: "none" }}
                  >
                    Filter
                  </Button>

                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={resetFilters}
                      className="font-roboto font-medium border-gray-300 text-gray-700"
                      sx={{ textTransform: "none" }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-4 flex flex-wrap gap-2">
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => setSearchTerm("")}
                    size="small"
                    className="font-roboto"
                  />
                )}
                {statusFilter !== "all" && (
                  <Chip
                    label={`Status: ${statusLabels[statusFilter]}`}
                    onDelete={() => setStatusFilter("all")}
                    size="small"
                    className="font-roboto"
                    sx={{
                      backgroundColor: statusColors[statusFilter] + "20",
                      color: statusColors[statusFilter],
                    }}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Societies Table/Cards */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredSocieties.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No societies found. Add your first society!
            </Alert>
          ) : (
            <>
              {!isMobile ? (
                // Desktop Table View
                <TableContainer>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                      <TableRow>
                        {headers.map((header, index) => (
                          <TableCell
                            key={index}
                            sx={{
                              color: "#1E293B",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: "2px solid #E2E8F0",
                              fontSize: "0.75rem",
                              py: 2,
                            }}
                            align={
                              header === "Status" ||
                              header === "Actions" ||
                              header === "Pincode"
                                ? "center"
                                : "left"
                            }
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSocieties.map((society) => (
                        <SocietyRow
                          key={society.id}
                          society={society}
                          onEdit={handleEditSociety}
                          onDelete={handleDeleteSociety}
                          onStatusToggle={handleStatusToggle}
                          onToggleRow={handleToggleRow}
                          isExpanded={!!openRows[society.id]}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="p-4">
                  <AnimatePresence>
                    {paginatedSocieties.map((society) => (
                      <SocietyCard
                        key={society.id}
                        society={society}
                        onEdit={handleEditSociety}
                        onDelete={handleDeleteSociety}
                        onStatusToggle={handleStatusToggle}
                        onAssign={handleAssignSociety}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <Typography className="font-roboto text-sm text-hintText">
                  Showing{" "}
                  {Math.min(page * rowsPerPage + 1, filteredSocieties.length)}{" "}
                  to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredSocieties.length)}{" "}
                  of {filteredSocieties.length} societies
                </Typography>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredSocieties.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Rows:"
                  className="font-roboto"
                />
              </Box>
            </>
          )}
        </Card>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem
            onClick={() => handleStatusFilter("all")}
            className="font-roboto"
          >
            All Status
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusFilter("active")}
            className="font-roboto"
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors.active,
                mr: 2,
              }}
            />
            Active Only
          </MenuItem>
          <MenuItem
            onClick={() => handleStatusFilter("inactive")}
            className="font-roboto"
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors.inactive,
                mr: 2,
              }}
            />
            Inactive Only
          </MenuItem>
        </Menu>

        {/* Add/Edit Society Dialog */}
        <AddSocietyDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitSociety}
          society={selectedSociety}
          isEdit={!!selectedSociety}
        />
      </motion.div>
    </div>
  );
}
