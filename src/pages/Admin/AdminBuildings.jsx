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
import { MdPreview } from "react-icons/md";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Edit,
  Delete,
  Search,
  FilterList,
  Refresh,
  LocationOn,
  Bed,
  Business,
  Group,
  Apartment,
  Home,
  CheckCircle,
  Domain,
  MeetingRoom,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { BsFillHouseAddFill } from "react-icons/bs";
import { Tooltip } from "@mui/material";

import AddBuildingDialog from "../../components/dialogs/AddBuildingDialog";
import AddFlatDialog from "../../components/dialogs/AdminDialogs/AddFlat";

// Custom styled switch for buildings
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
  active: "#93BD57",
  inactive: "#F96E5B",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
};

const getBuildingTypeLabel = (type) => {
  const buildingTypes = {
    residential: "Residential",
    commercial: "Commercial",
    mixed: "Mixed Use",
    other: "Other",
  };
  return buildingTypes[type] || type;
};

// Helper function to get logged-in user
const getLoggedInUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error in getLoggedInUser:", error);
    return null;
  }
};

const BuildingRow = ({
  building,
  onEdit,
  onDelete,
  onAddFlat,
  onViewFlats,
  onStatusToggle,
  isExpanded,
  onToggleRow,
}) => {
  const currentStatus = building.status || "inactive";
  const isRowDisabled = currentStatus === "inactive";

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
            onClick={() => onToggleRow(building.id)}
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
            #{building.id}
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
              {building.avatar}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold text-sm"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {building.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                {getBuildingTypeLabel(building.building_type)}
              </Typography>
            </div>
          </div>
        </TableCell>

        <TableCell className="p-4">
          <Typography
            className="font-roboto text-sm break-all max-w-[200px]"
            sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
          >
            {building.address}
          </Typography>
        </TableCell>

        <TableCell className="p-4" align="center">
          <Chip
            label={`${building.flat_limit || 0} units`}
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
        <TableCell className="p-4">
          <Typography
            className="font-roboto text-sm"
            sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
          >
            {building.society_name || "Not assigned"}
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
            <Tooltip title="Add Flat" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onAddFlat(building.id)}
                  disabled={isRowDisabled}
                  className="text-primary hover:bg-lightBackground"
                  sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
                >
                  <BsFillHouseAddFill size={20} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="View Flats" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onViewFlats(building.id)}
                  disabled={isRowDisabled}
                >
                  <MdPreview size={22} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                currentStatus === "active"
                  ? "Deactivate Building"
                  : "Activate Building"
              }
              arrow
            >
              <span>
                <FormControlLabel
                  control={
                    <PrimarySwitch
                      checked={currentStatus === "active"}
                      onChange={() =>
                        onStatusToggle(building.id, currentStatus)
                      }
                      size="small"
                    />
                  }
                  sx={{ m: 0 }}
                />
              </span>
            </Tooltip>

            <Tooltip title="Edit Building" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onEdit(building.id)}
                  disabled={isRowDisabled}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Delete Building" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onDelete(building.id)}
                  disabled={isRowDisabled}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        </TableCell>
      </TableRow>

      {/* Collapsible Details Row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 3 }}>
              {building.loading ? (
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
                      Building Details
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
                          Property Information
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
                              {building.avatar}
                            </Avatar>
                            <div>
                              <Typography className="font-roboto font-semibold">
                                {building.name}
                              </Typography>
                              <Typography className="font-roboto text-sm text-hintText">
                                {getBuildingTypeLabel(building.building_type)} •
                                Register: {building.registerDate}
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
                                  Address
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {building.address}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Domain
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Society
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {building.society_name || "Not assigned"}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MeetingRoom
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Flat Limit
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {building.flat_limit || 0} units
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Business
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Property Manager
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {building.manager}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Unit & Occupancy Stats */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Unit Statistics
                        </Typography>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-lightBackground rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText mb-1">
                                Total Units
                              </Typography>
                              <Typography className="font-roboto font-semibold text-xl text-primary">
                                {building.flat_limit || 0}
                              </Typography>
                            </div>
                          </div>
                          <div className="p-3 bg-lightBackground rounded-lg">
                            <Typography className="font-roboto text-xs text-hintText mb-1">
                              Available Units
                            </Typography>
                            <Typography className="font-roboto font-semibold text-xl">
                              {building.flat_limit || 0}
                            </Typography>
                          </div>
                          <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-1">
                              <Typography className="font-roboto text-xs text-hintText">
                                Occupancy Progress
                              </Typography>
                              <Typography className="font-roboto text-xs font-medium">
                                {building.occupancy}%
                              </Typography>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div
                                style={{ width: `${building.occupancy}%` }}
                                className={`rounded-full ${
                                  building.occupancy > 70
                                    ? "bg-[#93BD57]"
                                    : building.occupancy > 40
                                    ? "bg-[#DBA400]"
                                    : "bg-[#F96E5B]"
                                }`}
                              />
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
                              <Bed className="text-primary" fontSize="small" />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Available Units
                                </Typography>
                                <Typography className="font-roboto font-semibold">
                                  {Math.floor(
                                    (building.units *
                                      (100 - building.occupancy)) /
                                      100
                                  )}
                                </Typography>
                              </div>
                            </div>
                            <CheckCircle className="text-[#93BD57]" />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Group
                                className="text-primary"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Residents
                                </Typography>
                                <Typography className="font-roboto font-semibold">
                                  {Math.floor(
                                    (building.units * building.occupancy) / 100
                                  )}
                                </Typography>
                              </div>
                            </div>
                            <Group className="text-primary" />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Apartment
                                className="text-primary"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Building Type
                                </Typography>
                                <Typography className="font-roboto font-semibold">
                                  {building.type}
                                </Typography>
                              </div>
                            </div>
                            <Home className="text-primary" />
                          </div>
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

const BuildingCard = ({
  building,
  onEdit,
  onDelete,
  onStatusToggle,
  onViewFlats,
}) => {
  const [expanded, setExpanded] = useState(false);
  const currentStatus = building.status || "inactive";
  const isRowDisabled = currentStatus === "inactive";

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
              {building.avatar}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {building.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                #{building.id.toString().padStart(3, "0")} • {building.type}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <PrimarySwitch
                  checked={currentStatus === "active"}
                  onChange={(e) => onStatusToggle(building.id, currentStatus)}
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
              Manager
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {building.manager}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Units
            </Typography>
            <Chip
              label={building.units}
              className="font-roboto font-medium"
              sx={{
                backgroundColor: "rgba(111, 11, 20, 0.09)",
                color: "#6F0B14",
              }}
              size="small"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Society
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {building.society_name || "Not assigned"}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Type
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {getBuildingTypeLabel(building.building_type)}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Occupancy
            </Typography>
            <Typography
              className="font-roboto text-sm font-medium"
              style={{
                color:
                  building.occupancy > 70
                    ? "#93BD57"
                    : building.occupancy > 40
                    ? "#DBA400"
                    : "#F96E5B",
              }}
            >
              {building.occupancy}%
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
          {building.address}
        </Typography>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <IconButton
              size="small"
              onClick={() => onViewFlats(building.id)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Apartment fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => onEdit(building.id)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(building.id)}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Register Date
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {building.registerDate}
                </Typography>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Available Units
                </Typography>
                <Typography className="font-roboto text-sm font-medium">
                  {Math.floor(
                    (building.units * (100 - building.occupancy)) / 100
                  )}
                </Typography>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <Typography className="font-roboto text-xs text-hintText mb-1">
                Occupancy Progress
              </Typography>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <Typography className="font-roboto text-xs font-medium">
                    {building.occupancy}% occupied
                  </Typography>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${building.occupancy}%` }}
                    className={`rounded-full ${
                      building.occupancy > 70
                        ? "bg-[#93BD57]"
                        : building.occupancy > 40
                        ? "bg-[#DBA400]"
                        : "bg-[#F96E5B]"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Collapse>
    </motion.div>
  );
};

export default function AdminBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const [societies, setSocieties] = useState([]);
  const [adminSocietyId, setAdminSocietyId] = useState(null);
  const [adminSocietyName, setAdminSocietyName] = useState("");
  const [openAddFlatDialog, setOpenAddFlatDialog] = useState(false);
  const [selectedBuildingForFlat, setSelectedBuildingForFlat] = useState(null);

  // Get admin's society ID
  const getAdminSocietyId = useCallback(async () => {
    try {
      // 1. First try to get societyId from localStorage
      const storedSocietyId = localStorage.getItem("societyId");

      if (storedSocietyId) {
        return storedSocietyId;
      }

      // 2. If not in localStorage, get user_id from localStorage profile
      const storedProfile = localStorage.getItem("profile");
      if (!storedProfile) {
        console.error("No profile found in localStorage");
        return null;
      }

      const profile = JSON.parse(storedProfile);
      const userId = profile.id;

      // 3. Fetch society from Supabase using user_id
      const { data: societyData, error } = await supabase
        .from("societies")
        .select("id, name")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching society:", error);
        toast.error("Unable to fetch society information");
        return null;
      }

      if (societyData) {
        // Store in localStorage for future use
        localStorage.setItem("societyId", societyData.id);
        localStorage.setItem("societyName", societyData.name);
        return societyData.id;
      }

      return null;
    } catch (error) {
      console.error("Error in getAdminSocietyId:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAdminData = async () => {
      const societyId = await getAdminSocietyId();

      if (societyId) {
        setAdminSocietyId(societyId);

        // Fetch society name
        const storedSocietyName = localStorage.getItem("societyName");
        if (storedSocietyName) {
          setAdminSocietyName(storedSocietyName);
        } else {
          // Fetch society details from Supabase
          const { data: societyData, error } = await supabase
            .from("societies")
            .select("name")
            .eq("id", societyId)
            .single();

          if (!error && societyData) {
            setAdminSocietyName(societyData.name);
            localStorage.setItem("societyName", societyData.name);
          }
        }

        // Fetch society list (only admin's society)
        const { data: societyList, error: societyError } = await supabase
          .from("societies")
          .select("id, name, city, state, country")
          .eq("id", societyId)
          .single();

        if (!societyError && societyList) {
          setSocieties([societyList]);
        }
      } else {
        toast.error(
          "No society assigned to your account. Please contact administrator."
        );
      }
    };

    initializeAdminData();
  }, [getAdminSocietyId]);

  const fetchBuildings = useCallback(async () => {
    setLoading(true);

    try {
      const societyId = await getAdminSocietyId();

      if (!societyId) {
        toast.error("No society assigned. Cannot fetch buildings.");
        setLoading(false);
        return;
      }

      // Fetch buildings ONLY from admin's society
      const { data, error } = await supabase
        .from("buildings")
        .select(
          `
          id,
          name,
          description,
          society_id,
          building_type,
          flat_limit,
          created_at,
          is_active,
          is_delete,
          societies (
            id,
            name
          )
        `
        )
        .eq("is_delete", false)
        .eq("society_id", societyId) // 🔥 CRITICAL: Filter by society_id
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching buildings:", error);
        toast.error("Failed to fetch buildings");
        setLoading(false);
        return;
      }

      const mapped = data.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description || "",
        society_id: b.society_id || "",
        society_name: b.societies?.name || "",
        building_type: b.building_type || "residential",
        flat_limit: b.flat_limit || 0,
        address: b.description || "—",
        registerDate: b.created_at
          ? new Date(b.created_at).toISOString().split("T")[0]
          : "—",
        status: b.is_active ? "active" : "inactive",
        units: b.flat_limit || 0,
        manager: "N/A",
        occupancy: 0,
        type: getBuildingTypeLabel(b.building_type),
        avatar:
          b.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "B",
        loading: false,
      }));

      setBuildings(mapped);
      setFilteredBuildings(mapped);
    } catch (error) {
      console.error("Error in fetchBuildings:", error);
      toast.error("Error fetching buildings");
    } finally {
      setLoading(false);
    }
  }, [getAdminSocietyId]);

  useEffect(() => {
    if (adminSocietyId) {
      fetchBuildings();
    }
  }, [fetchBuildings, adminSocietyId]);
  const handleAddFlat = useCallback(
    (buildingId) => {
      console.log("🔥 ADD FLAT CLICKED:", buildingId); // Debug
      const building = buildings.find((b) => b.id === buildingId);
      console.log("Building found:", building); // Debug

      if (!building) {
        console.error("Building not found for ID:", buildingId);
        toast.error("Building not found!");
        return;
      }

      setSelectedBuildingForFlat({
        id: building.id,
        name: building.name,
        societyid: building.societyid,
      });
      setOpenAddFlatDialog(true);
      console.log("✅ Dialog state set - should open now"); // Debug
    },
    [buildings]
  );

  const handleCloseAddFlatDialog = useCallback(() => {
    setOpenAddFlatDialog(false);
    setSelectedBuildingForFlat(null);
    fetchBuildings();
  }, []);
  const handleViewFlats = useCallback((buildingId) => {
    console.log("View Flats clicked:", buildingId);
    window.location.href = `/admin/flats/${buildingId}`;
  }, []);
  const headers = [
    "",
    "ID",
    "Building Name",
    "Address",
    "Units",
    "Society",
    "Status",
    "Actions",
  ];

  useEffect(() => {
    let filtered = buildings;

    if (searchTerm) {
      filtered = filtered.filter(
        (building) =>
          building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          building.id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (building) => building.status === statusFilter
      );
    }

    setFilteredBuildings(filtered);
    setPage(0);
  }, [buildings, searchTerm, statusFilter]);

  const handleStatusToggle = useCallback(async (buildingId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Optimistic UI
    setBuildings((prev) =>
      prev.map((b) => (b.id === buildingId ? { ...b, status: newStatus } : b))
    );

    const { error } = await supabase
      .from("buildings")
      .update({ is_active: newStatus === "active" })
      .eq("id", buildingId);

    if (error) {
      toast.error("Failed to update status");
      // Rollback
      setBuildings((prev) =>
        prev.map((b) =>
          b.id === buildingId ? { ...b, status: currentStatus } : b
        )
      );
    } else {
      toast.success(
        `Building ${newStatus === "active" ? "activated" : "deactivated"}`
      );
    }
  }, []);

  const handleToggleRow = useCallback((buildingId) => {
    setOpenRows((prev) => ({
      ...prev,
      [buildingId]: !prev[buildingId],
    }));
  }, []);

  const handleEditBuilding = (id) => {
    const b = buildings.find((item) => item.id === id);

    if (!b) return;

    setSelectedBuilding({
      id: b.id,
      name: b.name || "",
      description: b.description || "",
      society_id: String(b.society_id || ""),
      building_type: b.building_type || "residential",
      flat_limit: b.flat_limit || 0,
    });

    setOpenDialog(true);
  };

  const handleDeleteBuilding = async (id) => {
    if (!window.confirm("Are you sure you want to delete this building?"))
      return;

    const { error } = await supabase
      .from("buildings")
      .update({ is_delete: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete building");
    } else {
      setBuildings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Building deleted successfully");
      fetchBuildings(); // Refresh the list
    }
  };

  const handleAddNewBuilding = () => {
    if (!adminSocietyId) {
      toast.error("No society assigned. Cannot add building.");
      return;
    }

    setSelectedBuilding({
      society_id: String(adminSocietyId),
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBuilding(null);
    fetchBuildings();
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

  const paginatedBuildings = filteredBuildings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
                Buildings Management
              </Typography>
              <Typography className="font-roboto text-gray-600">
                Manage and monitor building properties for your society
              </Typography>
              {adminSocietyName ? (
                <Typography className="font-roboto text-sm text-primary mt-1">
                  Society: {adminSocietyName}
                </Typography>
              ) : (
                <Typography className="font-roboto text-sm text-gray-500 mt-1">
                  Loading society information...
                </Typography>
              )}
            </div>

            {/* {adminSocietyId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="inline-block"
              >
                <button
                  onClick={handleAddNewBuilding}
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
                  <span className="tracking-wide">New Building</span>

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
            )} */}
          </div>
        </div>

        {/* Filters and Search Section */}
        <Card className="rounded-xl border border-gray-200 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Typography variant="h6" className="font-roboto font-semibold">
                {adminSocietyName
                  ? `${adminSocietyName}'s Buildings (${filteredBuildings.length})`
                  : `Buildings (${filteredBuildings.length})`}
              </Typography>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <TextField
                  placeholder="Search buildings..."
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

        {/* Buildings Table/Cards */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : !adminSocietyId ? (
            <Alert severity="warning" sx={{ m: 3 }}>
              No society assigned to your account. Please contact administrator.
            </Alert>
          ) : filteredBuildings.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              {searchTerm || statusFilter !== "all"
                ? "No buildings match your filters."
                : "No buildings found in your society. Add your first building!"}
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
                              header === "Units" ||
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
                      {paginatedBuildings.map((building) => (
                        <BuildingRow
                          key={building.id}
                          building={building}
                          onEdit={handleEditBuilding}
                          onDelete={handleDeleteBuilding}
                          onStatusToggle={handleStatusToggle}
                          onToggleRow={handleToggleRow}
                          onAddFlat={handleAddFlat}
                          isExpanded={!!openRows[building.id]}
                          onViewFlats={handleViewFlats}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="p-4">
                  <AnimatePresence>
                    {paginatedBuildings.map((building) => (
                      <BuildingCard
                        key={building.id}
                        building={building}
                        onEdit={handleEditBuilding}
                        onDelete={handleDeleteBuilding}
                        onStatusToggle={handleStatusToggle}
                        onViewFlats={handleViewFlats}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

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
                  {Math.min(page * rowsPerPage + 1, filteredBuildings.length)}{" "}
                  to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredBuildings.length)}{" "}
                  of {filteredBuildings.length} buildings
                </Typography>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredBuildings.length}
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

        {adminSocietyId && (
          <AddBuildingDialog
            open={openDialog}
            onClose={handleCloseDialog}
            building={selectedBuilding}
            isEdit={!!selectedBuilding?.id}
            societies={societies}
            adminSocietyId={adminSocietyId}
          />
        )}
        {adminSocietyId && (
          <AddFlatDialog
            open={openAddFlatDialog}
            onClose={handleCloseAddFlatDialog}
            building={selectedBuildingForFlat}
            societyId={adminSocietyId}
          />
        )}
      </motion.div>
    </div>
  );
}
