// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Chip,
//   Typography,
//   Box,
//   CircularProgress,
//   TablePagination,
//   TextField,
//   Button,
//   Card,
//   CardContent,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Avatar,
//   Badge,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Switch,
//   Tooltip,
//   Tab,
//   Tabs,
// } from "@mui/material";
// import {
//   Edit,
//   Delete,
//   Search,
//   Security as SecurityIcon,
//   Business,
//   Apartment,
//   FilterList,
//   Refresh,
//   People,
//   LocationCity,
//   Add,
//   CheckCircle,
//   Cancel,
// } from "@mui/icons-material";
// import { supabase } from "../../api/supabaseClient";
// import { motion } from "framer-motion";
// import { toast } from "react-toastify";
// import AddSecurityDialog from "../../components/dialogs/AdminDialogs/AddSecurityDialog";

// export default function AdminSecurity() {
//   const [societies, setSocieties] = useState([]);
//   const [securityGuards, setSecurityGuards] = useState([]);
//   const [filteredGuards, setFilteredGuards] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingSocieties, setLoadingSocieties] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [selectedSociety, setSelectedSociety] = useState("all");
//   const [showSocietyDetails, setShowSocietyDetails] = useState(false);
//   const [selectedSocietyDetails, setSelectedSocietyDetails] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedGuard, setSelectedGuard] = useState(null);
//   const [buildings, setBuildings] = useState([]);
//   const [loadingBuildings, setLoadingBuildings] = useState({});
//   const [availableBuildings, setAvailableBuildings] = useState([]);
//   const [viewMode, setViewMode] = useState("all"); // 'all' or 'society'

//   // Tailwind colors from your config
//   const theme = {
//     primary: "#6F0B14", // Main red color
//     textAndTab: "#6F0B14",
//     hintText: "#A29EB6",
//     button: "#6F0B14",
//     checkbox: "#6F0B14",
//     lightBackground: "rgba(111, 11, 20, 0.09)",
//     trackSelect: "rgba(111, 11, 20, 0.44)",
//     darkTrackSelect: "rgba(111, 11, 20, 0.61)",
//     success: "#008000",
//     pending: "#DBA400",
//     reschedule: "#E86100",
//     reject: "#B31B1B",
//     black: "#000000",
//     white: "#FFFFFF",
//     border: "#e2e8f0",
//     background: "#f8fafc",
//     cardBg: "#ffffff",
//     textPrimary: "#1e293b",
//     textSecondary: "#64748b",
//   };

//   // Fetch all societies
//   useEffect(() => {
//     fetchSocieties();
//   }, []);

//   // Fetch security guards based on selected society and view mode
//   useEffect(() => {
//     if (selectedSociety === "all") {
//       fetchAllSecurityGuards();
//     } else if (selectedSociety) {
//       fetchSecurityGuardsBySociety(selectedSociety);
//     }
//   }, [selectedSociety, viewMode]);

//   const fetchSocieties = async () => {
//     setLoadingSocieties(true);
//     try {
//       const { data, error } = await supabase
//         .from("societies")
//         .select("id, name, city, state, is_active, address")
//         .eq("is_delete", false)
//         .order("name");

//       if (error) throw error;
//       setSocieties(data || []);
//     } catch (error) {
//       console.error("Error fetching societies:", error);
//       // toast.error("Failed to fetch societies");
//     } finally {
//       setLoadingSocieties(false);
//     }
//   };

//   const fetchAllSecurityGuards = async () => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("users")
//         .select(
//           `
//           id,
//           registed_user_id,
//           name,
//           email,
//           number,
//           role_type,
//           building_id,
//           society_id,
//           is_active,
//           created_at,
//           profile_url,
//           societies (id, name, city, state),
//           buildings (id, name)
//         `
//         )
//         .eq("role_type", "Security")
//         .eq("is_delete", false)
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       const guardsWithDetails = (data || []).map((guard) => ({
//         ...guard,
//         society_name: guard.societies?.name || "Not Assigned",
//         society_city: guard.societies?.city || "N/A",
//         society_state: guard.societies?.state || "N/A",
//         building_name: guard.buildings?.name || "Not Assigned",
//         society: guard.societies,
//       }));

//       setSecurityGuards(guardsWithDetails);
//       setFilteredGuards(guardsWithDetails);
//     } catch (error) {
//       console.error("Error fetching all security guards:", error);
//       // toast.error("Failed to fetch security guards");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSecurityGuardsBySociety = async (societyId) => {
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("users")
//         .select(
//           `
//           id,
//           registed_user_id,
//           name,
//           email,
//           number,
//           role_type,
//           building_id,
//           society_id,
//           is_active,
//           created_at,
//           profile_url,
//           societies (id, name, city, state),
//           buildings (id, name)
//         `
//         )
//         .eq("role_type", "Security")
//         .eq("society_id", societyId)
//         .eq("is_delete", false)
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       const guardsWithDetails = (data || []).map((guard) => ({
//         ...guard,
//         society_name: guard.societies?.name || "Not Assigned",
//         society_city: guard.societies?.city || "N/A",
//         society_state: guard.societies?.state || "N/A",
//         building_name: guard.buildings?.name || "Not Assigned",
//         society: guard.societies,
//       }));

//       setSecurityGuards(guardsWithDetails);
//       setFilteredGuards(guardsWithDetails);
//     } catch (error) {
//       console.error("Error fetching security guards by society:", error);
//       // toast.error("Failed to fetch security guards");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     setPage(0);

//     if (!value.trim()) {
//       setFilteredGuards(securityGuards);
//       return;
//     }

//     const filtered = securityGuards.filter(
//       (guard) =>
//         guard.name?.toLowerCase().includes(value) ||
//         guard.email?.toLowerCase().includes(value) ||
//         guard.number?.includes(value) ||
//         guard.society_name?.toLowerCase().includes(value) ||
//         guard.building_name?.toLowerCase().includes(value) ||
//         guard.registed_user_id?.toLowerCase().includes(value)
//     );
//     setFilteredGuards(filtered);
//   };

//   const handleToggleStatus = async (userId, currentStatus) => {
//     const newStatus = !currentStatus;
//     try {
//       const { error } = await supabase
//         .from("users")
//         .update({ is_active: newStatus, updated_at: new Date().toISOString() })
//         .eq("id", userId);

//       if (error) throw error;

//       toast.success(
//         `Security guard ${newStatus ? "activated" : "deactivated"}!`
//       );

//       // Update local state
//       setSecurityGuards((prev) =>
//         prev.map((guard) =>
//           guard.id === userId ? { ...guard, is_active: newStatus } : guard
//         )
//       );

//       setFilteredGuards((prev) =>
//         prev.map((guard) =>
//           guard.id === userId ? { ...guard, is_active: newStatus } : guard
//         )
//       );
//     } catch (error) {
//       console.error("Error updating status:", error);
//       // toast.error("Failed to update status");
//     }
//   };

//   const handleDelete = async (userId) => {
//     if (!window.confirm("Are you sure you want to delete this security guard?"))
//       return;

//     try {
//       const { error } = await supabase
//         .from("users")
//         .update({ is_delete: true, updated_at: new Date().toISOString() })
//         .eq("id", userId);

//       if (error) throw error;

//       toast.success("Security guard removed!");

//       // Remove from local state
//       setSecurityGuards((prev) => prev.filter((guard) => guard.id !== userId));
//       setFilteredGuards((prev) => prev.filter((guard) => guard.id !== userId));
//     } catch (error) {
//       console.error("Error deleting security guard:", error);
//       toast.error("Failed to delete security guard");
//     }
//   };

//   const handleEditGuard = async (guard) => {
//     setSelectedGuard(guard);
//     setOpenDialog(true);
//   };

//   const handleAddNewGuard = async () => {
//     setSelectedGuard(null);
//     setOpenDialog(true);
//   };

//   const handleViewSocietyDetails = (societyId) => {
//     const society = societies.find((s) => s.id === societyId);
//     if (society) {
//       setSelectedSocietyDetails(society);
//       setShowSocietyDetails(true);
//     }
//   };

//   const getSocietySecurityCount = (societyId) => {
//     return securityGuards.filter((guard) => guard.society_id === societyId)
//       .length;
//   };

//   const getActiveSecurityCount = (societyId) => {
//     return securityGuards.filter(
//       (guard) => guard.society_id === societyId && guard.is_active
//     ).length;
//   };

//   const getInactiveSecurityCount = (societyId) => {
//     return securityGuards.filter(
//       (guard) => guard.society_id === societyId && !guard.is_active
//     ).length;
//   };

//   const paginatedGuards = filteredGuards.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   const getTotalSecurityCount = () => {
//     return securityGuards.length;
//   };

//   const getTotalActiveSecurityCount = () => {
//     return securityGuards.filter((guard) => guard.is_active).length;
//   };

//   const refreshData = () => {
//     fetchSocieties();
//     if (selectedSociety === "all") {
//       fetchAllSecurityGuards();
//     } else {
//       fetchSecurityGuardsBySociety(selectedSociety);
//     }
//   };

//   // Function to render society-wise security view
//   const renderSocietyWiseView = () => {
//     if (loadingSocieties) {
//       return (
//         <Box className="flex justify-center py-12">
//           <CircularProgress style={{ color: theme.primary }} />
//         </Box>
//       );
//     }

//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {societies.map((society) => {
//             const totalGuards = getSocietySecurityCount(society.id);
//             const activeGuards = getActiveSecurityCount(society.id);
//             const inactiveGuards = getInactiveSecurityCount(society.id);

//             return (
//               <motion.div
//                 key={society.id}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <Card
//                   className="rounded-lg border shadow-sm cursor-pointer"
//                   onClick={() => {
//                     setSelectedSociety(society.id);
//                     setViewMode("society");
//                   }}
//                   style={{
//                     borderColor: theme.border,
//                     backgroundColor: theme.cardBg,
//                   }}
//                 >
//                   <CardContent className="p-6">
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex items-center gap-3">
//                         <Avatar
//                           className="bg-red-50"
//                           style={{ color: theme.primary }}
//                         >
//                           <Business />
//                         </Avatar>
//                         <div>
//                           <Typography
//                             className="font-bold text-lg"
//                             style={{ color: theme.textPrimary }}
//                           >
//                             {society.name}
//                           </Typography>
//                           <Typography
//                             variant="body2"
//                             style={{ color: theme.textSecondary }}
//                           >
//                             {society.city}, {society.state}
//                           </Typography>
//                         </div>
//                       </div>
//                       <Chip
//                         label={society.is_active ? "Active" : "Inactive"}
//                         size="small"
//                         style={{
//                           backgroundColor: society.is_active
//                             ? `${theme.success}20`
//                             : `${theme.reject}20`,
//                           color: society.is_active
//                             ? theme.success
//                             : theme.reject,
//                         }}
//                       />
//                     </div>

//                     {/* Security Stats */}
//                     <div className="space-y-3">
//                       <div className="flex items-center justify-between">
//                         <Typography
//                           variant="body2"
//                           style={{ color: theme.textSecondary }}
//                         >
//                           Total Security Guards:
//                         </Typography>
//                         <Badge
//                           badgeContent={totalGuards}
//                           color="primary"
//                           style={{
//                             backgroundColor:
//                               totalGuards > 0 ? theme.primary : theme.hintText,
//                             color: theme.white,
//                             padding: "4px 12px",
//                             borderRadius: "12px",
//                             fontSize: "0.875rem",
//                           }}
//                         />
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <Typography
//                           variant="body2"
//                           style={{ color: theme.textSecondary }}
//                         >
//                           Active:
//                         </Typography>
//                         <div className="flex items-center gap-2">
//                           <CheckCircle
//                             fontSize="small"
//                             style={{ color: theme.success }}
//                           />
//                           <Typography
//                             variant="body2"
//                             style={{ color: theme.success, fontWeight: 500 }}
//                           >
//                             {activeGuards}
//                           </Typography>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <Typography
//                           variant="body2"
//                           style={{ color: theme.textSecondary }}
//                         >
//                           Inactive:
//                         </Typography>
//                         <div className="flex items-center gap-2">
//                           <Cancel
//                             fontSize="small"
//                             style={{ color: theme.reject }}
//                           />
//                           <Typography
//                             variant="body2"
//                             style={{ color: theme.reject, fontWeight: 500 }}
//                           >
//                             {inactiveGuards}
//                           </Typography>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-6 pt-4 border-t border-gray-100">
//                       <Button
//                         fullWidth
//                         variant="contained"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSelectedSociety(society.id);
//                           setViewMode("society");
//                         }}
//                         style={{
//                           backgroundColor: theme.primary,
//                           textTransform: "none",
//                           fontWeight: 500,
//                         }}
//                         startIcon={<People />}
//                       >
//                         View Security Guards
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   // Function to render all security guards in table view
//   const renderAllSecurityView = () => {
//     return (
//       <>
//         {/* Filters and Search */}
//         <Card className="rounded-lg border shadow-sm mb-6">
//           <CardContent className="p-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <Typography
//                   variant="h6"
//                   className="font-semibold"
//                   style={{ color: theme.textPrimary }}
//                 >
//                   All Security Guards
//                   <span
//                     className="ml-2 text-sm font-normal"
//                     style={{ color: theme.textSecondary }}
//                   >
//                     ({filteredGuards.length} guards total)
//                   </span>
//                 </Typography>

//                 <FormControl size="small" className="w-48">
//                   <InputLabel style={{ color: theme.textSecondary }}>
//                     Filter by Society
//                   </InputLabel>
//                   <Select
//                     value={selectedSociety}
//                     onChange={(e) => {
//                       setSelectedSociety(e.target.value);
//                       setPage(0);
//                     }}
//                     label="Filter by Society"
//                     style={{ color: theme.textPrimary }}
//                   >
//                     <MenuItem value="all">
//                       <em>All Societies</em>
//                     </MenuItem>
//                     {societies.map((society) => (
//                       <MenuItem key={society.id} value={society.id}>
//                         {society.name} ({getSocietySecurityCount(society.id)})
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </div>

//               <div className="flex items-center gap-3">
//                 <TextField
//                   placeholder="Search guards by name, email, phone, building..."
//                   variant="outlined"
//                   size="small"
//                   value={searchTerm}
//                   onChange={handleSearch}
//                   className="w-full md:w-64"
//                   InputProps={{
//                     startAdornment: (
//                       <Search
//                         style={{ color: theme.hintText }}
//                         className="mr-2"
//                       />
//                     ),
//                     style: { color: theme.textPrimary },
//                   }}
//                 />
//                 <Tooltip title="Refresh Data">
//                   <IconButton
//                     onClick={refreshData}
//                     style={{ color: theme.primary }}
//                   >
//                     <Refresh />
//                   </IconButton>
//                 </Tooltip>
//                 <Button
//                   variant="contained"
//                   startIcon={<Add />}
//                   onClick={handleAddNewGuard}
//                   style={{
//                     backgroundColor: theme.primary,
//                     color: theme.white,
//                   }}
//                 >
//                   Add Security
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Security Guards Table */}
//         <Card className="rounded-lg border shadow-sm overflow-hidden">
//           {loading ? (
//             <Box className="flex justify-center p-12">
//               <CircularProgress style={{ color: theme.primary }} />
//             </Box>
//           ) : filteredGuards.length === 0 ? (
//             <Alert
//               severity={
//                 searchTerm || selectedSociety !== "all" ? "info" : "warning"
//               }
//               sx={{ m: 3 }}
//             >
//               {searchTerm
//                 ? "No security guards found matching your search."
//                 : selectedSociety !== "all"
//                 ? "No security guards assigned to this society."
//                 : "No security guards found in any society."}
//               <Button
//                 size="small"
//                 onClick={handleAddNewGuard}
//                 style={{ marginLeft: 8, color: theme.primary }}
//               >
//                 Add Security Guard
//               </Button>
//             </Alert>
//           ) : (
//             <>
//               <TableContainer>
//                 <Table>
//                   <TableHead style={{ backgroundColor: theme.lightBackground }}>
//                     <TableRow>
//                       <TableCell
//                         style={{ fontWeight: 600, color: theme.textPrimary }}
//                       >
//                         Security Guard
//                       </TableCell>
//                       <TableCell
//                         style={{ fontWeight: 600, color: theme.textPrimary }}
//                       >
//                         Contact
//                       </TableCell>
//                       <TableCell
//                         style={{ fontWeight: 600, color: theme.textPrimary }}
//                       >
//                         Society
//                       </TableCell>
//                       <TableCell
//                         style={{ fontWeight: 600, color: theme.textPrimary }}
//                       >
//                         Building
//                       </TableCell>
//                       <TableCell
//                         style={{ fontWeight: 600, color: theme.textPrimary }}
//                       >
//                         Status
//                       </TableCell>
//                       <TableCell
//                         style={{
//                           fontWeight: 600,
//                           color: theme.textPrimary,
//                           textAlign: "center",
//                         }}
//                       >
//                         Actions
//                       </TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {paginatedGuards.map((guard) => (
//                       <TableRow key={guard.id} hover>
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             {guard.profile_url ? (
//                               <Avatar
//                                 src={guard.profile_url}
//                                 sx={{ width: 40, height: 40 }}
//                               />
//                             ) : (
//                               <Avatar
//                                 className="bg-red-50"
//                                 style={{ color: theme.primary }}
//                               >
//                                 <SecurityIcon fontSize="small" />
//                               </Avatar>
//                             )}
//                             <div>
//                               <Typography
//                                 className="font-semibold"
//                                 style={{ color: theme.textPrimary }}
//                               >
//                                 {guard.name || "Unnamed Guard"}
//                               </Typography>
//                               <Typography
//                                 variant="body2"
//                                 style={{ color: theme.textSecondary }}
//                               >
//                                 ID:{" "}
//                                 {guard.registed_user_id?.substring(0, 8) ||
//                                   "N/A"}
//                               </Typography>
//                               <Typography
//                                 variant="caption"
//                                 style={{ color: theme.hintText }}
//                               >
//                                 Joined:{" "}
//                                 {new Date(
//                                   guard.created_at
//                                 ).toLocaleDateString()}
//                               </Typography>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div>
//                             <Typography
//                               className="font-medium"
//                               style={{ color: theme.textPrimary }}
//                             >
//                               {guard.email || "No email"}
//                             </Typography>
//                             <Typography
//                               variant="body2"
//                               style={{ color: theme.textSecondary }}
//                             >
//                               {guard.number || "No phone"}
//                             </Typography>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Business
//                               style={{ color: theme.primary }}
//                               fontSize="small"
//                             />
//                             <div>
//                               <Typography
//                                 className="font-medium"
//                                 style={{ color: theme.textPrimary }}
//                               >
//                                 {guard.society_name}
//                               </Typography>
//                               <Typography
//                                 variant="body2"
//                                 style={{ color: theme.textSecondary }}
//                               >
//                                 {guard.society_city}
//                                 {guard.society_state
//                                   ? `, ${guard.society_state}`
//                                   : ""}
//                               </Typography>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           {guard.building_name !== "Not Assigned" ? (
//                             <Chip
//                               icon={<Apartment />}
//                               label={guard.building_name}
//                               size="small"
//                               className="bg-red-50"
//                               style={{
//                                 color: theme.primary,
//                               }}
//                             />
//                           ) : (
//                             <Typography
//                               variant="body2"
//                               style={{
//                                 color: theme.hintText,
//                                 fontStyle: "italic",
//                               }}
//                             >
//                               Not assigned to any building
//                             </Typography>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Switch
//                               checked={guard.is_active}
//                               onChange={() =>
//                                 handleToggleStatus(guard.id, guard.is_active)
//                               }
//                               size="small"
//                               style={{ color: theme.primary }}
//                             />
//                             <Chip
//                               label={guard.is_active ? "Active" : "Inactive"}
//                               size="small"
//                               style={{
//                                 backgroundColor: guard.is_active
//                                   ? `${theme.success}20`
//                                   : `${theme.reject}20`,
//                                 color: guard.is_active
//                                   ? theme.success
//                                   : theme.reject,
//                                 fontWeight: 500,
//                               }}
//                             />
//                           </div>
//                         </TableCell>
//                         <TableCell align="center">
//                           <div className="flex items-center justify-center gap-1">
//                             <Tooltip title="Edit">
//                               <IconButton
//                                 size="small"
//                                 onClick={() => handleEditGuard(guard)}
//                                 className="hover:bg-red-50"
//                                 style={{ color: theme.primary }}
//                               >
//                                 <Edit fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                             <Tooltip title="Delete">
//                               <IconButton
//                                 size="small"
//                                 onClick={() => handleDelete(guard.id)}
//                                 className="hover:bg-red-50"
//                                 style={{ color: theme.reject }}
//                               >
//                                 <Delete fontSize="small" />
//                               </IconButton>
//                             </Tooltip>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>

//               <Box sx={{ p: 2, borderTop: `1px solid ${theme.border}` }}>
//                 <TablePagination
//                   rowsPerPageOptions={[5, 10, 25, 50]}
//                   component="div"
//                   count={filteredGuards.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={(e, newPage) => setPage(newPage)}
//                   onRowsPerPageChange={(e) => {
//                     setRowsPerPage(parseInt(e.target.value, 10));
//                     setPage(0);
//                   }}
//                 />
//               </Box>
//             </>
//           )}
//         </Card>
//       </>
//     );
//   };

//   return (
//     <div className="min-h-screen p-4 md:p-6 bg-gray-50">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-7xl mx-auto"
//       >
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//             <div>
//               <Typography
//                 variant="h4"
//                 className="font-bold mb-2"
//                 style={{ color: theme.textPrimary }}
//               >
//                 Security Management
//               </Typography>
//               <Typography
//                 className="text-lg"
//                 style={{ color: theme.textSecondary }}
//               >
//                 {viewMode === "all"
//                   ? "Manage all security guards across societies"
//                   : selectedSociety === "all"
//                   ? "Viewing all societies security overview"
//                   : "Viewing security guards for selected society"}
//               </Typography>
//             </div>

//             {/* View Mode Toggle */}
//             <Box
//               className="bg-white rounded-lg border"
//               style={{ borderColor: theme.border }}
//             >
//               <Tabs
//                 value={viewMode}
//                 onChange={(e, newValue) => {
//                   setViewMode(newValue);
//                   if (newValue === "all") {
//                     setSelectedSociety("all");
//                   }
//                 }}
//                 textColor="inherit"
//                 style={{ color: theme.textPrimary }}
//                 TabIndicatorProps={{
//                   style: { backgroundColor: theme.primary },
//                 }}
//               >
//                 <Tab
//                   label="All Security"
//                   value="all"
//                   style={{
//                     color:
//                       viewMode === "all" ? theme.primary : theme.textSecondary,
//                     fontWeight: viewMode === "all" ? 600 : 400,
//                   }}
//                 />
//                 <Tab
//                   label="Society Wise"
//                   value="society"
//                   style={{
//                     color:
//                       viewMode === "society"
//                         ? theme.primary
//                         : theme.textSecondary,
//                     fontWeight: viewMode === "society" ? 600 : 400,
//                   }}
//                 />
//               </Tabs>
//             </Box>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//             <Card className="rounded-lg border shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Typography
//                       variant="body2"
//                       style={{ color: theme.textSecondary }}
//                     >
//                       Total Guards
//                     </Typography>
//                     <Typography
//                       variant="h5"
//                       className="font-bold"
//                       style={{ color: theme.textPrimary }}
//                     >
//                       {getTotalSecurityCount()}
//                     </Typography>
//                   </div>
//                   <Avatar
//                     className="bg-red-50"
//                     style={{ color: theme.primary }}
//                   >
//                     <People />
//                   </Avatar>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="rounded-lg border shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Typography
//                       variant="body2"
//                       style={{ color: theme.textSecondary }}
//                     >
//                       Active Guards
//                     </Typography>
//                     <Typography
//                       variant="h5"
//                       className="font-bold"
//                       style={{ color: theme.success }}
//                     >
//                       {getTotalActiveSecurityCount()}
//                     </Typography>
//                   </div>
//                   <Avatar
//                     className="bg-green-50"
//                     style={{ color: theme.success }}
//                   >
//                     <CheckCircle />
//                   </Avatar>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="rounded-lg border shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Typography
//                       variant="body2"
//                       style={{ color: theme.textSecondary }}
//                     >
//                       Societies
//                     </Typography>
//                     <Typography
//                       variant="h5"
//                       className="font-bold"
//                       style={{ color: theme.textPrimary }}
//                     >
//                       {societies.length}
//                     </Typography>
//                   </div>
//                   <Avatar
//                     className="bg-blue-50"
//                     style={{ color: theme.primary }}
//                   >
//                     <Business />
//                   </Avatar>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="rounded-lg border shadow-sm">
//               <CardContent className="p-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <Typography
//                       variant="body2"
//                       style={{ color: theme.textSecondary }}
//                     >
//                       Without Society
//                     </Typography>
//                     <Typography
//                       variant="h5"
//                       className="font-bold"
//                       style={{ color: theme.pending }}
//                     >
//                       {securityGuards.filter((g) => !g.society_id).length}
//                     </Typography>
//                   </div>
//                   <Avatar
//                     className="bg-yellow-50"
//                     style={{ color: theme.pending }}
//                   >
//                     <Cancel />
//                   </Avatar>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>

//         {/* Main Content */}
//         {viewMode === "all" ? renderAllSecurityView() : renderSocietyWiseView()}

//         {/* Back Button for Society View */}
//         {viewMode === "society" && selectedSociety !== "all" && (
//           <Box className="mt-6">
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 setSelectedSociety("all");
//                 setViewMode("society");
//               }}
//               startIcon={<Business />}
//               style={{
//                 borderColor: theme.primary,
//                 color: theme.primary,
//               }}
//             >
//               Back to All Societies
//             </Button>
//           </Box>
//         )}
//       </motion.div>

//       {/* Add/Edit Security Dialog */}
//       <AddSecurityDialog
//         open={openDialog}
//         onClose={() => setOpenDialog(false)}
//         guard={selectedGuard}
//         societies={societies}
//         onSuccess={() => {
//           refreshData();
//           setOpenDialog(false);
//         }}
//       />

//       {/* Society Details Dialog */}
//       <Dialog
//         open={showSocietyDetails}
//         onClose={() => setShowSocietyDetails(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         {selectedSocietyDetails && (
//           <>
//             <DialogTitle>
//               <div className="flex items-center gap-3">
//                 <Avatar className="bg-red-50" style={{ color: theme.primary }}>
//                   <Business />
//                 </Avatar>
//                 <div>
//                   <Typography variant="h6" style={{ color: theme.textPrimary }}>
//                     {selectedSocietyDetails.name}
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     style={{ color: theme.textSecondary }}
//                   >
//                     Society Details
//                   </Typography>
//                 </div>
//               </div>
//             </DialogTitle>
//             <DialogContent>
//               <Grid container spacing={3} className="mt-2">
//                 <Grid item xs={12}>
//                   <Typography
//                     variant="subtitle2"
//                     style={{ color: theme.textSecondary }}
//                   >
//                     Location
//                   </Typography>
//                   <Typography style={{ color: theme.textPrimary }}>
//                     {selectedSocietyDetails.city},{" "}
//                     {selectedSocietyDetails.state}
//                   </Typography>
//                   {selectedSocietyDetails.address && (
//                     <Typography
//                       variant="body2"
//                       style={{ color: theme.textSecondary }}
//                     >
//                       {selectedSocietyDetails.address}
//                     </Typography>
//                   )}
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography
//                     variant="subtitle2"
//                     style={{ color: theme.textSecondary }}
//                   >
//                     Total Security Guards
//                   </Typography>
//                   <Typography style={{ color: theme.textPrimary }}>
//                     {getSocietySecurityCount(selectedSocietyDetails.id)}
//                   </Typography>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <Typography
//                     variant="subtitle2"
//                     style={{ color: theme.textSecondary }}
//                   >
//                     Status
//                   </Typography>
//                   <Chip
//                     label={
//                       selectedSocietyDetails.is_active ? "Active" : "Inactive"
//                     }
//                     size="small"
//                     style={{
//                       backgroundColor: selectedSocietyDetails.is_active
//                         ? `${theme.success}20`
//                         : `${theme.reject}20`,
//                       color: selectedSocietyDetails.is_active
//                         ? theme.success
//                         : theme.reject,
//                     }}
//                   />
//                 </Grid>
//               </Grid>
//             </DialogContent>
//             <DialogActions>
//               <Button
//                 onClick={() => setShowSocietyDetails(false)}
//                 style={{ color: theme.textSecondary }}
//               >
//                 Close
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={() => {
//                   setSelectedSociety(selectedSocietyDetails.id);
//                   setViewMode("society");
//                   setShowSocietyDetails(false);
//                 }}
//                 style={{
//                   backgroundColor: theme.primary,
//                   color: theme.white,
//                 }}
//               >
//                 View Security Guards
//               </Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </div>
//   );
// }
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
  FormControlLabel,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Security as SecurityIcon,
  Business,
  Apartment,
  FilterList,
  Refresh,
  People,
  LocationCity,
  Add,
  CheckCircle,
  Cancel,
  Visibility,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import AddSecurityDialog from "../../components/dialogs/AdminDialogs/AddSecurityDialog";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [viewMode, setViewMode] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all"); // 'all', 'active', 'inactive'

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

  // Fetch societies
  const fetchSocieties = async () => {
    setLoadingSocieties(true);
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("id, name, city, state, is_active, address")
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
      const { data, error } = await supabase
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
          societies (id, name, city, state, address),
          buildings (id, name)
        `
        )
        .eq("role_type", "Security")
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const guardsWithDetails = (data || []).map((guard) => ({
        ...guard,
        society_name: guard.societies?.name || "Not Assigned",
        society_city: guard.societies?.city || "N/A",
        society_state: guard.societies?.state || "N/A",
        society_address: guard.societies?.address || "N/A",
        building_name: guard.buildings?.name || "Not Assigned",
        society: guard.societies,
      }));

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
      const { data, error } = await supabase
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
          societies (id, name, city, state, address),
          buildings (id, name)
        `
        )
        .eq("role_type", "Security")
        .eq("society_id", societyId)
        .eq("is_delete", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const guardsWithDetails = (data || []).map((guard) => ({
        ...guard,
        society_name: guard.societies?.name || "Not Assigned",
        society_city: guard.societies?.city || "N/A",
        society_state: guard.societies?.state || "N/A",
        society_address: guard.societies?.address || "N/A",
        building_name: guard.buildings?.name || "Not Assigned",
        society: guard.societies,
      }));

      setSecurityGuards(guardsWithDetails);
      applyFilters(guardsWithDetails, searchTerm, activeStatusFilter);
    } catch (error) {
      console.error("Error fetching security guards by society:", error);
      toast.error("Failed to fetch security guards");
    } finally {
      setLoading(false);
    }
  };

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
          guard.registed_user_id?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((guard) =>
        statusFilter === "active" ? guard.is_active : !guard.is_active
      );
    }

    setFilteredGuards(filtered);
    setPage(0); // Reset to first page when filters change
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

  // Handle toggle status
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_active: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success(
        `Security guard ${newStatus ? "activated" : "deactivated"}!`
      );

      // Update local state
      const updatedGuards = securityGuards.map((guard) =>
        guard.id === userId ? { ...guard, is_active: newStatus } : guard
      );

      setSecurityGuards(updatedGuards);
      applyFilters(updatedGuards, searchTerm, activeStatusFilter);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Handle delete
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this security guard?"))
      return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_delete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Security guard removed!");

      // Remove from local state
      const updatedGuards = securityGuards.filter(
        (guard) => guard.id !== userId
      );
      setSecurityGuards(updatedGuards);
      applyFilters(updatedGuards, searchTerm, activeStatusFilter);
    } catch (error) {
      console.error("Error deleting security guard:", error);
      toast.error("Failed to delete security guard");
    }
  };

  // Handle edit guard
  const handleEditGuard = (guard) => {
    setSelectedGuard(guard);
    setOpenDialog(true);
  };

  // Handle add new guard
  const handleAddNewGuard = () => {
    setSelectedGuard(null);
    setOpenDialog(true);
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
        <Box className="flex justify-center py-12">
          <CircularProgress style={{ color: theme.primary }} />
        </Box>
      );
    }

    return (
      <div className="space-y-6">
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
                  className="rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedSociety(society.id);
                    setViewMode("all"); // Switch to table view with this society selected
                  }}
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.cardBg,
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="bg-red-50"
                          style={{ color: theme.primary }}
                        >
                          <Business />
                        </Avatar>
                        <div>
                          <Typography
                            className="font-bold text-lg"
                            style={{ color: theme.textPrimary }}
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
                        style={{
                          backgroundColor: society.is_active
                            ? `${theme.success}20`
                            : `${theme.reject}20`,
                          color: society.is_active
                            ? theme.success
                            : theme.reject,
                        }}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Typography
                          variant="body2"
                          style={{ color: theme.textSecondary }}
                        >
                          Total Guards:
                        </Typography>
                        <Badge
                          badgeContent={totalGuards}
                          color="primary"
                          style={{
                            backgroundColor:
                              totalGuards > 0 ? theme.primary : theme.hintText,
                            color: theme.white,
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "0.875rem",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Typography
                          variant="body2"
                          style={{ color: theme.textSecondary }}
                        >
                          Active:
                        </Typography>
                        <div className="flex items-center gap-2">
                          <CheckCircle
                            fontSize="small"
                            style={{ color: theme.success }}
                          />
                          <Typography
                            variant="body2"
                            style={{ color: theme.success, fontWeight: 500 }}
                          >
                            {activeGuards}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Typography
                          variant="body2"
                          style={{ color: theme.textSecondary }}
                        >
                          Inactive:
                        </Typography>
                        <div className="flex items-center gap-2">
                          <Cancel
                            fontSize="small"
                            style={{ color: theme.reject }}
                          />
                          <Typography
                            variant="body2"
                            style={{ color: theme.reject, fontWeight: 500 }}
                          >
                            {inactiveGuards}
                          </Typography>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
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
                          }}
                          startIcon={<Visibility />}
                        >
                          View Details
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
                            backgroundColor: theme.primary,
                            textTransform: "none",
                            fontWeight: 500,
                          }}
                          startIcon={<People />}
                        >
                          View Guards
                        </Button>
                      </div>
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
        <Card className="rounded-lg border shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                        {society.name} ({getSocietySecurityCount(society.id)})
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
                    <MenuItem value="active">Active Only</MenuItem>
                    <MenuItem value="inactive">Inactive Only</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center gap-3">
                <TextField
                  placeholder="Search guards..."
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
                    style: { color: theme.textPrimary },
                  }}
                />
                <Tooltip title="Refresh Data">
                  <IconButton
                    onClick={refreshData}
                    style={{ color: theme.primary }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddNewGuard}
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.white,
                  }}
                >
                  Add Security
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Guards Table */}
        <Card className="rounded-lg border shadow-sm overflow-hidden">
          {loading ? (
            <Box className="flex justify-center p-12">
              <CircularProgress style={{ color: theme.primary }} />
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
                : "No security guards found."}
              <Button
                size="small"
                onClick={handleAddNewGuard}
                style={{ marginLeft: 8, color: theme.primary }}
              >
                Add Security Guard
              </Button>
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead style={{ backgroundColor: theme.lightBackground }}>
                    <TableRow>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Security Guard
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Contact
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Society
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Building
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: 600, color: theme.textPrimary }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: 600,
                          color: theme.textPrimary,
                          textAlign: "center",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedGuards.map((guard) => (
                      <TableRow key={guard.id} hover>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {guard.profile_url ? (
                              <Avatar
                                src={guard.profile_url}
                                sx={{ width: 40, height: 40 }}
                              />
                            ) : (
                              <Avatar
                                className="bg-red-50"
                                style={{ color: theme.primary }}
                              >
                                <SecurityIcon fontSize="small" />
                              </Avatar>
                            )}
                            <div>
                              <Typography
                                className="font-semibold"
                                style={{ color: theme.textPrimary }}
                              >
                                {guard.name || "Unnamed Guard"}
                              </Typography>
                              <Typography
                                variant="body2"
                                style={{ color: theme.textSecondary }}
                              >
                                ID:{" "}
                                {guard.registed_user_id?.substring(0, 8) ||
                                  "N/A"}
                              </Typography>
                              <Typography
                                variant="caption"
                                style={{ color: theme.hintText }}
                              >
                                Joined:{" "}
                                {new Date(
                                  guard.created_at
                                ).toLocaleDateString()}
                              </Typography>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Typography
                              className="font-medium"
                              style={{ color: theme.textPrimary }}
                            >
                              {guard.email || "No email"}
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{ color: theme.textSecondary }}
                            >
                              {guard.number || "No phone"}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          {guard.building_name !== "Not Assigned" ? (
                            <Chip
                              icon={<Apartment />}
                              label={guard.building_name}
                              size="small"
                              className="bg-red-50"
                              style={{ color: theme.primary }}
                            />
                          ) : (
                            <Typography
                              variant="body2"
                              style={{
                                color: theme.hintText,
                                fontStyle: "italic",
                              }}
                            >
                              Not assigned
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={guard.is_active}
                              onChange={() =>
                                handleToggleStatus(guard.id, guard.is_active)
                              }
                              size="small"
                              style={{ color: theme.primary }}
                            />
                            <Chip
                              label={guard.is_active ? "Active" : "Inactive"}
                              size="small"
                              style={{
                                backgroundColor: guard.is_active
                                  ? `${theme.success}20`
                                  : `${theme.reject}20`,
                                color: guard.is_active
                                  ? theme.success
                                  : theme.reject,
                                fontWeight: 500,
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditGuard(guard)}
                                className="hover:bg-red-50"
                                style={{ color: theme.primary }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(guard.id)}
                                className="hover:bg-red-50"
                                style={{ color: theme.reject }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2, borderTop: `1px solid ${theme.border}` }}>
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
    <div className="min-h-screen p-4 md:p-6 bg-gray-50">
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
                className="font-bold mb-2"
                style={{ color: theme.textPrimary }}
              >
                Security Management
              </Typography>
              <Typography
                className="text-lg"
                style={{ color: theme.textSecondary }}
              >
                {viewMode === "all"
                  ? selectedSociety === "all"
                    ? "Manage all security guards across societies"
                    : `Managing security guards for ${
                        societies.find((s) => s.id === selectedSociety)?.name ||
                        "selected society"
                      }`
                  : "View society-wise security overview"}
              </Typography>
            </div>

            {/* View Mode Toggle */}
            <Box
              className="bg-white rounded-lg border"
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
                  style: { backgroundColor: theme.primary },
                }}
              >
                <Tab
                  label="Security Guards"
                  value="all"
                  style={{
                    color:
                      viewMode === "all" ? theme.primary : theme.textSecondary,
                    fontWeight: viewMode === "all" ? 600 : 400,
                  }}
                />
                <Tab
                  label="Society Wise"
                  value="society"
                  style={{
                    color:
                      viewMode === "society"
                        ? theme.primary
                        : theme.textSecondary,
                    fontWeight: viewMode === "society" ? 600 : 400,
                  }}
                />
              </Tabs>
            </Box>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Total Guards
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {getTotalSecurityCount()}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-red-50"
                    style={{ color: theme.primary }}
                  >
                    <People />
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Active Guards
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.success }}
                    >
                      {getTotalActiveSecurityCount()}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-green-50"
                    style={{ color: theme.success }}
                  >
                    <CheckCircle />
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Inactive Guards
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.reject }}
                    >
                      {getTotalInactiveSecurityCount()}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-gray-50"
                    style={{ color: theme.reject }}
                  >
                    <Cancel />
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      Societies
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {societies.length}
                    </Typography>
                  </div>
                  <Avatar
                    className="bg-blue-50"
                    style={{ color: theme.primary }}
                  >
                    <Business />
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === "all" ? renderAllSecurityView() : renderSocietyWiseView()}

        {/* Back Button for Society View */}
        {viewMode === "society" && selectedSociety !== "all" && (
          <Box className="mt-6">
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
              }}
            >
              Back to All Societies
            </Button>
          </Box>
        )}
      </motion.div>

      {/* Add/Edit Security Dialog */}
      <AddSecurityDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        guard={selectedGuard}
        societies={societies}
        onSuccess={() => {
          refreshData();
          setOpenDialog(false);
        }}
      />

      {/* Society Details Dialog */}
      <Dialog
        open={showSocietyDetails}
        onClose={() => setShowSocietyDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSocietyDetails && (
          <>
            <DialogTitle>
              <div className="flex items-center gap-3">
                <Avatar className="bg-red-50" style={{ color: theme.primary }}>
                  <Business />
                </Avatar>
                <div>
                  <Typography variant="h6" style={{ color: theme.textPrimary }}>
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
            <DialogContent>
              <Grid container spacing={3} className="mt-2">
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    style={{ color: theme.textSecondary }}
                  >
                    Location
                  </Typography>
                  <Typography style={{ color: theme.textPrimary }}>
                    {selectedSocietyDetails.city},{" "}
                    {selectedSocietyDetails.state}
                  </Typography>
                  {selectedSocietyDetails.address && (
                    <Typography
                      variant="body2"
                      style={{ color: theme.textSecondary }}
                    >
                      {selectedSocietyDetails.address}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    style={{ color: theme.textSecondary }}
                  >
                    Total Security Guards
                  </Typography>
                  <Typography style={{ color: theme.textPrimary }}>
                    {getSocietySecurityCount(selectedSocietyDetails.id)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    style={{ color: theme.textSecondary }}
                  >
                    Status
                  </Typography>
                  <Chip
                    label={
                      selectedSocietyDetails.is_active ? "Active" : "Inactive"
                    }
                    size="small"
                    style={{
                      backgroundColor: selectedSocietyDetails.is_active
                        ? `${theme.success}20`
                        : `${theme.reject}20`,
                      color: selectedSocietyDetails.is_active
                        ? theme.success
                        : theme.reject,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    style={{ color: theme.textSecondary }}
                  >
                    Active Guards
                  </Typography>
                  <Typography style={{ color: theme.success }}>
                    {getActiveSecurityCount(selectedSocietyDetails.id)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle2"
                    style={{ color: theme.textSecondary }}
                  >
                    Inactive Guards
                  </Typography>
                  <Typography style={{ color: theme.reject }}>
                    {getInactiveSecurityCount(selectedSocietyDetails.id)}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
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
