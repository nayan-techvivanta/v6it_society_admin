// import React, { useState, useCallback, useEffect, useRef } from "react";
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
//   Avatar,
//   Typography,
//   useMediaQuery,
//   useTheme,
//   Collapse,
//   Box,
//   Alert,
//   Button,
//   CircularProgress,
//   TablePagination,
//   FormControlLabel,
//   Switch,
//   styled,
//   Card,
//   CardContent,
// } from "@mui/material";
// import {
//   KeyboardArrowDown,
//   KeyboardArrowUp,
//   Edit,
//   Delete,
//   MoreVert,
//   LocationOn,
//   Phone,
//   WhatsApp,
//   Add as AddIcon,
// } from "@mui/icons-material";
// import { motion, AnimatePresence } from "framer-motion";
// import AddManagerDialog from "../../components/dialogs/AddManagerDialog";
// import { toast } from "react-toastify";

// // Custom styled switch for property managers (using primary color)
// const PrimarySwitch = styled(Switch)(({ theme }) => ({
//   "& .MuiSwitch-switchBase.Mui-checked": {
//     color: "#6F0B14", // Primary color
//   },
//   "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
//     backgroundColor: "#6F0B14",
//   },
//   "& .MuiSwitch-switchBase.Mui-checked:hover": {
//     backgroundColor: "rgba(111, 11, 20, 0.08)",
//   },
// }));

// // Debounce hook
// const useDebounce = (callback, delay) => {
//   const timeoutRef = useRef();

//   const debouncedCallback = useCallback(
//     (...args) => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//       timeoutRef.current = setTimeout(() => callback(...args), delay);
//     },
//     [callback, delay]
//   );

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   return debouncedCallback;
// };

// const statusColors = {
//   active: "#93BD57", // Green
//   inactive: "#F96E5B", // Red
// };

// const statusLabels = {
//   active: "Active",
//   inactive: "Inactive",
// };

// const PropertyManagerRow = ({
//   manager,
//   onEdit,
//   onDelete,
//   onStatusToggle,
//   isExpanded,
//   onToggleRow,
// }) => {
//   const currentStatus = manager.status || "inactive";
//   const isRowDisabled = currentStatus === "inactive";

//   return (
//     <React.Fragment>
//       <TableRow
//         sx={{
//           "& > *": { borderBottom: "unset" },
//           opacity: isRowDisabled ? 0.6 : 1,
//           backgroundColor: isRowDisabled ? "rgba(0,0,0,0.02)" : "inherit",
//           "&:hover": {
//             backgroundColor: isRowDisabled
//               ? "rgba(0,0,0,0.04)"
//               : "rgba(111, 11, 20, 0.04)",
//           },
//         }}
//       >
//         <TableCell className="p-4">
//           <IconButton
//             aria-label="expand row"
//             size="small"
//             onClick={() => onToggleRow(manager.id)}
//             disabled={isRowDisabled}
//             className="text-primary"
//           >
//             {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
//           </IconButton>
//         </TableCell>

//         <TableCell className="p-4">
//           <Typography className="font-roboto text-sm font-medium">
//             #{manager.id.toString().padStart(3, "0")}
//           </Typography>
//         </TableCell>

//         {/* <TableCell className="p-4">
//           <Typography className="font-roboto text-sm">
//             {manager.registerDate}
//           </Typography>
//         </TableCell> */}

//         <TableCell className="p-4">
//           <div className="flex items-center gap-3">
//             <Avatar
//               className="bg-primary text-white font-roboto font-medium"
//               sx={{
//                 opacity: isRowDisabled ? 0.7 : 1,
//                 bgcolor: isRowDisabled ? "#9ca3af" : "#6F0B14",
//               }}
//             >
//               {manager.avatar}
//             </Avatar>
//             <div>
//               <Typography
//                 className="font-roboto font-medium text-sm"
//                 sx={{ color: isRowDisabled ? "#6b7280" : "inherit" }}
//               >
//                 {manager.name}
//               </Typography>
//             </div>
//           </div>
//         </TableCell>

//         <TableCell className="p-4">
//           <Typography
//             className="font-roboto text-sm break-all"
//             sx={{ color: isRowDisabled ? "#6b7280" : "inherit" }}
//           >
//             {manager.email}
//           </Typography>
//         </TableCell>

//         <TableCell className="p-4">
//           <Chip
//             label={manager.assignedBuildings}
//             className="font-roboto font-medium"
//             sx={{
//               backgroundColor: isRowDisabled
//                 ? "rgba(156, 163, 175, 0.1)"
//                 : "rgba(111, 11, 20, 0.09)",
//               color: isRowDisabled ? "#9ca3af" : "#6F0B14",
//               opacity: isRowDisabled ? 0.7 : 1,
//             }}
//             size="small"
//           />
//         </TableCell>

//         <TableCell className="p-4">
//           <FormControlLabel
//             control={
//               <PrimarySwitch
//                 checked={currentStatus === "active"}
//                 onChange={(e) => onStatusToggle(manager.id, currentStatus)}
//                 size="small"
//               />
//             }
//             label={
//               <span
//                 style={{
//                   fontSize: "0.75rem",
//                   fontWeight: 500,
//                   color: currentStatus === "active" ? "#93BD57" : "#F96E5B",
//                 }}
//               >
//                 {statusLabels[currentStatus]}
//               </span>
//             }
//             sx={{
//               m: 0,
//               minWidth: 110,
//               "& .MuiFormControlLabel-label": {
//                 marginLeft: 0.5,
//               },
//             }}
//           />
//         </TableCell>

//         <TableCell className="p-4">
//           <div className="flex items-center gap-1">
//             <IconButton
//               size="small"
//               onClick={() => onEdit(manager.id)}
//               disabled={isRowDisabled}
//               className="text-primary hover:bg-[rgba(111,11,20,0.09)]"
//               sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
//             >
//               <Edit fontSize="small" />
//             </IconButton>
//             <IconButton
//               size="small"
//               onClick={() => onDelete(manager.id)}
//               disabled={isRowDisabled}
//               className="text-[#B31B1B] hover:bg-[rgba(179,27,27,0.09)]"
//               sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
//             >
//               <Delete fontSize="small" />
//             </IconButton>
//           </div>
//         </TableCell>
//       </TableRow>

//       {/* Collapsible Details Row */}
//       <TableRow>
//         <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
//           <Collapse in={isExpanded} timeout="auto" unmountOnExit>
//             <Box sx={{ margin: 1, py: 3 }}>
//               {manager.loading ? (
//                 <Box display="flex" justifyContent="center" p={2}>
//                   <CircularProgress size={24} />
//                 </Box>
//               ) : (
//                 <>
//                   <Typography
//                     variant="h6"
//                     className="font-roboto font-medium text-primary mb-4"
//                   >
//                     Manager Details
//                   </Typography>

//                   <Box
//                     sx={{
//                       mb: 3,
//                       p: 3,
//                       bgcolor: "rgba(111, 11, 20, 0.04)",
//                       borderRadius: 2,
//                       border: "1px solid rgba(111, 11, 20, 0.1)",
//                     }}
//                   >
//                     <Typography
//                       variant="body1"
//                       fontWeight="bold"
//                       className="font-roboto text-primary mb-2"
//                     >
//                       {manager.name}
//                     </Typography>
//                     <Typography variant="body2" className="font-roboto mb-1">
//                       <strong>Email:</strong> {manager.email}
//                     </Typography>
//                     <Typography variant="body2" className="font-roboto mb-1">
//                       <strong>Register Date:</strong> {manager.registerDate}
//                     </Typography>
//                     <Typography variant="body2" className="font-roboto">
//                       <strong>Status:</strong>
//                       <Box
//                         component="span"
//                         sx={{
//                           ml: 1,
//                           px: 2,
//                           py: 0.5,
//                           borderRadius: 1,
//                           fontSize: "0.75rem",
//                           fontWeight: "bold",
//                           bgcolor: statusColors[currentStatus] + "20",
//                           color: statusColors[currentStatus],
//                           border: `1px solid ${statusColors[currentStatus]}40`,
//                         }}
//                       >
//                         {statusLabels[currentStatus]}
//                       </Box>
//                     </Typography>
//                   </Box>

//                   <Typography
//                     variant="h6"
//                     gutterBottom
//                     className="font-roboto font-medium mb-3"
//                   >
//                     Contact Information
//                   </Typography>

//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//                     <motion.div
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.1 }}
//                       className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
//                     >
//                       <LocationOn className="text-primary mt-1" />
//                       <div>
//                         <Typography className="font-roboto font-medium text-sm text-gray-600 mb-1">
//                           Location
//                         </Typography>
//                         <Typography className="font-roboto text-sm">
//                           {manager.address.city}, {manager.address.state}
//                         </Typography>
//                         <Typography className="font-roboto text-sm text-gray-500">
//                           {manager.address.country}
//                         </Typography>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.2 }}
//                       className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
//                     >
//                       <Phone className="text-primary mt-1" />
//                       <div>
//                         <Typography className="font-roboto font-medium text-sm text-gray-600 mb-1">
//                           Contact Number
//                         </Typography>
//                         <Typography className="font-roboto text-sm">
//                           {manager.address.contact}
//                         </Typography>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.3 }}
//                       className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
//                     >
//                       <WhatsApp className="text-green-600 mt-1" />
//                       <div>
//                         <Typography className="font-roboto font-medium text-sm text-gray-600 mb-1">
//                           WhatsApp
//                         </Typography>
//                         <Typography className="font-roboto text-sm">
//                           {manager.address.whatsapp}
//                         </Typography>
//                       </div>
//                     </motion.div>

//                     <motion.div
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.4 }}
//                       className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
//                     >
//                       <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
//                         <Typography className="font-roboto font-medium text-white text-sm">
//                           {manager.assignedBuildings}
//                         </Typography>
//                       </div>
//                       <div>
//                         <Typography className="font-roboto font-medium text-sm text-gray-600 mb-1">
//                           Assigned Buildings
//                         </Typography>
//                         <Typography className="font-roboto text-sm">
//                           {manager.assignedBuildings} properties
//                         </Typography>
//                       </div>
//                     </motion.div>
//                   </div>

//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.5 }}
//                     className="mt-6 pt-4 border-t border-gray-200"
//                   >
//                     <div className="flex justify-end gap-3">
//                       <button
//                         onClick={() => onEdit(manager.id)}
//                         disabled={isRowDisabled}
//                         className="px-4 py-2 bg-primary text-white font-roboto font-medium rounded-lg hover:bg-[#5a090f] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         Edit Manager
//                       </button>
//                       <button
//                         onClick={() => onDelete(manager.id)}
//                         disabled={isRowDisabled}
//                         className="px-4 py-2 bg-white text-[#B31B1B] font-roboto font-medium rounded-lg border border-[#B31B1B] hover:bg-[rgba(179,27,27,0.04)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </motion.div>
//                 </>
//               )}
//             </Box>
//           </Collapse>
//         </TableCell>
//       </TableRow>
//     </React.Fragment>
//   );
// };

// // Mobile Card View with new design
// const PropertyManagerCard = ({ manager, onEdit, onDelete, onStatusToggle }) => {
//   const [expanded, setExpanded] = useState(false);
//   const currentStatus = manager.status || "inactive";
//   const isRowDisabled = currentStatus === "inactive";

//   const handleEdit = () => {
//     onEdit(manager.id);
//   };

//   const handleDelete = () => {
//     onDelete(manager.id);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.3 }}
//       className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//       style={{ opacity: isRowDisabled ? 0.7 : 1 }}
//     >
//       <div className="p-4">
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center gap-3">
//             <Avatar
//               className="font-roboto font-medium"
//               sx={{
//                 bgcolor: isRowDisabled ? "#9ca3af" : "#6F0B14",
//                 color: "white",
//               }}
//             >
//               {manager.avatar}
//             </Avatar>
//             <div>
//               <Typography
//                 className="font-roboto font-medium"
//                 sx={{ color: isRowDisabled ? "#6b7280" : "#6F0B14" }}
//               >
//                 {manager.name}
//               </Typography>
//               <Typography className="font-roboto text-xs text-gray-500">
//                 #{manager.id.toString().padStart(3, "0")}
//               </Typography>
//             </div>
//           </div>
//           <div className="flex items-center gap-1">
//             <FormControlLabel
//               control={
//                 <PrimarySwitch
//                   checked={currentStatus === "active"}
//                   onChange={(e) => onStatusToggle(manager.id, currentStatus)}
//                   size="small"
//                 />
//               }
//               sx={{ m: 0 }}
//             />
//             <IconButton
//               size="small"
//               onClick={() => setExpanded(!expanded)}
//               className="text-primary"
//             >
//               {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
//             </IconButton>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3 mb-4">
//           <div>
//             <Typography className="font-roboto text-xs text-gray-500 mb-1">
//               Register Date
//             </Typography>
//             <Typography className="font-roboto text-sm font-medium">
//               {manager.registerDate}
//             </Typography>
//           </div>
//           <div>
//             <Typography className="font-roboto text-xs text-gray-500 mb-1">
//               Email
//             </Typography>
//             <Typography className="font-roboto text-sm font-medium break-all">
//               {manager.email}
//             </Typography>
//           </div>
//           <div>
//             <Typography className="font-roboto text-xs text-gray-500 mb-1">
//               Buildings
//             </Typography>
//             <Chip
//               label={manager.assignedBuildings}
//               className="font-roboto font-medium"
//               sx={{
//                 backgroundColor: isRowDisabled
//                   ? "rgba(156, 163, 175, 0.1)"
//                   : "rgba(111, 11, 20, 0.09)",
//                 color: isRowDisabled ? "#9ca3af" : "#6F0B14",
//               }}
//               size="small"
//             />
//           </div>
//           <div>
//             <Typography className="font-roboto text-xs text-gray-500 mb-1">
//               Status
//             </Typography>
//             <Typography
//               className="font-roboto text-xs font-medium px-2 py-1 rounded"
//               style={{
//                 backgroundColor: statusColors[currentStatus] + "20",
//                 color: statusColors[currentStatus],
//                 display: "inline-block",
//               }}
//             >
//               {statusLabels[currentStatus]}
//             </Typography>
//           </div>
//         </div>

//         <div className="flex justify-between items-center">
//           <div className="flex gap-2">
//             <IconButton
//               size="small"
//               onClick={handleEdit}
//               disabled={isRowDisabled}
//               className="text-primary hover:bg-[rgba(111,11,20,0.09)]"
//               sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
//             >
//               <Edit fontSize="small" />
//             </IconButton>
//             <IconButton
//               size="small"
//               onClick={handleDelete}
//               disabled={isRowDisabled}
//               className="text-[#B31B1B] hover:bg-[rgba(179,27,27,0.09)]"
//               sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
//             >
//               <Delete fontSize="small" />
//             </IconButton>
//           </div>
//         </div>
//       </div>

//       <Collapse in={expanded}>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.3 }}
//           className="p-4 bg-[rgba(111,11,20,0.04)] border-t border-gray-200"
//         >
//           <Typography className="font-roboto font-medium text-primary mb-3">
//             Contact Details
//           </Typography>

//           <div className="space-y-3">
//             <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//               <LocationOn className="text-primary mt-1" fontSize="small" />
//               <div>
//                 <Typography className="font-roboto text-xs text-gray-500 mb-1">
//                   Location
//                 </Typography>
//                 <Typography className="font-roboto text-sm">
//                   {manager.address.city}, {manager.address.state},{" "}
//                   {manager.address.country}
//                 </Typography>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//               <Phone className="text-primary mt-1" fontSize="small" />
//               <div>
//                 <Typography className="font-roboto text-xs text-gray-500 mb-1">
//                   Contact
//                 </Typography>
//                 <Typography className="font-roboto text-sm">
//                   {manager.address.contact}
//                 </Typography>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
//               <WhatsApp className="text-green-600 mt-1" fontSize="small" />
//               <div>
//                 <Typography className="font-roboto text-xs text-gray-500 mb-1">
//                   WhatsApp
//                 </Typography>
//                 <Typography className="font-roboto text-sm">
//                   {manager.address.whatsapp}
//                 </Typography>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </Collapse>
//     </motion.div>
//   );
// };

// export default function PropertyManager() {
//   const [managers, setManagers] = useState(initialManagers);
//   const theme = useTheme();
//   const [openDialog, setOpenDialog] = useState(false);
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const [selectedManager, setSelectedManager] = useState(null);
//   const [openRows, setOpenRows] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);
//   const [totalCount, setTotalCount] = useState(initialManagers.length);

//   // Table headers
//   const headers = [
//     "",
//     "ID",
//     "Name",
//     "Email ID",
//     "Assigned Buildings",
//     "Status",
//     "Actions",
//   ];

//   const handleStatusToggle = useCallback(async (managerId, currentStatus) => {
//     const newStatus = currentStatus === "active" ? "inactive" : "active";

//     // Optimistic update
//     setManagers((prev) =>
//       prev.map((manager) =>
//         manager.id === managerId ? { ...manager, status: newStatus } : manager
//       )
//     );

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       // Here you would make your actual API call
//       // await axiosInstance.put("/api/v1/manager/status", {
//       //   id: managerId,
//       //   status: newStatus,
//       // });

//       toast.success(
//         `Manager ${
//           newStatus === "active" ? "activated" : "deactivated"
//         } successfully!`
//       );
//     } catch (error) {
//       // Revert optimistic update on error
//       setManagers((prev) =>
//         prev.map((manager) =>
//           manager.id === managerId
//             ? { ...manager, status: currentStatus }
//             : manager
//         )
//       );
//       console.error("Status update error:", error);
//       toast.error("Failed to update status");
//     }
//   }, []);

//   // Handle row toggle
//   const handleToggleRow = useCallback(
//     (managerId) => {
//       const isCurrentlyOpen = openRows[managerId];

//       if (isCurrentlyOpen) {
//         setOpenRows((prev) => ({ ...prev, [managerId]: false }));
//       } else {
//         setOpenRows((prev) => ({ ...prev, [managerId]: true }));

//         // Simulate loading manager details
//         setManagers((prev) =>
//           prev.map((manager) =>
//             manager.id === managerId ? { ...manager, loading: true } : manager
//           )
//         );

//         // Simulate API call to fetch manager details
//         setTimeout(() => {
//           setManagers((prev) =>
//             prev.map((manager) =>
//               manager.id === managerId
//                 ? { ...manager, loading: false }
//                 : manager
//             )
//           );
//         }, 500);
//       }
//     },
//     [openRows]
//   );

//   const handleEditManager = (id) => {
//     const manager = managers.find((m) => m.id === id);
//     setSelectedManager(manager);
//     setOpenDialog(true);
//   };

//   const handleDeleteManager = (id) => {
//     if (window.confirm("Are you sure you want to delete this manager?")) {
//       setManagers((prev) => prev.filter((manager) => manager.id !== id));
//       toast.success("Manager deleted successfully!");
//     }
//   };

//   const handleAddNewManager = () => {
//     setSelectedManager(null);
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setSelectedManager(null);
//   };

//   const handleManagerSubmit = (managerData) => {
//     if (selectedManager) {
//       // Update existing manager
//       setManagers((prev) =>
//         prev.map((m) =>
//           m.id === managerData.id ? { ...m, ...managerData } : m
//         )
//       );
//       toast.success("Manager updated successfully!");
//     } else {
//       // Add new manager - default status is "active"
//       const newManager = {
//         ...managerData,
//         id: Math.max(...managers.map((m) => m.id)) + 1,
//         registerDate: new Date().toISOString().split("T")[0],
//         status: "active", // Default status is active
//         avatar: managerData.name
//           .split(" ")
//           .map((n) => n[0])
//           .join(""),
//       };
//       setManagers((prev) => [newManager, ...prev]);
//       toast.success("Manager added successfully!");
//     }
//     setOpenDialog(false);
//     setSelectedManager(null);
//   };

//   // Handle pagination
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Calculate paginated managers
//   const paginatedManagers = managers.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage
//   );

//   return (
//     <div className="min-h-screen p-4 md:p-6 font-roboto">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="mx-auto"
//       >
//         {/* Header with Add Button */}
//         <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <Typography
//               variant="h4"
//               className="font-roboto font-bold text-primary mb-2"
//             >
//               Property Managers
//             </Typography>
//             <Typography className="font-roboto text-gray-600">
//               Manage all property managers and their assigned buildings
//             </Typography>
//           </div>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2 }}
//             whileHover={{ scale: 1.02 }}
//             className="inline-block"
//           >
//             <button
//               onClick={handleAddNewManager}
//               className="
//                 group
//                 bg-white
//                 font-roboto
//                 font-medium
//                 px-8
//                 py-3.5
//                 text-primary
//                 text-sm
//                 rounded-xl
//                 border-2
//                 border-primary
//                 hover:bg-primary
//                 hover:text-white
//                 transition-all
//                 duration-300
//                 relative
//                 overflow-hidden
//                 flex
//                 items-center
//                 gap-3
//                 shadow-sm
//                 hover:shadow-md
//               "
//             >
//               <motion.div
//                 className="absolute bottom-0 left-0 h-0.5 bg-primary group-hover:bg-white"
//                 initial={{ width: "0%" }}
//                 whileHover={{ width: "100%" }}
//                 transition={{ duration: 0.3 }}
//               />

//               <svg
//                 className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 4v16m8-8H4"
//                 />
//               </svg>
//               <span className="tracking-wide">New Manager</span>

//               <div
//                 className="
//                   absolute
//                   inset-0
//                   bg-primary
//                   transform
//                   -translate-x-full
//                   group-hover:translate-x-0
//                   transition-transform
//                   duration-300
//                   -z-10
//                 "
//               />
//             </button>
//           </motion.div>
//         </div>

//         {/* Main Content */}
//         <Card className="rounded-xl overflow-hidden border border-gray-200">
//           <CardContent className="p-0">
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 mb: 3,
//                 p: 3,
//                 borderBottom: "1px solid rgba(0,0,0,0.1)",
//               }}
//             >
//               <Typography variant="h6" className="font-roboto font-medium">
//                 List Of Property Managers ({totalCount})
//               </Typography>
//               {loading && <CircularProgress size={24} />}
//             </Box>

//             {loading ? (
//               <Box display="flex" justifyContent="center" p={4}>
//                 <CircularProgress />
//               </Box>
//             ) : managers.length === 0 ? (
//               <Alert severity="info" sx={{ m: 3 }}>
//                 No property managers found. Add your first manager!
//               </Alert>
//             ) : (
//               <>
//                 {!isMobile ? (
//                   // Desktop Table View
//                   <Paper sx={{ width: "100%", overflow: "hidden" }}>
//                     <TableContainer>
//                       <Table aria-label="collapsible property managers table">
//                         <TableHead sx={{ backgroundColor: "#1E293B" }}>
//                           <TableRow>
//                             {headers.map((header, index) => (
//                               <TableCell
//                                 key={index}
//                                 sx={{
//                                   color: "#fff",
//                                   fontWeight: 600,
//                                   textTransform: "uppercase",
//                                   letterSpacing: "0.05em",
//                                   borderBottom: "none",
//                                   fontSize: "0.875rem",
//                                 }}
//                                 align={
//                                   header === "Assigned Buildings" ||
//                                   header === "Status" ||
//                                   header === "Actions"
//                                     ? "center"
//                                     : header === "ID"
//                                     ? "left"
//                                     : "left"
//                                 }
//                               >
//                                 {header}
//                               </TableCell>
//                             ))}
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {paginatedManagers.map((manager) => (
//                             <PropertyManagerRow
//                               key={manager.id}
//                               manager={manager}
//                               onEdit={handleEditManager}
//                               onDelete={handleDeleteManager}
//                               onStatusToggle={handleStatusToggle}
//                               onToggleRow={handleToggleRow}
//                               isExpanded={!!openRows[manager.id]}
//                             />
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </Paper>
//                 ) : (
//                   // Mobile Card View
//                   <div className="p-4">
//                     <AnimatePresence>
//                       {paginatedManagers.map((manager) => (
//                         <PropertyManagerCard
//                           key={manager.id}
//                           manager={manager}
//                           onEdit={handleEditManager}
//                           onDelete={handleDeleteManager}
//                           onStatusToggle={handleStatusToggle}
//                         />
//                       ))}
//                     </AnimatePresence>
//                   </div>
//                 )}

//                 {/* Pagination */}
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "center",
//                     mt: 3,
//                     pb: 2,
//                   }}
//                 >
//                   <TablePagination
//                     rowsPerPageOptions={[5, 10, 25]}
//                     component="div"
//                     count={totalCount}
//                     rowsPerPage={rowsPerPage}
//                     page={page}
//                     onPageChange={handleChangePage}
//                     onRowsPerPageChange={handleChangeRowsPerPage}
//                     labelRowsPerPage="Managers per page:"
//                   />
//                 </Box>
//               </>
//             )}
//           </CardContent>
//         </Card>

//         {/* Add/Edit Manager Dialog */}
//         <AddManagerDialog
//           open={openDialog}
//           onClose={handleCloseDialog}
//           onSubmit={handleManagerSubmit}
//           manager={selectedManager}
//           isEdit={!!selectedManager}
//         />
//       </motion.div>
//     </div>
//   );
// }

// // Updated initialManagers array - removed "pending" status
// const initialManagers = [
//   {
//     id: 1,
//     registerDate: "2024-01-15",
//     name: "John Smith",
//     email: "john.smith@example.com",
//     assignedBuildings: 5,
//     status: "active",
//     address: {
//       city: "New York",
//       state: "NY",
//       country: "USA",
//       contact: "+1 (555) 123-4567",
//       whatsapp: "+1 (555) 123-4567",
//     },
//     avatar: "JS",
//   },
//   {
//     id: 2,
//     registerDate: "2024-02-20",
//     name: "Sarah Johnson",
//     email: "sarah.j@example.com",
//     assignedBuildings: 3,
//     status: "inactive",
//     address: {
//       city: "Los Angeles",
//       state: "CA",
//       country: "USA",
//       contact: "+1 (555) 987-6543",
//       whatsapp: "+1 (555) 987-6543",
//     },
//     avatar: "SJ",
//   },
//   {
//     id: 3,
//     registerDate: "2024-03-10",
//     name: "Michael Chen",
//     email: "m.chen@example.com",
//     assignedBuildings: 8,
//     status: "active",
//     address: {
//       city: "Chicago",
//       state: "IL",
//       country: "USA",
//       contact: "+1 (555) 456-7890",
//       whatsapp: "+1 (555) 456-7890",
//     },
//     avatar: "MC",
//   },
//   {
//     id: 4,
//     registerDate: "2024-01-05",
//     name: "Emma Wilson",
//     email: "emma.w@example.com",
//     assignedBuildings: 2,
//     status: "active", // Changed from "pending" to "active"
//     address: {
//       city: "Miami",
//       state: "FL",
//       country: "USA",
//       contact: "+1 (555) 234-5678",
//       whatsapp: "+1 (555) 234-5678",
//     },
//     avatar: "EW",
//   },
//   {
//     id: 5,
//     registerDate: "2024-02-28",
//     name: "David Brown",
//     email: "david.b@example.com",
//     assignedBuildings: 6,
//     status: "active",
//     address: {
//       city: "Seattle",
//       state: "WA",
//       country: "USA",
//       contact: "+1 (555) 876-5432",
//       whatsapp: "+1 (555) 876-5432",
//     },
//     avatar: "DB",
//   },
// ];
import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Button,
  CircularProgress,
  TablePagination,
  FormControlLabel,
  Switch,
  styled,
  Card,
  CardContent,
  InputAdornment,
  TextField,
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
  Add as AddIcon,
  Refresh,
  MoreVert,
  LocationOn,
  Phone,
  WhatsApp,
  Email,
  Business,
  CalendarToday,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import AddManagerDialog from "../../components/dialogs/AddManagerDialog";
import { toast } from "react-toastify";

// Custom styled switch for property managers
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

// Debounce hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef();

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

const statusColors = {
  active: "#93BD57",
  inactive: "#F96E5B",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
};

const PropertyManagerRow = ({
  manager,
  onEdit,
  onDelete,
  onStatusToggle,
  isExpanded,
  onToggleRow,
}) => {
  const currentStatus = manager.status || "inactive";
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
            onClick={() => onToggleRow(manager.id)}
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
            #{manager.id.toString().padStart(3, "0")}
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
              {manager.avatar}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold text-sm"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {manager.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                ID: {manager.id.toString().padStart(3, "0")}
              </Typography>
            </div>
          </div>
        </TableCell>

        <TableCell className="p-4">
          <Typography
            className="font-roboto text-sm break-all"
            sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
          >
            {manager.email}
          </Typography>
        </TableCell>

        <TableCell className="p-4">
          <Chip
            label={`${manager.assignedBuildings} building${
              manager.assignedBuildings !== 1 ? "s" : ""
            }`}
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

        <TableCell className="p-4">
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <PrimarySwitch
                  checked={currentStatus === "active"}
                  onChange={(e) => onStatusToggle(manager.id, currentStatus)}
                  size="small"
                />
              }
              sx={{ m: 0 }}
            />
            <IconButton
              size="small"
              onClick={() => onEdit(manager.id)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(manager.id)}
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 3 }}>
              {manager.loading ? (
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
                      Manager Details
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
                          Basic Information
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
                              {manager.avatar}
                            </Avatar>
                            <div>
                              <Typography className="font-roboto font-semibold">
                                {manager.name}
                              </Typography>
                              <Typography className="font-roboto text-sm text-hintText">
                                Property Manager
                              </Typography>
                            </div>
                          </div>
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-start gap-2">
                              <Email
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Email
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {manager.email}
                                </Typography>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CalendarToday
                                className="text-primary mt-0.5"
                                fontSize="small"
                              />
                              <div>
                                <Typography className="font-roboto text-xs text-hintText">
                                  Register Date
                                </Typography>
                                <Typography className="font-roboto text-sm">
                                  {manager.registerDate}
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
                          <div className="flex items-start gap-2">
                            <LocationOn
                              className="text-primary mt-0.5"
                              fontSize="small"
                            />
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                Location
                              </Typography>
                              <Typography className="font-roboto text-sm">
                                {manager.address.city}, {manager.address.state}
                              </Typography>
                              <Typography className="font-roboto text-xs text-hintText">
                                {manager.address.country}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone
                              className="text-primary mt-0.5"
                              fontSize="small"
                            />
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                Contact Number
                              </Typography>
                              <Typography className="font-roboto text-sm">
                                {manager.address.contact}
                              </Typography>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <WhatsApp
                              className="text-green-600 mt-0.5"
                              fontSize="small"
                            />
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                WhatsApp
                              </Typography>
                              <Typography className="font-roboto text-sm">
                                {manager.address.whatsapp}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance & Stats */}
                    <Card className="rounded-xl border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <Typography
                          className="font-roboto font-semibold text-primary mb-4"
                          variant="subtitle1"
                        >
                          Performance & Stats
                        </Typography>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-lightBackground rounded-lg">
                            <div>
                              <Typography className="font-roboto text-xs text-hintText">
                                Assigned Buildings
                              </Typography>
                              <Typography className="font-roboto font-semibold text-2xl text-primary">
                                {manager.assignedBuildings}
                              </Typography>
                            </div>
                            <Business className="text-primary" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText">
                                Active Buildings
                              </Typography>
                              <Typography className="font-roboto font-semibold text-lg">
                                {Math.floor(manager.assignedBuildings * 0.8)}
                              </Typography>
                            </div>
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                              <Typography className="font-roboto text-xs text-hintText">
                                Occupancy Rate
                              </Typography>
                              <Typography className="font-roboto font-semibold text-lg">
                                85%
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end gap-3 pt-4 border-t border-gray-200"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => onDelete(manager.id)}
                      disabled={isRowDisabled}
                      className="font-roboto font-medium border-reject text-reject hover:bg-[rgba(179,27,27,0.04)]"
                      sx={{ textTransform: "none" }}
                    >
                      Remove Manager
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => onEdit(manager.id)}
                      disabled={isRowDisabled}
                      className="font-roboto font-medium bg-primary hover:bg-[#5a090f]"
                      sx={{ textTransform: "none" }}
                    >
                      Edit Manager
                    </Button>
                  </motion.div>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

// Mobile Card View
const PropertyManagerCard = ({ manager, onEdit, onDelete, onStatusToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const currentStatus = manager.status || "inactive";
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
              {manager.avatar}
            </Avatar>
            <div>
              <Typography
                className="font-roboto font-semibold"
                sx={{ color: isRowDisabled ? "#6b7280" : "#1E293B" }}
              >
                {manager.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                #{manager.id.toString().padStart(3, "0")}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <PrimarySwitch
                  checked={currentStatus === "active"}
                  onChange={(e) => onStatusToggle(manager.id, currentStatus)}
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
              Email
            </Typography>
            <Typography className="font-roboto text-sm font-medium break-all">
              {manager.email}
            </Typography>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Buildings
            </Typography>
            <Chip
              label={manager.assignedBuildings}
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
              Register Date
            </Typography>
            <Typography className="font-roboto text-sm font-medium">
              {manager.registerDate}
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

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <IconButton
              size="small"
              onClick={() => onEdit(manager.id)}
              disabled={isRowDisabled}
              className="text-primary hover:bg-lightBackground"
              sx={{ opacity: isRowDisabled ? 0.5 : 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(manager.id)}
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
            Contact Details
          </Typography>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <LocationOn className="text-primary mt-0.5" fontSize="small" />
              <div>
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Location
                </Typography>
                <Typography className="font-roboto text-sm">
                  {manager.address.city}, {manager.address.state},{" "}
                  {manager.address.country}
                </Typography>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Phone className="text-primary mt-0.5" fontSize="small" />
              <div>
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  Contact
                </Typography>
                <Typography className="font-roboto text-sm">
                  {manager.address.contact}
                </Typography>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <WhatsApp className="text-green-600 mt-0.5" fontSize="small" />
              <div>
                <Typography className="font-roboto text-xs text-hintText mb-1">
                  WhatsApp
                </Typography>
                <Typography className="font-roboto text-sm">
                  {manager.address.whatsapp}
                </Typography>
              </div>
            </div>
          </div>
        </motion.div>
      </Collapse>
    </motion.div>
  );
};

export default function PropertyManager() {
  const [managers, setManagers] = useState(initialManagers);
  const [filteredManagers, setFilteredManagers] = useState(initialManagers);
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedManager, setSelectedManager] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Table headers
  const headers = ["", "ID", "Name", "Email", "Buildings", "Status", "Actions"];

  // Filter managers based on search and status
  useEffect(() => {
    let filtered = managers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (manager) =>
          manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          manager.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((manager) => manager.status === statusFilter);
    }

    setFilteredManagers(filtered);
    setPage(0); // Reset to first page when filters change
  }, [managers, searchTerm, statusFilter]);

  const handleStatusToggle = useCallback(async (managerId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // Optimistic update
    setManagers((prev) =>
      prev.map((manager) =>
        manager.id === managerId ? { ...manager, status: newStatus } : manager
      )
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(
        `Manager ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      setManagers((prev) =>
        prev.map((manager) =>
          manager.id === managerId
            ? { ...manager, status: currentStatus }
            : manager
        )
      );
      toast.error("Failed to update status");
    }
  }, []);

  const handleToggleRow = useCallback(
    (managerId) => {
      const isCurrentlyOpen = openRows[managerId];

      if (isCurrentlyOpen) {
        setOpenRows((prev) => ({ ...prev, [managerId]: false }));
      } else {
        setOpenRows((prev) => ({ ...prev, [managerId]: true }));

        setManagers((prev) =>
          prev.map((manager) =>
            manager.id === managerId ? { ...manager, loading: true } : manager
          )
        );

        setTimeout(() => {
          setManagers((prev) =>
            prev.map((manager) =>
              manager.id === managerId
                ? { ...manager, loading: false }
                : manager
            )
          );
        }, 500);
      }
    },
    [openRows]
  );

  const handleEditManager = (id) => {
    const manager = managers.find((m) => m.id === id);
    setSelectedManager(manager);
    setOpenDialog(true);
  };

  const handleDeleteManager = (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      setManagers((prev) => prev.filter((manager) => manager.id !== id));
      toast.success("Manager deleted successfully!");
    }
  };

  const handleAddNewManager = () => {
    setSelectedManager(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedManager(null);
  };

  const handleManagerSubmit = (managerData) => {
    if (selectedManager) {
      setManagers((prev) =>
        prev.map((m) =>
          m.id === managerData.id ? { ...m, ...managerData } : m
        )
      );
      toast.success("Manager updated successfully!");
    } else {
      const newManager = {
        ...managerData,
        id: Math.max(...managers.map((m) => m.id)) + 1,
        registerDate: new Date().toISOString().split("T")[0],
        status: "active",
        avatar: managerData.name
          .split(" ")
          .map((n) => n[0])
          .join(""),
      };
      setManagers((prev) => [newManager, ...prev]);
      toast.success("Manager added successfully!");
    }
    setOpenDialog(false);
    setSelectedManager(null);
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

  const paginatedManagers = filteredManagers.slice(
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
                Property Managers
              </Typography>
              <Typography className="font-roboto text-gray-600">
                Manage and monitor all property managers
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
                onClick={handleAddNewManager}
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
                <span className="tracking-wide">New Manager</span>

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
                All Managers ({filteredManagers.length})
              </Typography>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <TextField
                  placeholder="Search managers..."
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

            {/* Active Filters Display */}
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

        {/* Managers Table/Cards */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredManagers.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No property managers found. Add your first manager!
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
                              header === "Buildings" ||
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
                      {paginatedManagers.map((manager) => (
                        <PropertyManagerRow
                          key={manager.id}
                          manager={manager}
                          onEdit={handleEditManager}
                          onDelete={handleDeleteManager}
                          onStatusToggle={handleStatusToggle}
                          onToggleRow={handleToggleRow}
                          isExpanded={!!openRows[manager.id]}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // Mobile Card View
                <div className="p-4">
                  <AnimatePresence>
                    {paginatedManagers.map((manager) => (
                      <PropertyManagerCard
                        key={manager.id}
                        manager={manager}
                        onEdit={handleEditManager}
                        onDelete={handleDeleteManager}
                        onStatusToggle={handleStatusToggle}
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
                  {Math.min(page * rowsPerPage + 1, filteredManagers.length)} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredManagers.length)}{" "}
                  of {filteredManagers.length} managers
                </Typography>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredManagers.length}
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

        {/* Add/Edit Manager Dialog */}
        <AddManagerDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={handleManagerSubmit}
          manager={selectedManager}
          isEdit={!!selectedManager}
        />
      </motion.div>
    </div>
  );
}

// Initial managers data
const initialManagers = [
  {
    id: 1,
    registerDate: "2024-01-15",
    name: "John Smith",
    email: "john.smith@example.com",
    assignedBuildings: 5,
    status: "active",
    address: {
      city: "New York",
      state: "NY",
      country: "USA",
      contact: "+1 (555) 123-4567",
      whatsapp: "+1 (555) 123-4567",
    },
    avatar: "JS",
  },
  {
    id: 2,
    registerDate: "2024-02-20",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    assignedBuildings: 3,
    status: "inactive",
    address: {
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      contact: "+1 (555) 987-6543",
      whatsapp: "+1 (555) 987-6543",
    },
    avatar: "SJ",
  },
  {
    id: 3,
    registerDate: "2024-03-10",
    name: "Michael Chen",
    email: "m.chen@example.com",
    assignedBuildings: 8,
    status: "active",
    address: {
      city: "Chicago",
      state: "IL",
      country: "USA",
      contact: "+1 (555) 456-7890",
      whatsapp: "+1 (555) 456-7890",
    },
    avatar: "MC",
  },
  {
    id: 4,
    registerDate: "2024-01-05",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    assignedBuildings: 2,
    status: "active",
    address: {
      city: "Miami",
      state: "FL",
      country: "USA",
      contact: "+1 (555) 234-5678",
      whatsapp: "+1 (555) 234-5678",
    },
    avatar: "EW",
  },
  {
    id: 5,
    registerDate: "2024-02-28",
    name: "David Brown",
    email: "david.b@example.com",
    assignedBuildings: 6,
    status: "active",
    address: {
      city: "Seattle",
      state: "WA",
      country: "USA",
      contact: "+1 (555) 876-5432",
      whatsapp: "+1 (555) 876-5432",
    },
    avatar: "DB",
  },
  {
    id: 6,
    registerDate: "2024-03-15",
    name: "Lisa Wang",
    email: "lisa.wang@example.com",
    assignedBuildings: 4,
    status: "active",
    address: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
      contact: "+1 (555) 345-6789",
      whatsapp: "+1 (555) 345-6789",
    },
    avatar: "LW",
  },
  {
    id: 7,
    registerDate: "2024-03-20",
    name: "Robert Garcia",
    email: "robert.g@example.com",
    assignedBuildings: 7,
    status: "inactive",
    address: {
      city: "Austin",
      state: "TX",
      country: "USA",
      contact: "+1 (555) 567-8901",
      whatsapp: "+1 (555) 567-8901",
    },
    avatar: "RG",
  },
  {
    id: 8,
    registerDate: "2024-01-30",
    name: "Maria Rodriguez",
    email: "maria.r@example.com",
    assignedBuildings: 3,
    status: "active",
    address: {
      city: "Denver",
      state: "CO",
      country: "USA",
      contact: "+1 (555) 678-9012",
      whatsapp: "+1 (555) 678-9012",
    },
    avatar: "MR",
  },
];
