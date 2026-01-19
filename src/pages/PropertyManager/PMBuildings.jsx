// import React, { useEffect, useState } from "react";
// import { supabase } from "../../api/supabaseClient";
// import { toast } from "react-toastify";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   CircularProgress,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TablePagination,
//   Tooltip,
//   Collapse,
//   TableSortLabel,
//   InputAdornment,
//   Menu,
//   MenuItem,
//   Divider,
//   LinearProgress,
//   useMediaQuery,
//   useTheme,
//   alpha,
// } from "@mui/material";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import CancelIcon from "@mui/icons-material/Cancel";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// import {
//   Add as AddIcon,
//   Edit as EditIcon,
//   Delete as DeleteIcon,
//   MoreVert as MoreVertIcon,
//   Business as BusinessIcon,
//   Apartment as ApartmentIcon,
//   LocationOn as LocationIcon,
//   DateRange as DateRangeIcon,
//   People as PeopleIcon,
//   Search as SearchIcon,
//   FilterList as FilterListIcon,
//   Refresh as RefreshIcon,
//   ArrowUpward as ArrowUpwardIcon,
//   ArrowDownward as ArrowDownwardIcon,
//   Info as InfoIcon,
//   Home as HomeIcon,
//   Construction as ConstructionIcon,
// } from "@mui/icons-material";
// import { styled } from "@mui/material/styles";

// const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
//   borderRadius: "16px",
//   border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//   boxShadow: "0 4px 20px rgba(111, 11, 20, 0.08)",
//   overflow: "hidden",
//   "& .MuiTableRow-root": {
//     transition: "background-color 0.2s ease",
//     "&:hover": {
//       backgroundColor: alpha("#6F0B14", 0.02),
//     },
//   },
//   "& .MuiTableCell-head": {
//     backgroundColor: alpha("#6F0B14", 0.04),
//     color: "#6F0B14",
//     fontWeight: 700,
//     fontSize: "0.875rem",
//     textTransform: "uppercase",
//     letterSpacing: "0.5px",
//     borderBottom: `2px solid ${alpha("#6F0B14", 0.2)}`,
//   },
//   "& .MuiTableCell-body": {
//     borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//   },
// }));

// const StatusBadge = styled(Box)(({ status }) => ({
//   display: "inline-flex",
//   alignItems: "center",
//   padding: "4px 12px",
//   borderRadius: "20px",
//   fontSize: "0.75rem",
//   fontWeight: 600,
//   textTransform: "capitalize",
//   backgroundColor:
//     status === "active"
//       ? alpha("#008000", 0.1)
//       : status === "under_construction"
//       ? alpha("#DBA400", 0.1)
//       : status === "planned"
//       ? alpha("#E86100", 0.1)
//       : alpha("#B31B1B", 0.1),
//   color:
//     status === "active"
//       ? "#008000"
//       : status === "under_construction"
//       ? "#DBA400"
//       : status === "planned"
//       ? "#E86100"
//       : "#B31B1B",
//   border: `1px solid ${
//     status === "active"
//       ? alpha("#008000", 0.3)
//       : status === "under_construction"
//       ? alpha("#DBA400", 0.3)
//       : status === "planned"
//       ? alpha("#E86100", 0.3)
//       : alpha("#B31B1B", 0.3)
//   }`,
// }));

// const ExpandableRow = ({ row, isExpanded, onToggle, onEdit, onDelete }) => {
//   return (
//     <>
//       <TableRow hover sx={{ "& > *": { borderBottom: "unset" } }}>
//         <TableCell>
//           <IconButton
//             aria-label="expand row"
//             size="small"
//             onClick={() => onToggle(row.id)}
//             sx={{
//               color: "#6F0B14",
//               "&:hover": { backgroundColor: alpha("#6F0B14", 0.1) },
//             }}
//           >
//             {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//           </IconButton>
//         </TableCell>
//         <TableCell>
//           <Box className="flex items-center gap-2">
//             <ApartmentIcon sx={{ color: "#6F0B14", fontSize: 20 }} />
//             <Typography className="font-semibold">{row.name}</Typography>
//           </Box>
//         </TableCell>
//         <TableCell>
//           <Box className="flex items-center gap-2">
//             <BusinessIcon sx={{ color: "#A29EB6", fontSize: 18 }} />
//             <Typography variant="body2">{row.society_name}</Typography>
//           </Box>
//         </TableCell>
//         <TableCell>
//           <Typography variant="body2">
//             {row.total_flats || (
//               <span style={{ color: "#A29EB6", fontStyle: "italic" }}>
//                 Not specified
//               </span>
//             )}
//           </Typography>
//         </TableCell>
//         <TableCell>
//           <StatusBadge status={row.status}>
//             {row.status === "under_construction"
//               ? "Under Construction"
//               : row.status}
//           </StatusBadge>
//         </TableCell>
//         <TableCell>
//           <Box className="flex gap-1">
//             <Tooltip title="Edit Building">
//               <IconButton
//                 size="small"
//                 onClick={() => onEdit(row)}
//                 sx={{
//                   color: "#6F0B14",
//                   backgroundColor: alpha("#6F0B14", 0.1),
//                   "&:hover": { backgroundColor: alpha("#6F0B14", 0.2) },
//                 }}
//               >
//                 <EditIcon fontSize="small" />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="Delete Building">
//               <IconButton
//                 size="small"
//                 onClick={() => onDelete(row.id)}
//                 sx={{
//                   color: "#B31B1B",
//                   backgroundColor: alpha("#B31B1B", 0.1),
//                   "&:hover": { backgroundColor: alpha("#B31B1B", 0.2) },
//                 }}
//               >
//                 <DeleteIcon fontSize="small" />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         </TableCell>
//       </TableRow>
//       <TableRow>
//         <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
//           <Collapse in={isExpanded} timeout="auto" unmountOnExit>
//             <Box className="p-4 bg-gradient-to-r from-[rgba(111,11,20,0.02)] to-transparent">
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <Card
//                     variant="outlined"
//                     sx={{
//                       borderColor: alpha("#6F0B14", 0.1),
//                       borderRadius: "12px",
//                       backgroundColor: "transparent",
//                     }}
//                   >
//                     <CardContent>
//                       <Typography
//                         variant="subtitle2"
//                         className="font-semibold mb-3"
//                         sx={{ color: "#6F0B14" }}
//                       >
//                         <InfoIcon
//                           sx={{ mr: 1, verticalAlign: "middle", fontSize: 18 }}
//                         />
//                         Building Details
//                       </Typography>
//                       <Grid container spacing={2}>
//                         {row.address && (
//                           <Grid item xs={12}>
//                             <Box className="flex items-start gap-2">
//                               <LocationIcon
//                                 sx={{ color: "#6F0B14", fontSize: 18, mt: 0.5 }}
//                               />
//                               <Box>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Address
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {row.address}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                           </Grid>
//                         )}
//                         {row.construction_year && (
//                           <Grid item xs={12} sm={6}>
//                             <Box className="flex items-center gap-2">
//                               <DateRangeIcon
//                                 sx={{ color: "#6F0B14", fontSize: 18 }}
//                               />
//                               <Box>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Construction Year
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {row.construction_year}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                           </Grid>
//                         )}
//                         {row.created_at && (
//                           <Grid item xs={12} sm={6}>
//                             <Box className="flex items-center gap-2">
//                               <DateRangeIcon
//                                 sx={{ color: "#6F0B14", fontSize: 18 }}
//                               />
//                               <Box>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   Created On
//                                 </Typography>
//                                 <Typography variant="body2">
//                                   {new Date(
//                                     row.created_at
//                                   ).toLocaleDateString()}
//                                 </Typography>
//                               </Box>
//                             </Box>
//                           </Grid>
//                         )}
//                       </Grid>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <Card
//                     variant="outlined"
//                     sx={{
//                       borderColor: alpha("#6F0B14", 0.1),
//                       borderRadius: "12px",
//                       backgroundColor: "transparent",
//                     }}
//                   >
//                     <CardContent>
//                       <Typography
//                         variant="subtitle2"
//                         className="font-semibold mb-3"
//                         sx={{ color: "#6F0B14" }}
//                       >
//                         <ConstructionIcon
//                           sx={{ mr: 1, verticalAlign: "middle", fontSize: 18 }}
//                         />
//                         Amenities & Status
//                       </Typography>
//                       {row.amenities ? (
//                         <Box className="flex flex-wrap gap-1 mb-3">
//                           {row.amenities.split(",").map((amenity, index) => (
//                             <Chip
//                               key={index}
//                               label={amenity.trim()}
//                               size="small"
//                               sx={{
//                                 backgroundColor: alpha("#6F0B14", 0.1),
//                                 color: "#6F0B14",
//                                 fontWeight: 500,
//                                 borderRadius: "8px",
//                               }}
//                             />
//                           ))}
//                         </Box>
//                       ) : (
//                         <Typography
//                           variant="body2"
//                           color="text.secondary"
//                           className="italic"
//                         >
//                           No amenities listed
//                         </Typography>
//                       )}
//                       <Divider className="my-2" />
//                       <Box className="flex justify-between items-center mt-2">
//                         <Typography variant="caption" color="text.secondary">
//                           Last Updated:
//                         </Typography>
//                         <Typography variant="caption" className="font-medium">
//                           {row.updated_at
//                             ? new Date(row.updated_at).toLocaleDateString()
//                             : "Never"}
//                         </Typography>
//                       </Box>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </>
//   );
// };

// export default function PMBuildings() {
//   const [buildings, setBuildings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [sortConfig, setSortConfig] = useState({
//     field: "created_at",
//     direction: "desc",
//   });
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedBuilding, setSelectedBuilding] = useState(null);
//   const [expandedRows, setExpandedRows] = useState(new Set());
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));

//   // Building form state
//   const [buildingForm, setBuildingForm] = useState({
//     name: "",
//     society_id: "",
//     address: "",
//     total_flats: "",
//     status: "active",
//     construction_year: "",
//     amenities: "",
//   });

//   useEffect(() => {
//     fetchBuildings();
//   }, []);

//   const fetchBuildings = async () => {
//     try {
//       setLoading(true);
//       const pmId = localStorage.getItem("profileId");

//       if (!pmId) {
//         toast.error("PM ID not found. Please login again.");
//         return;
//       }

//       // Step 1: Get societies assigned to PM
//       const { data: pmSocieties, error: pmError } = await supabase
//         .from("pm_society")
//         .select("society_id")
//         .eq("pm_id", pmId);

//       if (pmError) throw pmError;

//       if (!pmSocieties || pmSocieties.length === 0) {
//         setBuildings([]);
//         toast.info("No societies assigned to you.");
//         return;
//       }

//       const societyIds = pmSocieties.map((item) => item.society_id);

//       // Step 2: Get societies details for display
//       const { data: societies, error: societiesError } = await supabase
//         .from("societies")
//         .select("id, name")
//         .in("id", societyIds);

//       if (societiesError) throw societiesError;

//       // Step 3: Get buildings of those societies
//       const { data: buildingsData, error: buildingError } = await supabase
//         .from("buildings")
//         .select("*")
//         .in("society_id", societyIds)
//         .order("created_at", { ascending: false });

//       if (buildingError) throw buildingError;

//       // Combine buildings with society names
//       const buildingsWithSociety = buildingsData.map((building) => ({
//         ...building,
//         status: building.status || "inactive",
//         society_name:
//           societies.find((s) => s.id === building.society_id)?.name ||
//           "Unknown Society",
//       }));

//       setBuildings(buildingsWithSociety);
//     } catch (error) {
//       console.error("Error fetching buildings:", error);
//       toast.error("Failed to load buildings data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//     setPage(0);
//   };

//   const handleStatusFilter = (status) => {
//     setFilterStatus(status);
//     setPage(0);
//   };

//   const handleSort = (field) => {
//     const direction =
//       sortConfig.field === field && sortConfig.direction === "asc"
//         ? "desc"
//         : "asc";
//     setSortConfig({ field, direction });
//   };

//   const handleOpenDialog = (building = null) => {
//     if (building) {
//       setSelectedBuilding(building);
//       setBuildingForm({
//         name: building.name,
//         society_id: building.society_id,
//         address: building.address || "",
//         total_flats: building.total_flats || "",
//         status: building.status || "active",
//         construction_year: building.construction_year || "",
//         amenities: building.amenities || "",
//       });
//     } else {
//       setSelectedBuilding(null);
//       setBuildingForm({
//         name: "",
//         society_id: "",
//         address: "",
//         total_flats: "",
//         status: "active",
//         construction_year: "",
//         amenities: "",
//       });
//     }
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setSelectedBuilding(null);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setBuildingForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmitBuilding = async () => {
//     try {
//       if (!buildingForm.name || !buildingForm.society_id) {
//         toast.error("Building name and society are required");
//         return;
//       }

//       if (selectedBuilding) {
//         // Update existing building
//         const { error } = await supabase
//           .from("buildings")
//           .update({
//             ...buildingForm,
//             updated_at: new Date().toISOString(),
//           })
//           .eq("id", selectedBuilding.id);

//         if (error) throw error;
//         toast.success("Building updated successfully");
//       } else {
//         // Create new building
//         const { error } = await supabase.from("buildings").insert([
//           {
//             ...buildingForm,
//             created_at: new Date().toISOString(),
//             updated_at: new Date().toISOString(),
//           },
//         ]);

//         if (error) throw error;
//         toast.success("Building added successfully");
//       }

//       handleCloseDialog();
//       fetchBuildings();
//     } catch (error) {
//       console.error("Error saving building:", error);
//       toast.error("Failed to save building");
//     }
//   };

//   const handleDeleteBuilding = async (buildingId) => {
//     if (
//       !window.confirm(
//         "Are you sure you want to delete this building? This action cannot be undone."
//       )
//     ) {
//       return;
//     }

//     try {
//       const { error } = await supabase
//         .from("buildings")
//         .delete()
//         .eq("id", buildingId);

//       if (error) throw error;

//       toast.success("Building deleted successfully");
//       fetchBuildings();
//     } catch (error) {
//       console.error("Error deleting building:", error);
//       toast.error("Failed to delete building");
//     }
//   };

//   const toggleRowExpansion = (buildingId) => {
//     const newExpandedRows = new Set(expandedRows);
//     if (newExpandedRows.has(buildingId)) {
//       newExpandedRows.delete(buildingId);
//     } else {
//       newExpandedRows.add(buildingId);
//     }
//     setExpandedRows(newExpandedRows);
//   };

//   // Filter and sort buildings
//   const filteredAndSortedBuildings = buildings
//     .filter((building) => {
//       const matchesSearch =
//         building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         building.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         building.society_name.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesStatus =
//         filterStatus === "all" || building.status === filterStatus;

//       return matchesSearch && matchesStatus;
//     })
//     .sort((a, b) => {
//       const direction = sortConfig.direction === "asc" ? 1 : -1;

//       if (sortConfig.field === "name") {
//         return direction * a.name.localeCompare(b.name);
//       } else if (sortConfig.field === "society_name") {
//         return direction * a.society_name.localeCompare(b.society_name);
//       } else if (sortConfig.field === "total_flats") {
//         return direction * ((a.total_flats || 0) - (b.total_flats || 0));
//       } else if (sortConfig.field === "status") {
//         return direction * a.status.localeCompare(b.status);
//       } else {
//         return (
//           direction *
//           (new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
//         );
//       }
//     });

//   const paginatedBuildings = filteredAndSortedBuildings.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   if (loading) {
//     return (
//       <Box className="flex flex-col justify-center items-center min-h-screen gap-4">
//         <CircularProgress sx={{ color: "#6F0B14" }} size={60} />
//         <Typography color="text.secondary">Loading building data...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
//       <Box className="max-w-7xl mx-auto">
//         {/* HEADER SECTION */}
//         <Box className="mb-8">
//           <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <Box>
//               <Typography
//                 variant="h3"
//                 className="font-bold text-gray-900 mb-2"
//                 sx={{ color: "#6F0B14" }}
//               >
//                 <ApartmentIcon sx={{ mr: 2, verticalAlign: "middle" }} />
//                 Building Management
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 Manage buildings in your assigned societies • Total:{" "}
//                 {buildings.length} buildings
//               </Typography>
//             </Box>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               onClick={() => handleOpenDialog()}
//               sx={{
//                 backgroundColor: "#6F0B14",
//                 "&:hover": { backgroundColor: "#5A0910" },
//                 px: 4,
//                 py: 1.5,
//                 borderRadius: "12px",
//                 textTransform: "none",
//                 fontWeight: 600,
//               }}
//             >
//               Add New Building
//             </Button>
//           </Box>
//         </Box>

//         {/* FILTERS AND SEARCH */}
//         <Card
//           elevation={0}
//           className="mb-6 rounded-xl border border-gray-200"
//           sx={{ borderColor: alpha("#6F0B14", 0.1) }}
//         >
//           <CardContent className="p-4">
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder="Search buildings by name, address, or society..."
//                   value={searchTerm}
//                   onChange={handleSearch}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon sx={{ color: "#A29EB6" }} />
//                       </InputAdornment>
//                     ),
//                     endAdornment: searchTerm && (
//                       <InputAdornment position="end">
//                         <IconButton
//                           size="small"
//                           onClick={() => setSearchTerm("")}
//                           sx={{ color: "#A29EB6" }}
//                         >
//                           <CancelIcon fontSize="small" />
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                     sx: { borderRadius: "12px" },
//                   }}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       "&:hover fieldset": {
//                         borderColor: alpha("#6F0B14", 0.5),
//                       },
//                       "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                     },
//                   }}
//                 />
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* BUILDINGS TABLE */}
//         <StyledTableContainer component={Paper} elevation={0}>
//           <Table aria-label="collapsible building table">
//             <TableHead>
//               <TableRow>
//                 <TableCell width="50px" />
//                 <TableCell
//                   sortDirection={
//                     sortConfig.field === "name" ? sortConfig.direction : false
//                   }
//                 >
//                   <TableSortLabel
//                     active={sortConfig.field === "name"}
//                     direction={
//                       sortConfig.field === "name" ? sortConfig.direction : "asc"
//                     }
//                     onClick={() => handleSort("name")}
//                     sx={{
//                       color: "#6F0B14",
//                       "&.Mui-active": { color: "#6F0B14" },
//                       "&:hover": { color: "#5A0910" },
//                     }}
//                   >
//                     Building Name
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell
//                   sortDirection={
//                     sortConfig.field === "society_name"
//                       ? sortConfig.direction
//                       : false
//                   }
//                 >
//                   <TableSortLabel
//                     active={sortConfig.field === "society_name"}
//                     direction={
//                       sortConfig.field === "society_name"
//                         ? sortConfig.direction
//                         : "asc"
//                     }
//                     onClick={() => handleSort("society_name")}
//                     sx={{
//                       color: "#6F0B14",
//                       "&.Mui-active": { color: "#6F0B14" },
//                       "&:hover": { color: "#5A0910" },
//                     }}
//                   >
//                     Society
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell
//                   sortDirection={
//                     sortConfig.field === "total_flats"
//                       ? sortConfig.direction
//                       : false
//                   }
//                 >
//                   <TableSortLabel
//                     active={sortConfig.field === "total_flats"}
//                     direction={
//                       sortConfig.field === "total_flats"
//                         ? sortConfig.direction
//                         : "asc"
//                     }
//                     onClick={() => handleSort("total_flats")}
//                     sx={{
//                       color: "#6F0B14",
//                       "&.Mui-active": { color: "#6F0B14" },
//                       "&:hover": { color: "#5A0910" },
//                     }}
//                   >
//                     Total Flats
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell
//                   sortDirection={
//                     sortConfig.field === "status" ? sortConfig.direction : false
//                   }
//                 >
//                   <TableSortLabel
//                     active={sortConfig.field === "status"}
//                     direction={
//                       sortConfig.field === "status"
//                         ? sortConfig.direction
//                         : "asc"
//                     }
//                     onClick={() => handleSort("status")}
//                     sx={{
//                       color: "#6F0B14",
//                       "&.Mui-active": { color: "#6F0B14" },
//                       "&:hover": { color: "#5A0910" },
//                     }}
//                   >
//                     Status
//                   </TableSortLabel>
//                 </TableCell>
//                 <TableCell>Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {paginatedBuildings.length > 0 ? (
//                 paginatedBuildings.map((building) => (
//                   <ExpandableRow
//                     key={building.id}
//                     row={building}
//                     isExpanded={expandedRows.has(building.id)}
//                     onToggle={toggleRowExpansion}
//                     onEdit={handleOpenDialog}
//                     onDelete={handleDeleteBuilding}
//                   />
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-12">
//                     <ApartmentIcon
//                       sx={{ fontSize: 60, color: "#A29EB6", mb: 2 }}
//                     />
//                     <Typography variant="h6" color="text.secondary">
//                       No buildings found
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       color="text.secondary"
//                       className="mt-1"
//                     >
//                       {searchTerm || filterStatus !== "all"
//                         ? "Try adjusting your search or filter criteria"
//                         : "No buildings are assigned to your societies"}
//                     </Typography>
//                     {!searchTerm && filterStatus === "all" && (
//                       <Button
//                         startIcon={<AddIcon />}
//                         onClick={() => handleOpenDialog()}
//                         sx={{
//                           mt: 3,
//                           backgroundColor: "#6F0B14",
//                           "&:hover": { backgroundColor: "#5A0910" },
//                         }}
//                         variant="contained"
//                       >
//                         Add Your First Building
//                       </Button>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//           <TablePagination
//             rowsPerPageOptions={[5, 10, 25, 50]}
//             component="div"
//             count={filteredAndSortedBuildings.length}
//             rowsPerPage={rowsPerPage}
//             page={page}
//             onPageChange={handleChangePage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             sx={{
//               borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//               "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
//                 {
//                   color: "#6F0B14",
//                   fontWeight: 500,
//                 },
//               "& .MuiIconButton-root": {
//                 color: "#6F0B14",
//                 "&.Mui-disabled": {
//                   color: alpha("#6F0B14", 0.3),
//                 },
//               },
//             }}
//           />
//         </StyledTableContainer>
//       </Box>

//       {/* ADD/EDIT BUILDING DIALOG */}
//       <Dialog
//         open={openDialog}
//         onClose={handleCloseDialog}
//         maxWidth="sm"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: "20px",
//             boxShadow: "0 20px 60px rgba(111, 11, 20, 0.15)",
//             border: `1px solid ${alpha("#6F0B14", 0.1)}`,
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             color: "#6F0B14",
//             fontWeight: 700,
//             fontSize: "1.5rem",
//             backgroundColor: alpha("#6F0B14", 0.04),
//             borderBottom: `1px solid ${alpha("#6F0B14", 0.1)}`,
//           }}
//           className="py-4 px-6"
//         >
//           <ApartmentIcon sx={{ mr: 2, verticalAlign: "middle" }} />
//           {selectedBuilding ? "Edit Building" : "Add New Building"}
//         </DialogTitle>

//         <DialogContent className="py-6 px-8">
//           <Grid container spacing={3}>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Building Name"
//                 name="name"
//                 value={buildingForm.name}
//                 onChange={handleFormChange}
//                 required
//                 variant="outlined"
//                 InputProps={{
//                   sx: { borderRadius: "12px" },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     "&:hover fieldset": {
//                       borderColor: alpha("#6F0B14", 0.5),
//                     },
//                     "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                   },
//                   "& .MuiInputLabel-root.Mui-focused": {
//                     color: "#6F0B14",
//                   },
//                 }}
//               />
//             </Grid>

//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 label="Address"
//                 name="address"
//                 value={buildingForm.address}
//                 onChange={handleFormChange}
//                 multiline
//                 rows={2}
//                 variant="outlined"
//                 InputProps={{
//                   sx: { borderRadius: "12px" },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     "&:hover fieldset": {
//                       borderColor: alpha("#6F0B14", 0.5),
//                     },
//                     "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                   },
//                   "& .MuiInputLabel-root.Mui-focused": {
//                     color: "#6F0B14",
//                   },
//                 }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Total Flats"
//                 name="total_flats"
//                 type="number"
//                 value={buildingForm.total_flats}
//                 onChange={handleFormChange}
//                 variant="outlined"
//                 InputProps={{
//                   sx: { borderRadius: "12px" },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     "&:hover fieldset": {
//                       borderColor: alpha("#6F0B14", 0.5),
//                     },
//                     "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                   },
//                   "& .MuiInputLabel-root.Mui-focused": {
//                     color: "#6F0B14",
//                   },
//                 }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Construction Year"
//                 name="construction_year"
//                 type="number"
//                 value={buildingForm.construction_year}
//                 onChange={handleFormChange}
//                 variant="outlined"
//                 InputProps={{
//                   sx: { borderRadius: "12px" },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     "&:hover fieldset": {
//                       borderColor: alpha("#6F0B14", 0.5),
//                     },
//                     "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                   },
//                   "& .MuiInputLabel-root.Mui-focused": {
//                     color: "#6F0B14",
//                   },
//                 }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Status"
//                 name="status"
//                 value={buildingForm.status}
//                 onChange={handleFormChange}
//                 variant="outlined"
//                 SelectProps={{
//                   native: true,
//                 }}
//                 InputProps={{
//                   sx: { borderRadius: "12px" },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     "&:hover fieldset": {
//                       borderColor: alpha("#6F0B14", 0.5),
//                     },
//                     "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                   },
//                   "& .MuiInputLabel-root.Mui-focused": {
//                     color: "#6F0B14",
//                   },
//                 }}
//               >
//                 <option value="active">Active</option>
//                 <option value="under_construction">Under Construction</option>
//                 <option value="planned">Planned</option>
//                 <option value="inactive">Inactive</option>
//               </TextField>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Amenities (comma separated)"
//                 name="amenities"
//                 value={buildingForm.amenities}
//                 onChange={handleFormChange}
//                 placeholder="Gym, Pool, Parking, etc."
//                 variant="outlined"
//                 InputProps={{
//                   sx: { borderRadius: "12px" },
//                 }}
//                 sx={{
//                   "& .MuiOutlinedInput-root": {
//                     "&:hover fieldset": {
//                       borderColor: alpha("#6F0B14", 0.5),
//                     },
//                     "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
//                   },
//                   "& .MuiInputLabel-root.Mui-focused": {
//                     color: "#6F0B14",
//                   },
//                 }}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>

//         <DialogActions className="py-4 px-8 border-t border-gray-200">
//           <Button
//             onClick={handleCloseDialog}
//             sx={{
//               color: "#6F0B14",
//               fontWeight: 600,
//               px: 4,
//               py: 1,
//               borderRadius: "10px",
//               "&:hover": { backgroundColor: alpha("#6F0B14", 0.08) },
//               border: `1px solid ${alpha("#6F0B14", 0.3)}`,
//             }}
//             variant="outlined"
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleSubmitBuilding}
//             variant="contained"
//             sx={{
//               backgroundColor: "#6F0B14",
//               fontWeight: 600,
//               px: 4,
//               py: 1,
//               borderRadius: "10px",
//               "&:hover": { backgroundColor: "#5A0910" },
//               textTransform: "none",
//             }}
//           >
//             {selectedBuilding ? "Update Building" : "Create Building"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
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
    page * rowsPerPage + rowsPerPage
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
            variant="h3"
            className="font-bold text-gray-900 mb-2"
            sx={{ color: "#6F0B14" }}
          >
            <ApartmentIcon sx={{ mr: 2, verticalAlign: "middle" }} />
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
