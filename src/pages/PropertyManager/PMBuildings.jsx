import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  InputAdornment,
  Paper,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Cancel as CancelIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  DateRange as DateRangeIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: "0 4px 20px rgba(111, 11, 20, 0.08)",
  overflow: "hidden",
  "& .MuiTableRow-root": {
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: alpha("#6F0B14", 0.02),
    },
  },
  "& .MuiTableCell-head": {
    backgroundColor: alpha("#6F0B14", 0.04),
    color: "#6F0B14",
    fontWeight: 700,
    fontSize: "0.875rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: `2px solid ${alpha("#6F0B14", 0.2)}`,
  },
  "& .MuiTableCell-body": {
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  },
}));

const StatusChip = styled(Chip)(({ is_active }) => ({
  fontWeight: 600,
  borderRadius: "12px",
  backgroundColor: is_active
    ? "rgba(0, 128, 0, 0.1)"
    : "rgba(179, 27, 27, 0.1)",
  color: is_active ? "#008000" : "#B31B1B",
  border: `1px solid ${
    is_active ? "rgba(0, 128, 0, 0.3)" : "rgba(179, 27, 27, 0.3)"
  }`,
}));

const ExpandableRow = ({ row, isExpanded, onToggle }) => {
  return (
    <>
      <TableRow hover sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell width="60px">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => onToggle(row.id)}
            sx={{
              color: "#6F0B14",
              "&:hover": { backgroundColor: alpha("#6F0B14", 0.1) },
            }}
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box className="flex items-center gap-2">
            <ApartmentIcon sx={{ color: "#6F0B14", fontSize: 20 }} />
            <Box>
              <Typography className="font-semibold">{row.name}</Typography>
              {row.building_type && (
                <Typography variant="caption" color="text.secondary">
                  {row.building_type}
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Box className="flex items-center gap-2">
            <BusinessIcon sx={{ color: "#A29EB6", fontSize: 18 }} />
            <Typography variant="body2">{row.society_name}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" className="font-medium">
            {row.flat_limit || "Unlimited"}
          </Typography>
        </TableCell>
        <TableCell>
          <StatusChip
            label={row.is_active ? "Active" : "Inactive"}
            size="small"
            is_active={row.is_active}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box className="p-4 bg-gradient-to-r from-[rgba(111,11,20,0.02)] to-transparent">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: alpha("#6F0B14", 0.1),
                      borderRadius: "12px",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        className="font-semibold mb-3"
                        sx={{ color: "#6F0B14" }}
                      >
                        Building Information
                      </Typography>
                      {row.description && (
                        <Box className="mb-3">
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            className="block mb-1"
                          >
                            Description
                          </Typography>
                          <Typography variant="body2">
                            {row.description}
                          </Typography>
                        </Box>
                      )}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            className="block"
                          >
                            Building Type
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            {row.building_type || "Not specified"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            className="block"
                          >
                            Flat Limit
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            {row.flat_limit || "Unlimited"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: alpha("#6F0B14", 0.1),
                      borderRadius: "12px",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="subtitle2"
                        className="font-semibold mb-3"
                        sx={{ color: "#6F0B14" }}
                      >
                        System Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            className="block"
                          >
                            Created On
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            {new Date(row.created_at).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            className="block"
                          >
                            Last Updated
                          </Typography>
                          <Typography variant="body2" className="font-medium">
                            {row.updated_at
                              ? new Date(row.updated_at).toLocaleDateString()
                              : "Never"}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box className="mt-4">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="block mb-1"
                        >
                          Status
                        </Typography>
                        <Box className="flex items-center gap-2">
                          <StatusChip
                            label={row.is_active ? "Active" : "Inactive"}
                            is_active={row.is_active}
                          />
                          {row.is_delete && (
                            <Chip
                              label="Deleted"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default function PMBuildings() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const pmId = localStorage.getItem("profileId");

      if (!pmId) {
        toast.error("PM ID not found. Please login again.");
        return;
      }

      // Step 1: Get societies assigned to PM
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", pmId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setBuildings([]);
        toast.info("No societies assigned to you.");
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      // Step 2: Get societies details for display
      const { data: societies, error: societiesError } = await supabase
        .from("societies")
        .select("id, name")
        .in("id", societyIds);

      if (societiesError) throw societiesError;

      // Step 3: Get buildings of those societies
      const { data: buildingsData, error: buildingError } = await supabase
        .from("buildings")
        .select("*")
        .eq("is_delete", false) // Only show non-deleted buildings
        .in("society_id", societyIds)
        .order("created_at", { ascending: false });

      if (buildingError) throw buildingError;

      // Combine buildings with society names
      const buildingsWithSociety = buildingsData.map((building) => ({
        ...building,
        society_name:
          societies.find((s) => s.id === building.society_id)?.name ||
          "Unknown Society",
      }));

      setBuildings(buildingsWithSociety);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      toast.error("Failed to load buildings data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const toggleRowExpansion = (buildingId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(buildingId)) {
      newExpandedRows.delete(buildingId);
    } else {
      newExpandedRows.add(buildingId);
    }
    setExpandedRows(newExpandedRows);
  };

  // Filter buildings based on search term
  const filteredBuildings = buildings.filter((building) => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      building.name.toLowerCase().includes(searchLower) ||
      building.society_name.toLowerCase().includes(searchLower) ||
      (building.description &&
        building.description.toLowerCase().includes(searchLower)) ||
      (building.building_type &&
        building.building_type.toLowerCase().includes(searchLower))
    );
  });

  const paginatedBuildings = filteredBuildings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box className="flex flex-col justify-center items-center min-h-screen gap-4">
        <CircularProgress sx={{ color: "#6F0B14" }} size={60} />
        <Typography color="text.secondary">Loading building data...</Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      <Box className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <Box className="mb-8">
          <Typography
            variant="h4"
            className="font-semibold text-gray-900 mb-2"
            sx={{ color: "#6F0B14" }}
          >
            <ApartmentIcon
              sx={{ mr: 2, verticalAlign: "middle", fontSize: "35px" }}
            />
            Building Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage buildings in your assigned societies • Total:{" "}
            {buildings.length} buildings
          </Typography>
        </Box>

        {/* SEARCH SECTION */}
        <Paper
          elevation={0}
          className="p-4 mb-6 rounded-xl border border-gray-200"
          sx={{ borderColor: alpha("#6F0B14", 0.1) }}
        >
          <TextField
            fullWidth
            placeholder="Search buildings by name, society, description, or type..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#A29EB6" }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm("")}
                    sx={{ color: "#A29EB6" }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: "12px" },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: alpha("#6F0B14", 0.5),
                },
                "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
              },
            }}
          />
        </Paper>

        {/* BUILDINGS TABLE */}
        <StyledTableContainer component={Paper} elevation={0}>
          <Table aria-label="collapsible building table">
            <TableHead>
              <TableRow>
                <TableCell width="60px" />
                <TableCell>Building Name</TableCell>
                <TableCell>Society</TableCell>
                <TableCell>Flat Limit</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBuildings.length > 0 ? (
                paginatedBuildings.map((building) => (
                  <ExpandableRow
                    key={building.id}
                    row={building}
                    isExpanded={expandedRows.has(building.id)}
                    onToggle={toggleRowExpansion}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <ApartmentIcon
                      sx={{ fontSize: 60, color: "#A29EB6", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      No buildings found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="mt-1"
                    >
                      {searchTerm
                        ? "No buildings match your search criteria"
                        : "No buildings are assigned to your societies"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredBuildings.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: `1px solid ${alpha("#6F0B14", 0.1)}`,
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#6F0B14",
                  fontWeight: 500,
                },
              "& .MuiIconButton-root": {
                color: "#6F0B14",
                "&.Mui-disabled": {
                  color: alpha("#6F0B14", 0.3),
                },
              },
            }}
          />
        </StyledTableContainer>
      </Box>
    </Box>
  );
}
