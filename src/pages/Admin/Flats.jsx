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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Grid,
} from "@mui/material";
import { supabase } from "../../api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaSync,
  FaPlus,
  FaHome,
  FaBuilding,
  FaRulerCombined,
  FaUsers,
  FaMapMarkerAlt,
  FaDoorClosed,
  FaLayerGroup,
  FaBed,
  FaBath,
  FaChartPie,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import {
  MdMeetingRoom,
  MdKingBed,
  MdSingleBed,
  MdElevator,
  MdFoundation,
  MdBusiness,
  MdDomain,
} from "react-icons/md";

// Custom styled switch for flats
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

// Status colors and labels
const statusColors = {
  vacant: "#93BD57",
  occupied: "#F96E5B",
  under_maintenance: "#DBA400",
  reserved: "#6F0B14",
};

const statusLabels = {
  vacant: "Vacant",
  occupied: "Occupied",
  under_maintenance: "Under Maintenance",
  reserved: "Reserved",
};

// BHK type labels
const bhkLabels = {
  1: "1 BHK",
  2: "2 BHK",
  3: "3 BHK",
  4: "4 BHK",
  5: "5 BHK",
  6: "6 BHK",
};

// Component for expandable row
const FlatRow = ({ flat, onEdit, onDelete, isExpanded, onToggleRow }) => {
  const isRowDisabled = flat.occupancy_status === "under_maintenance";

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
            onClick={() => onToggleRow(flat.id)}
            disabled={isRowDisabled}
            className="text-primary hover:bg-lightBackground"
            sx={{
              "&:hover": { backgroundColor: "rgba(111, 11, 20, 0.1)" },
            }}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </IconButton>
        </TableCell>

        <TableCell className="p-4">
          <Typography className="font-roboto font-semibold text-sm text-gray-800">
            #{flat.id.toString().padStart(3, "0")}
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
              {flat.flat_number}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold text-sm"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                Flat {flat.flat_number}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                Floor {flat.floor_number}
              </Typography>
            </div>
          </div>
        </TableCell>

        <TableCell className="p-4" align="center">
          <Chip
            label={bhkLabels[flat.bhk_type] || `${flat.bhk_type} BHK`}
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
          <Typography
            className="font-roboto font-semibold text-sm"
            sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
          >
            {flat.area_sqft} sqft
          </Typography>
        </TableCell>

        <TableCell className="p-4" align="center">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: statusColors[flat.occupancy_status] + "15",
              border: `1px solid ${statusColors[flat.occupancy_status]}30`,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColors[flat.occupancy_status],
                mr: 1,
              }}
            />
            <Typography
              className="font-roboto font-medium text-xs"
              sx={{ color: statusColors[flat.occupancy_status] }}
            >
              {statusLabels[flat.occupancy_status]}
            </Typography>
          </Box>
        </TableCell>

        <TableCell className="p-4" align="center">
          <div className="flex items-center justify-center gap-1">
            <IconButton
              size="small"
              onClick={() => onEdit(flat)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <FaEdit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(flat.id)}
              disabled={isRowDisabled}
              className="text-reject hover:bg-[rgba(179,27,27,0.09)]"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <FaTrash fontSize="small" />
            </IconButton>
          </div>
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 3 }}>
              <div className="flex items-center justify-between mb-6">
                <Typography
                  variant="h6"
                  className="font-roboto font-semibold text-primary"
                >
                  Flat Details - {flat.flat_number}
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    bgcolor: statusColors[flat.occupancy_status] + "20",
                    color: statusColors[flat.occupancy_status],
                    border: `1px solid ${
                      statusColors[flat.occupancy_status]
                    }40`,
                  }}
                >
                  {statusLabels[flat.occupancy_status]}
                </Box>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Basic Information */}
                <Card className="rounded-xl border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <Typography
                      className="font-roboto font-semibold text-primary mb-4"
                      variant="subtitle1"
                    >
                      Flat Information
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
                            fontSize: "1rem",
                          }}
                        >
                          {flat.flat_number}
                        </Avatar>
                        <div>
                          <Typography className="font-roboto font-semibold">
                            Flat {flat.flat_number}
                          </Typography>
                          <Typography className="font-roboto text-sm text-hintText">
                            Floor {flat.floor_number} •{" "}
                            {bhkLabels[flat.bhk_type]}
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-2 pt-3 border-t border-gray-100">
                        <div className="flex items-start gap-2">
                          <FaHome className="text-primary mt-0.5" size={14} />
                          <div>
                            <Typography className="font-roboto text-xs text-hintText">
                              Flat Number
                            </Typography>
                            <Typography className="font-roboto text-sm">
                              {flat.flat_number}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaLayerGroup
                            className="text-primary mt-0.5"
                            size={14}
                          />
                          <div>
                            <Typography className="font-roboto text-xs text-hintText">
                              Floor
                            </Typography>
                            <Typography className="font-roboto text-sm">
                              {flat.floor_number}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MdMeetingRoom
                            className="text-primary mt-0.5"
                            size={14}
                          />
                          <div>
                            <Typography className="font-roboto text-xs text-hintText">
                              BHK Type
                            </Typography>
                            <Typography className="font-roboto text-sm">
                              {bhkLabels[flat.bhk_type]}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FaRulerCombined
                            className="text-primary mt-0.5"
                            size={14}
                          />
                          <div>
                            <Typography className="font-roboto text-xs text-hintText">
                              Area
                            </Typography>
                            <Typography className="font-roboto text-sm">
                              {flat.area_sqft} sqft
                            </Typography>
                          </div>
                        </div>
                      </div>
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
                      Additional Details
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaUsers className="text-primary" size={14} />
                          <div>
                            <Typography className="font-roboto text-xs text-hintText">
                              Occupancy Status
                            </Typography>
                            <Typography className="font-roboto text-sm font-medium">
                              {statusLabels[flat.occupancy_status]}
                            </Typography>
                          </div>
                        </div>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor:
                              statusColors[flat.occupancy_status],
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FaBed className="text-primary" size={14} />
                            <Typography className="font-roboto text-xs text-hintText">
                              Bedrooms
                            </Typography>
                          </div>
                          <Typography className="font-roboto text-sm font-medium">
                            {flat.bhk_type}
                          </Typography>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FaBath className="text-primary" size={14} />
                            <Typography className="font-roboto text-xs text-hintText">
                              Bathrooms
                            </Typography>
                          </div>
                          <Typography className="font-roboto text-sm font-medium">
                            {flat.bhk_type <= 2
                              ? 1
                              : Math.ceil(flat.bhk_type / 2)}
                          </Typography>
                        </div>
                      </div>

                      {flat.description && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Typography className="font-roboto text-xs text-hintText mb-1">
                            Description
                          </Typography>
                          <Typography className="font-roboto text-sm">
                            {flat.description}
                          </Typography>
                        </div>
                      )}

                      {flat.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Typography className="font-roboto text-xs text-hintText mb-1">
                            Notes
                          </Typography>
                          <Typography className="font-roboto text-sm">
                            {flat.notes}
                          </Typography>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

// Mobile View Card Component
const FlatCard = ({ flat, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isRowDisabled = flat.occupancy_status === "under_maintenance";

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
              {flat.flat_number}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                Flat {flat.flat_number}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                Floor {flat.floor_number} • {bhkLabels[flat.bhk_type]}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              size="small"
              onClick={() => onEdit(flat)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <FaEdit size={14} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(flat.id)}
              disabled={isRowDisabled}
              className="text-reject hover:bg-[rgba(179,27,27,0.09)]"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <FaTrash size={14} />
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Area
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {flat.area_sqft} sqft
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              BHK Type
            </Typography>
            <Chip
              label={bhkLabels[flat.bhk_type]}
              size="small"
              className="font-roboto font-medium"
              sx={{
                backgroundColor: "rgba(111, 11, 20, 0.09)",
                color: "#6F0B14",
              }}
            />
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
                backgroundColor: statusColors[flat.occupancy_status] + "15",
                border: `1px solid ${statusColors[flat.occupancy_status]}30`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: statusColors[flat.occupancy_status],
                  mr: 1,
                }}
              />
              <Typography
                className="font-roboto font-medium text-xs"
                sx={{ color: statusColors[flat.occupancy_status] }}
              >
                {statusLabels[flat.occupancy_status]}
              </Typography>
            </Box>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              ID
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              #{flat.id.toString().padStart(3, "0")}
            </Typography>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {/* Additional action buttons if needed */}
          </div>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            className="font-roboto font-medium text-primary"
            endIcon={expanded ? <FaChevronUp /> : <FaChevronDown />}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Bathrooms
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {flat.bhk_type <= 2 ? 1 : Math.ceil(flat.bhk_type / 2)}
                </Typography>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Created
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {flat.created_at
                    ? new Date(flat.created_at).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </div>
            </div>

            {flat.description && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Description
                </Typography>
                <Typography className="font-roboto text-sm">
                  {flat.description}
                </Typography>
              </div>
            )}

            {flat.notes && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Notes
                </Typography>
                <Typography className="font-roboto text-sm">
                  {flat.notes}
                </Typography>
              </div>
            )}
          </div>
        </motion.div>
      </Collapse>
    </motion.div>
  );
};

const AddEditFlatDialog = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit,
}) => {
  const [formData, setFormData] = useState({
    flat_number: "",
    floor_number: 1,
    bhk_type: 1,
    area_sqft: "",
    occupancy_status: "vacant",
    description: "",
    notes: "",
    ...initialData,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "floor_number" || name === "bhk_type" || name === "area_sqft"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.flat_number || !formData.area_sqft) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting flat:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-roboto font-bold text-primary">
        {isEdit ? "Edit Flat" : "Add New Flat"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Flat Number *"
              name="flat_number"
              value={formData.flat_number}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Floor Number *"
              name="floor_number"
              type="number"
              value={formData.floor_number}
              onChange={handleChange}
              variant="outlined"
              size="small"
              inputProps={{ min: 1, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>BHK Type *</InputLabel>
              <Select
                name="bhk_type"
                value={formData.bhk_type}
                onChange={handleChange}
                label="BHK Type"
              >
                {[1, 2, 3, 4, 5, 6].map((bhk) => (
                  <SelectMenuItem key={bhk} value={bhk}>
                    {bhkLabels[bhk]}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Area (sqft) *"
              name="area_sqft"
              type="number"
              value={formData.area_sqft}
              onChange={handleChange}
              variant="outlined"
              size="small"
              inputProps={{ min: 100 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Occupancy Status *</InputLabel>
              <Select
                name="occupancy_status"
                value={formData.occupancy_status}
                onChange={handleChange}
                label="Occupancy Status"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectMenuItem key={value} value={value}>
                    {label}
                  </SelectMenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          className="font-roboto"
          startIcon={<FaTimes />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          className="font-roboto bg-primary hover:bg-[#5a090f]"
          disabled={loading}
          startIcon={isEdit ? <FaEdit /> : <FaPlus />}
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Flats Component
export default function Flats() {
  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [buildingInfo, setBuildingInfo] = useState(null);
  const [societyId, setSocietyId] = useState(null);
  const [buildingId, setBuildingId] = useState(null);

  // Get building ID from URL parameters
  useEffect(() => {
    const getBuildingInfoFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const buildingIdParam = params.get("building_id");

      if (buildingIdParam) {
        setBuildingId(buildingIdParam);

        // You might also want to fetch building details here
        fetchBuildingDetails(buildingIdParam);
      } else {
        toast.error("No building specified. Redirecting...");
        // Redirect to buildings page if no building ID
        setTimeout(() => {
          window.location.href = "/admin/buildings";
        }, 2000);
      }
    };

    getBuildingInfoFromURL();
  }, []);

  // Get society ID from localStorage
  useEffect(() => {
    const getSocietyId = () => {
      const storedSocietyId = localStorage.getItem("societyId");
      if (storedSocietyId) {
        setSocietyId(storedSocietyId);
      }
    };

    getSocietyId();
  }, []);

  // Fetch building details
  const fetchBuildingDetails = async (id) => {
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, society_id")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setBuildingInfo(data);
        // Also fetch society info for display
        const { data: societyData } = await supabase
          .from("societies")
          .select("name")
          .eq("id", data.society_id)
          .single();

        setBuildingInfo((prev) => ({
          ...prev,
          society_name: societyData?.name,
        }));
      }
    } catch (error) {
      console.error("Error fetching building details:", error);
      toast.error("Failed to fetch building details");
    }
  };

  // Fetch flats for the building
  const fetchFlats = useCallback(async () => {
    if (!societyId || !buildingId) {
      toast.error("Missing society or building information");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("flats")
        .select(
          `
          id,
          flat_number,
          floor_number,
          bhk_type,
          area_sqft,
          occupancy_status,
          description,
          notes,
          created_at,
          buildings (
            id,
            name
          )
        `
        )
        .eq("society_id", societyId)
        .eq("building_id", buildingId)
        .eq("is_delete", false)
        .order("floor_number", { ascending: true })
        .order("flat_number", { ascending: true });

      if (error) throw error;

      const transformedFlats = data.map((flat) => ({
        id: flat.id,
        flat_number: flat.flat_number,
        floor_number: flat.floor_number,
        bhk_type: flat.bhk_type,
        area_sqft: flat.area_sqft,
        occupancy_status: flat.occupancy_status,
        description: flat.description || "",
        notes: flat.notes || "",
        created_at: flat.created_at,
        building_name: flat.buildings?.name || "",
      }));

      setFlats(transformedFlats);
      setFilteredFlats(transformedFlats);
    } catch (error) {
      console.error("Error fetching flats:", error);
      toast.error("Failed to fetch flats");
    } finally {
      setLoading(false);
    }
  }, [societyId, buildingId]);

  useEffect(() => {
    if (societyId && buildingId) {
      fetchFlats();
    }
  }, [fetchFlats, societyId, buildingId]);

  // Filter flats based on search and status
  useEffect(() => {
    let filtered = flats;

    if (searchTerm) {
      filtered = filtered.filter(
        (flat) =>
          flat.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          flat.id.toString().includes(searchTerm) ||
          flat.floor_number.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (flat) => flat.occupancy_status === statusFilter
      );
    }

    setFilteredFlats(filtered);
    setPage(0);
  }, [flats, searchTerm, statusFilter]);

  const handleToggleRow = useCallback((flatId) => {
    setOpenRows((prev) => ({
      ...prev,
      [flatId]: !prev[flatId],
    }));
  }, []);

  const handleEditFlat = (flat) => {
    setSelectedFlat(flat);
    setOpenDialog(true);
  };

  const handleDeleteFlat = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flat?")) return;

    try {
      const { error } = await supabase
        .from("flats")
        .update({ is_delete: true })
        .eq("id", id);

      if (error) throw error;

      toast.success("Flat deleted successfully");
      fetchFlats(); // Refresh the list
    } catch (error) {
      console.error("Error deleting flat:", error);
      toast.error("Failed to delete flat");
    }
  };

  const handleAddFlat = () => {
    setSelectedFlat(null);
    setOpenDialog(true);
  };

  const handleSubmitFlat = async (flatData) => {
    try {
      if (selectedFlat) {
        // Update existing flat
        const { error } = await supabase
          .from("flats")
          .update({
            ...flatData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedFlat.id);

        if (error) throw error;
        toast.success("Flat updated successfully");
      } else {
        // Add new flat
        const { error } = await supabase.from("flats").insert({
          ...flatData,
          society_id: societyId,
          building_id: buildingId,
          is_delete: false,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success("Flat added successfully");
      }

      fetchFlats(); // Refresh the list
    } catch (error) {
      console.error("Error saving flat:", error);
      toast.error(`Failed to ${selectedFlat ? "update" : "add"} flat`);
      throw error;
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFlat(null);
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

  const paginatedFlats = filteredFlats.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const headers = [
    "",
    "ID",
    "Flat Number",
    "BHK Type",
    "Area (sqft)",
    "Status",
    "Actions",
  ];

  // Calculate statistics
  const totalFlats = flats.length;
  const vacantFlats = flats.filter(
    (f) => f.occupancy_status === "vacant"
  ).length;
  const occupiedFlats = flats.filter(
    (f) => f.occupancy_status === "occupied"
  ).length;

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
                Flats Management
              </Typography>
              <Typography className="font-roboto text-gray-600">
                Manage flats for {buildingInfo?.name || "Building"}
              </Typography>
              {buildingInfo && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Chip
                    label={`Building: ${buildingInfo.name}`}
                    size="small"
                    className="font-roboto"
                    sx={{
                      backgroundColor: "rgba(111, 11, 20, 0.09)",
                      color: "#6F0B14",
                    }}
                    icon={<FaBuilding size={12} />}
                  />
                  {buildingInfo.society_name && (
                    <Chip
                      label={`Society: ${buildingInfo.society_name}`}
                      size="small"
                      className="font-roboto"
                      sx={{
                        backgroundColor: "rgba(147, 189, 87, 0.09)",
                        color: "#93BD57",
                      }}
                      icon={<MdDomain size={12} />}
                    />
                  )}
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Button
                variant="contained"
                onClick={handleAddFlat}
                startIcon={<FaPlus />}
                className="font-roboto font-semibold bg-primary hover:bg-[#5a090f] px-6 py-2.5 rounded-lg shadow-sm"
                sx={{ textTransform: "none" }}
              >
                Add New Flat
              </Button>
            </motion.div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className="font-roboto text-xs text-hintText mb-1">
                      Total Flats
                    </Typography>
                    <Typography className="font-roboto font-bold text-2xl text-primary">
                      {totalFlats}
                    </Typography>
                  </div>
                  <FaHome className="text-primary text-3xl" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className="font-roboto text-xs text-hintText mb-1">
                      Vacant Flats
                    </Typography>
                    <Typography className="font-roboto font-bold text-2xl text-[#93BD57]">
                      {vacantFlats}
                    </Typography>
                  </div>
                  <FaDoorClosed className="text-[#93BD57] text-3xl" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography className="font-roboto text-xs text-hintText mb-1">
                      Occupied Flats
                    </Typography>
                    <Typography className="font-roboto font-bold text-2xl text-[#F96E5B]">
                      {occupiedFlats}
                    </Typography>
                  </div>
                  <FaUsers className="text-[#F96E5B] text-3xl" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search Section */}
        <Card className="rounded-xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Typography variant="h6" className="font-roboto font-semibold">
                All Flats ({filteredFlats.length})
              </Typography>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <TextField
                  placeholder="Search flats..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaSearch className="text-hintText" />
                      </InputAdornment>
                    ),
                    className: "font-roboto rounded-lg",
                  }}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<FaFilter />}
                    onClick={handleFilterClick}
                    className="font-roboto font-medium border-gray-300 text-gray-700"
                    sx={{ textTransform: "none" }}
                  >
                    Filter
                  </Button>

                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outlined"
                      startIcon={<FaSync />}
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
                    deleteIcon={<FaTimes size={14} />}
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
                    deleteIcon={<FaTimes size={14} />}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flats Table/Cards */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : !societyId || !buildingId ? (
            <Alert severity="warning" sx={{ m: 3 }}>
              Missing society or building information. Please select a building.
            </Alert>
          ) : filteredFlats.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              {searchTerm || statusFilter !== "all"
                ? "No flats match your filters."
                : "No flats found in this building. Add your first flat!"}
            </Alert>
          ) : (
            <>
              {!isMobile ? (
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
                              header === "BHK Type" ||
                              header === "Area (sqft)" ||
                              header === "Status" ||
                              header === "Actions"
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
                      {paginatedFlats.map((flat) => (
                        <FlatRow
                          key={flat.id}
                          flat={flat}
                          onEdit={handleEditFlat}
                          onDelete={handleDeleteFlat}
                          onToggleRow={handleToggleRow}
                          isExpanded={!!openRows[flat.id]}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="p-4">
                  <AnimatePresence>
                    {paginatedFlats.map((flat) => (
                      <FlatCard
                        key={flat.id}
                        flat={flat}
                        onEdit={handleEditFlat}
                        onDelete={handleDeleteFlat}
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
                  {Math.min(page * rowsPerPage + 1, filteredFlats.length)} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredFlats.length)} of{" "}
                  {filteredFlats.length} flats
                </Typography>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredFlats.length}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaFilter size={12} />
              All Status
            </Box>
          </MenuItem>
          {Object.entries(statusLabels).map(([value, label]) => (
            <MenuItem
              key={value}
              onClick={() => handleStatusFilter(value)}
              className="font-roboto"
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: statusColors[value],
                  }}
                />
                {label}
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* Add/Edit Flat Dialog */}
        <AddEditFlatDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleSubmitFlat}
          initialData={selectedFlat}
          isEdit={!!selectedFlat}
        />
      </motion.div>
    </div>
  );
}
