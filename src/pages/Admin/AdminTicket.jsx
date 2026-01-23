// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   Chip,
//   IconButton,
//   TextField,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Avatar,
//   InputAdornment,
//   Tooltip,
//   CircularProgress,
//   CardMedia,
// } from "@mui/material";
// import {
//   Search,
//   Refresh,
//   Visibility,
//   Delete,
//   PriorityHigh,
//   Help,
//   BugReport,
//   Assignment,
//   Description,
//   Image as ImageIcon,
//   Person,
//   Domain,
//   CalendarToday,
//   AccessTime,
//   Pending,
//   TaskAlt,
//   ClosedCaption,
// } from "@mui/icons-material";
// import { supabase } from "../../api/supabaseClient";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";

// dayjs.extend(relativeTime);

// export default function AdminTicket() {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [detailDialogOpen, setDetailDialogOpen] = useState(false);
//   const [stats, setStats] = useState({
//     total: 0,
//     open: 0,
//     inProgress: 0,
//     resolved: 0,
//     closed: 0,
//   });
//   const [users, setUsers] = useState({});
//   const [societies, setSocieties] = useState({});
//   const [buildings, setBuildings] = useState({});
//   const [filteredTickets, setFilteredTickets] = useState([]);
//   const [selectedBuilding, setSelectedBuilding] = useState("all");

//   const statusConfig = {
//     open: {
//       color: "#DBA400",
//       bgColor: "rgba(219, 164, 0, 0.1)",
//       icon: <Assignment />,
//       label: "Open",
//     },
//     in_progress: {
//       color: "#6F0B14",
//       bgColor: "rgba(111, 11, 20, 0.1)",
//       icon: <Pending />,
//       label: "In Progress",
//     },
//     resolved: {
//       color: "#008000",
//       bgColor: "rgba(0, 128, 0, 0.1)",
//       icon: <TaskAlt />,
//       label: "Resolved",
//     },
//     closed: {
//       color: "#A29EB6",
//       bgColor: "rgba(162, 158, 182, 0.1)",
//       icon: <ClosedCaption />,
//       label: "Closed",
//     },
//   };
//   useEffect(() => {
//     let data = [...tickets];

//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       data = data.filter(
//         (t) =>
//           t.details?.toLowerCase().includes(searchLower) ||
//           users[t.user_id]?.name?.toLowerCase().includes(searchLower),
//       );
//     }

//     if (selectedBuilding !== "all") {
//       data = data.filter(
//         (t) => String(t.building_id) === String(selectedBuilding),
//       );
//     }

//     // 📌 Status filter (default open)
//     if (statusFilter !== "all") {
//       data = data.filter(() => statusFilter === "open");
//     }

//     setFilteredTickets(data);
//   }, [tickets, searchTerm, selectedBuilding, statusFilter, users]);

//   // Fetch all related data
//   const fetchRelatedData = async (ticketsData) => {
//     try {
//       console.log("📌 fetchRelatedData called");

//       if (!ticketsData || ticketsData.length === 0) return;

//       // Get unique IDs
//       const userIds = [
//         ...new Set(ticketsData.map((t) => t.user_id).filter(Boolean)),
//       ];
//       const societyIds = [
//         ...new Set(ticketsData.map((t) => t.society_id).filter(Boolean)),
//       ];
//       const buildingIds = [
//         ...new Set(ticketsData.map((t) => t.building_id).filter(Boolean)),
//       ];

//       // Fetch users
//       if (userIds.length > 0) {
//         const { data: usersData } = await supabase
//           .from("users")
//           .select("id, name, email")
//           .in("id", userIds);

//         if (usersData) {
//           const usersMap = {};
//           usersData.forEach((u) => (usersMap[u.id] = u));
//           setUsers(usersMap);
//         }
//       }

//       // Fetch societies
//       if (societyIds.length > 0) {
//         const { data: societiesData } = await supabase
//           .from("societies")
//           .select("id, name")
//           .in("id", societyIds);

//         if (societiesData) {
//           const societiesMap = {};
//           societiesData.forEach((s) => (societiesMap[s.id] = s));
//           setSocieties(societiesMap);
//         }
//       }

//       // Fetch buildings
//       if (buildingIds.length > 0) {
//         const { data: buildingsData } = await supabase
//           .from("buildings")
//           .select("id, name")
//           .in("id", buildingIds);

//         if (buildingsData) {
//           const buildingsMap = {};
//           buildingsData.forEach((b) => (buildingsMap[b.id] = b));
//           setBuildings(buildingsMap);
//         }
//       }
//     } catch (err) {
//       console.error("🔥 fetchRelatedData error:", err);
//     }
//   };

//   // Fetch all tickets
//   const fetchTickets = async () => {
//     try {
//       setLoading(true);

//       const societyId = Number(localStorage.getItem("societyId"));

//       if (!societyId) {
//         console.error("❌ Society ID missing");
//         setTickets([]);
//         return;
//       }

//       const { data, error } = await supabase
//         .from("ticket")
//         .select("*")
//         .eq("society_id", societyId)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("❌ Ticket fetch error:", error);
//         setTickets([]);
//         return;
//       }

//       setTickets(data || []);
//       setFilteredTickets(data || []);

//       if (data?.length) {
//         fetchRelatedData(data);
//         calculateStats(data);
//       }
//     } catch (err) {
//       console.error("🔥 fetchTickets error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = (ticketsData) => {
//     // Since your table doesn't have status columns, we'll use a default approach
//     // You might want to add a 'status' column to your table in the future
//     const stats = {
//       total: ticketsData.length,
//       open: ticketsData.length, // Default: all tickets are open
//       inProgress: 0,
//       resolved: 0,
//       closed: 0,
//     };
//     setStats(stats);
//   };

//   const handleDeleteTicket = async (ticketId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this ticket? This action cannot be undone.",
//       )
//     ) {
//       try {
//         const { error } = await supabase
//           .from("ticket")
//           .delete()
//           .eq("id", ticketId);

//         if (error) throw error;

//         setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));

//         // Update stats
//         setStats((prev) => ({
//           ...prev,
//           total: prev.total - 1,
//           open: prev.open - 1,
//         }));
//       } catch (error) {
//         console.error("Error deleting ticket:", error);
//       }
//     }
//   };

//   // Handle status update - this will need the additional columns
//   const handleStatusUpdate = async (ticketId, newStatus) => {
//     try {
//       const updates = {};

//       // Based on your table structure, you might need to add these columns first
//       // For now, we'll just update the local state
//       console.log(`Updating ticket ${ticketId} to ${newStatus}`);

//       // If you add the columns to your table, uncomment this:
//       /*
//       switch (newStatus) {
//         case "in_progress":
//           updates.in_progress = true;
//           updates.resolved_at = null;
//           updates.closed_at = null;
//           break;
//         case "resolved":
//           updates.resolved_at = new Date().toISOString();
//           updates.closed_at = null;
//           break;
//         case "closed":
//           updates.closed_at = new Date().toISOString();
//           updates.resolved_at = new Date().toISOString();
//           break;
//         default:
//           updates.in_progress = false;
//           updates.resolved_at = null;
//           updates.closed_at = null;
//       }

//       const { error } = await supabase
//         .from("ticket")
//         .update(updates)
//         .eq("id", ticketId);

//       if (error) throw error;
//       */

//       // For now, just refresh
//       fetchTickets();
//     } catch (error) {
//       console.error("Error updating ticket status:", error);
//     }
//   };

//   const formatDateTime = (dateTime) => {
//     if (!dateTime) return "N/A";
//     return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
//   };

//   const getTimeAgo = (dateTime) => {
//     if (!dateTime) return "N/A";
//     return dayjs(dateTime).fromNow();
//   };

//   // Since your table doesn't have status, we'll use a default
//   const getTicketStatus = () => {
//     return "open"; // All tickets are open by default
//   };

//   useEffect(() => {
//     fetchTickets();
//   }, []);

//   return (
//     <div className="p-6 font-roboto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <div>
//           <Typography variant="h4" className="font-bold text-primary">
//             Support Tickets
//           </Typography>
//           <Typography variant="body2" className="text-hintText">
//             Manage and track all support tickets for your society
//           </Typography>
//           <Typography variant="caption" className="text-primary">
//             Society ID: {localStorage.getItem("societyId") || "Not set"}
//           </Typography>
//         </div>
//         <div className="flex gap-3">
//           <Button
//             variant="outlined"
//             startIcon={<Refresh />}
//             onClick={fetchTickets}
//             className="border-primary text-primary hover:bg-lightBackground"
//           >
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <Grid container spacing={3} className="mb-6">
//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Typography variant="body2" className="text-hintText">
//                     Total Tickets
//                   </Typography>
//                   <Typography variant="h4" className="font-bold text-primary">
//                     {stats.total}
//                   </Typography>
//                 </div>
//                 <Avatar className="bg-primary/10">
//                   <Description className="text-primary" />
//                 </Avatar>
//               </div>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Typography variant="body2" className="text-hintText">
//                     Open Tickets
//                   </Typography>
//                   <Typography variant="h4" className="font-bold text-pending">
//                     {stats.open}
//                   </Typography>
//                 </div>
//                 <Avatar className="bg-pending/10">
//                   <Assignment className="text-pending" />
//                 </Avatar>
//               </div>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Typography variant="body2" className="text-hintText">
//                     Tickets with Images
//                   </Typography>
//                   <Typography variant="h4" className="font-bold text-primary">
//                     {tickets.filter((t) => t.image).length}
//                   </Typography>
//                 </div>
//                 <Avatar className="bg-primary/10">
//                   <ImageIcon className="text-primary" />
//                 </Avatar>
//               </div>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} sm={6} md={3}>
//           <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
//             <CardContent>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <Typography variant="body2" className="text-hintText">
//                     Today's Tickets
//                   </Typography>
//                   <Typography variant="h4" className="font-bold text-success">
//                     {
//                       tickets.filter((t) =>
//                         dayjs(t.created_at).isSame(dayjs(), "day"),
//                       ).length
//                     }
//                   </Typography>
//                 </div>
//                 <Avatar className="bg-success/10">
//                   <CalendarToday className="text-success" />
//                 </Avatar>
//               </div>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Filters Section */}
//       <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} md={4}>
//             <TextField
//               fullWidth
//               variant="outlined"
//               size="small"
//               placeholder="Search tickets by details or user..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <Search className="text-hintText" />
//                   </InputAdornment>
//                 ),
//                 className: "bg-white",
//               }}
//             />
//           </Grid>

//           <Grid item xs={12} sm={6} md={2}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Status</InputLabel>
//               <Select
//                 value={statusFilter}
//                 label="Status"
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="bg-white"
//               >
//                 <MenuItem value="all">All Status</MenuItem>
//                 <MenuItem value="open">Open</MenuItem>
//                 {/* Add more options when you add status columns */}
//               </Select>
//             </FormControl>
//           </Grid>

//           <Grid item xs={12} sm={6} md={6} className="text-right">
//             <Typography variant="caption" className="text-hintText">
//               Showing {filteredTickets.length} of {tickets.length} tickets for
//               your society
//             </Typography>
//           </Grid>
//         </Grid>
//         <Grid item xs={12} sm={6} md={3}>
//           <FormControl fullWidth size="small">
//             <InputLabel>Building</InputLabel>
//             <Select
//               value={selectedBuilding}
//               label="Building"
//               onChange={(e) => setSelectedBuilding(e.target.value)}
//               className="bg-white"
//             >
//               <MenuItem value="all">All Buildings</MenuItem>

//               {Object.values(buildings).map((b) => (
//                 <MenuItem key={b.id} value={b.id}>
//                   {b.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Grid>
//       </Paper>

//       {/* Tickets Table */}
//       <Paper className="shadow-sm border border-gray-100 overflow-hidden">
//         <TableContainer>
//           <Table>
//             <TableHead className="bg-lightBackground">
//               <TableRow>
//                 <TableCell className="font-semibold text-primary">
//                   Ticket ID
//                 </TableCell>
//                 <TableCell className="font-semibold text-primary">
//                   User & Location
//                 </TableCell>
//                 <TableCell className="font-semibold text-primary">
//                   Description
//                 </TableCell>
//                 <TableCell className="font-semibold text-primary">
//                   Created Date
//                 </TableCell>
//                 <TableCell className="font-semibold text-primary">
//                   Status
//                 </TableCell>
//                 <TableCell className="font-semibold text-primary text-center">
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" className="py-12">
//                     <div className="flex flex-col items-center justify-center">
//                       <CircularProgress className="text-primary mb-4" />
//                       <Typography variant="body1" className="text-hintText">
//                         Loading tickets...
//                       </Typography>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : filteredTickets.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" className="py-12">
//                     <div className="flex flex-col items-center justify-center">
//                       <Assignment className="text-hintText text-4xl mb-4" />
//                       <Typography variant="h6" className="text-hintText mb-2">
//                         {searchTerm
//                           ? "No tickets found"
//                           : "No tickets available"}
//                       </Typography>
//                       <Typography variant="body2" className="text-hintText">
//                         {searchTerm
//                           ? "Try adjusting your search criteria"
//                           : "No tickets have been created for your society yet"}
//                       </Typography>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredTickets.map((ticket) => {
//                   const user = users[ticket.user_id];
//                   const society = societies[ticket.society_id];
//                   const building = buildings[ticket.building_id];

//                   return (
//                     <TableRow
//                       key={ticket.id}
//                       hover
//                       className="hover:bg-lightBackground/50"
//                     >
//                       <TableCell>
//                         <Typography
//                           variant="subtitle2"
//                           className="font-semibold"
//                         >
//                           #{ticket.id}
//                         </Typography>
//                         {ticket.image && (
//                           <Chip
//                             icon={<ImageIcon />}
//                             label="Has Image"
//                             size="small"
//                             className="bg-blue-100 text-blue-800 mt-1"
//                           />
//                         )}
//                       </TableCell>

//                       <TableCell>
//                         <div className="space-y-1">
//                           {user && (
//                             <div className="flex items-center space-x-2">
//                               <Person
//                                 fontSize="small"
//                                 className="text-primary"
//                               />
//                               <Typography
//                                 variant="body2"
//                                 className="font-medium"
//                               >
//                                 {user.name || `User ${ticket.user_id}`}
//                               </Typography>
//                             </div>
//                           )}
//                           <div className="flex items-center space-x-2">
//                             <Domain fontSize="small" className="text-primary" />
//                             <Typography
//                               variant="caption"
//                               className="text-hintText"
//                             >
//                               {society ? society.name : "No society"}
//                               {building && ` • ${building.name}`}
//                             </Typography>
//                           </div>
//                         </div>
//                       </TableCell>

//                       <TableCell>
//                         <Typography variant="body2" className="line-clamp-2">
//                           {ticket.details || "No description provided"}
//                         </Typography>
//                       </TableCell>

//                       <TableCell>
//                         <Typography variant="body2" className="font-medium">
//                           {formatDateTime(ticket.created_at)}
//                         </Typography>
//                         <Typography variant="caption" className="text-hintText">
//                           {getTimeAgo(ticket.created_at)}
//                         </Typography>
//                       </TableCell>

//                       <TableCell>
//                         <Chip
//                           icon={statusConfig.open.icon}
//                           label={statusConfig.open.label}
//                           size="small"
//                           style={{
//                             backgroundColor: statusConfig.open.bgColor,
//                             color: statusConfig.open.color,
//                             border: `1px solid ${statusConfig.open.color}`,
//                           }}
//                           className="font-medium"
//                         />
//                       </TableCell>

//                       <TableCell align="center">
//                         <div className="flex justify-center space-x-1">
//                           <Tooltip title="View Details">
//                             <IconButton
//                               size="small"
//                               onClick={() => {
//                                 setSelectedTicket(ticket);
//                                 setDetailDialogOpen(true);
//                               }}
//                               className="text-primary hover:bg-lightBackground"
//                             >
//                               <Visibility fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Delete Ticket">
//                             <IconButton
//                               size="small"
//                               onClick={() => handleDeleteTicket(ticket.id)}
//                               className="text-reject hover:bg-red-50"
//                             >
//                               <Delete fontSize="small" />
//                             </IconButton>
//                           </Tooltip>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* Ticket Detail Dialog - Simplified version */}
//       <Dialog
//         open={detailDialogOpen}
//         onClose={() => setDetailDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         {selectedTicket && (
//           <>
//             <DialogTitle className="bg-gradient-to-r from-primary to-primary/90 text-white">
//               <div className="flex justify-between items-center">
//                 <Typography variant="h6">
//                   Ticket #{selectedTicket.id} Details
//                 </Typography>
//                 <Chip
//                   label="Open"
//                   className="bg-white text-primary"
//                   size="small"
//                 />
//               </div>
//             </DialogTitle>

//             <DialogContent className="p-6">
//               <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="textSecondary">
//                     Description
//                   </Typography>
//                   <Typography variant="body1" className="mt-2">
//                     {selectedTicket.details || "No description provided"}
//                   </Typography>
//                 </Grid>

//                 {selectedTicket.image && (
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle2" color="textSecondary">
//                       Attached Image
//                     </Typography>
//                     <CardMedia
//                       component="img"
//                       image={selectedTicket.image}
//                       alt="Ticket"
//                       className="rounded-lg mt-2 max-h-64 object-contain"
//                     />
//                   </Grid>
//                 )}

//                 <Grid item xs={12} md={6}>
//                   <Typography variant="subtitle2" color="textSecondary">
//                     Created
//                   </Typography>
//                   <Typography variant="body1">
//                     {formatDateTime(selectedTicket.created_at)}
//                   </Typography>
//                   <Typography variant="caption" color="textSecondary">
//                     {getTimeAgo(selectedTicket.created_at)}
//                   </Typography>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <Typography variant="subtitle2" color="textSecondary">
//                     User
//                   </Typography>
//                   <Typography variant="body1">
//                     {users[selectedTicket.user_id]?.name ||
//                       `User ID: ${selectedTicket.user_id}`}
//                   </Typography>
//                   {users[selectedTicket.user_id]?.email && (
//                     <Typography variant="caption" color="textSecondary">
//                       {users[selectedTicket.user_id].email}
//                     </Typography>
//                   )}
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="textSecondary">
//                     Location
//                   </Typography>
//                   <Typography variant="body1">
//                     Society:{" "}
//                     {societies[selectedTicket.society_id]?.name ||
//                       "Not specified"}
//                   </Typography>
//                   {buildings[selectedTicket.building_id] && (
//                     <Typography variant="body1">
//                       Building: {buildings[selectedTicket.building_id].name}
//                     </Typography>
//                   )}
//                 </Grid>
//               </Grid>
//             </DialogContent>

//             <DialogActions className="p-4">
//               <Button
//                 onClick={() => setDetailDialogOpen(false)}
//                 color="primary"
//               >
//                 Close
//               </Button>
//               <Button
//                 onClick={() => {
//                   handleDeleteTicket(selectedTicket.id);
//                   setDetailDialogOpen(false);
//                 }}
//                 color="error"
//               >
//                 Delete Ticket
//               </Button>
//             </DialogActions>
//           </>
//         )}
//       </Dialog>
//     </div>
//   );
// }
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  InputAdornment,
  Tooltip,
  CircularProgress,
  CardMedia,
} from "@mui/material";
import {
  Search,
  Refresh,
  Visibility,
  Delete,
  PriorityHigh,
  Help,
  BugReport,
  Assignment,
  Description,
  Image as ImageIcon,
  Person,
  Domain,
  CalendarToday,
  AccessTime,
  Pending,
  TaskAlt,
  ClosedCaption,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function AdminTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [users, setUsers] = useState({});
  const [societies, setSocieties] = useState({});
  const [buildings, setBuildings] = useState({});
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [availableBuildings, setAvailableBuildings] = useState([]);

  const statusConfig = {
    open: {
      color: "#DBA400",
      bgColor: "rgba(219, 164, 0, 0.1)",
      icon: <Assignment />,
      label: "Open",
    },
    in_progress: {
      color: "#6F0B14",
      bgColor: "rgba(111, 11, 20, 0.1)",
      icon: <Pending />,
      label: "In Progress",
    },
    resolved: {
      color: "#008000",
      bgColor: "rgba(0, 128, 0, 0.1)",
      icon: <TaskAlt />,
      label: "Resolved",
    },
    closed: {
      color: "#A29EB6",
      bgColor: "rgba(162, 158, 182, 0.1)",
      icon: <ClosedCaption />,
      label: "Closed",
    },
  };

  // Use useMemo for filtered tickets
  const filteredTickets = useMemo(() => {
    if (!tickets.length) return [];

    let filtered = [...tickets];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((ticket) => {
        const user = users[ticket.user_id];
        const userMatch =
          user?.name?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower);
        const detailsMatch = ticket.details
          ?.toLowerCase()
          .includes(searchLower);
        return userMatch || detailsMatch;
      });
    }

    // Apply building filter
    if (selectedBuilding !== "all") {
      filtered = filtered.filter(
        (ticket) => String(ticket.building_id) === String(selectedBuilding),
      );
    }

    // Apply status filter (simplified since no status columns)
    if (statusFilter !== "all") {
      // For now, all tickets are considered "open"
      filtered = filtered.filter(() => statusFilter === "open");
    }

    return filtered;
  }, [tickets, searchTerm, selectedBuilding, statusFilter, users]);

  // Fetch all related data
  const fetchRelatedData = async (ticketsData) => {
    try {
      if (!ticketsData || ticketsData.length === 0) return;

      // Get unique IDs
      const userIds = [
        ...new Set(ticketsData.map((t) => t.user_id).filter(Boolean)),
      ];
      const societyIds = [
        ...new Set(ticketsData.map((t) => t.society_id).filter(Boolean)),
      ];
      const buildingIds = [
        ...new Set(ticketsData.map((t) => t.building_id).filter(Boolean)),
      ];

      // Fetch users
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
        } else if (usersData) {
          const usersMap = {};
          usersData.forEach((u) => (usersMap[u.id] = u));
          setUsers(usersMap);
        }
      }

      // Fetch societies
      if (societyIds.length > 0) {
        const { data: societiesData, error: societiesError } = await supabase
          .from("societies")
          .select("id, name")
          .in("id", societyIds);

        if (societiesError) {
          console.error("Error fetching societies:", societiesError);
        } else if (societiesData) {
          const societiesMap = {};
          societiesData.forEach((s) => (societiesMap[s.id] = s));
          setSocieties(societiesMap);
        }
      }

      // Fetch buildings
      if (buildingIds.length > 0) {
        const { data: buildingsData, error: buildingsError } = await supabase
          .from("buildings")
          .select("id, name")
          .in("id", buildingIds);

        if (buildingsError) {
          console.error("Error fetching buildings:", buildingsError);
        } else if (buildingsData) {
          const buildingsMap = {};
          const buildingsList = [];
          buildingsData.forEach((b) => {
            buildingsMap[b.id] = b;
            buildingsList.push(b);
          });
          setBuildings(buildingsMap);
          setAvailableBuildings(buildingsList);
        }
      }
    } catch (err) {
      console.error("Error fetching related data:", err);
    }
  };

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);

      // Get society ID from localStorage
      const societyIdStr = localStorage.getItem("societyId");
      const societyId = societyIdStr ? parseInt(societyIdStr) : null;

      console.log("Fetching tickets for society ID:", societyId);

      if (!societyId || isNaN(societyId)) {
        console.error("Invalid society ID in localStorage:", societyIdStr);
        setTickets([]);
        setStats({
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        });
        return;
      }

      const { data, error } = await supabase
        .from("ticket")
        .select("*")
        .eq("society_id", societyId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
        return;
      }

      console.log("Fetched tickets:", data?.length || 0);
      setTickets(data || []);

      // Calculate stats
      calculateStats(data || []);

      // Fetch related data
      if (data && data.length > 0) {
        await fetchRelatedData(data);
      }
    } catch (err) {
      console.error("Error in fetchTickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData) => {
    const today = dayjs().startOf("day");

    const stats = {
      total: ticketsData.length,
      open: ticketsData.length, // All tickets are open by default
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };

    // If you add status columns later, update this function
    setStats(stats);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone.",
      )
    ) {
      try {
        const { error } = await supabase
          .from("ticket")
          .delete()
          .eq("id", ticketId);

        if (error) throw error;

        // Update local state
        setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));

        // Show success message
        console.log("Ticket deleted successfully");
      } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Failed to delete ticket. Please try again.");
      }
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).fromNow();
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Log for debugging
  useEffect(() => {
    console.log("Tickets state updated:", tickets.length);
    console.log("Filtered tickets:", filteredTickets.length);
  }, [tickets, filteredTickets]);

  return (
    <div className="p-6 font-roboto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-primary">
            Support Tickets
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Manage and track all support tickets for your society
          </Typography>
          <Typography variant="caption" className="text-primary">
            Society ID: {localStorage.getItem("societyId") || "Not set"}
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTickets}
            className="border-primary text-primary hover:bg-lightBackground"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {stats.total}
                  </Typography>
                </div>
                <Avatar className="bg-primary/10">
                  <Description className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-pending">
                    {stats.open}
                  </Typography>
                </div>
                <Avatar className="bg-pending/10">
                  <Assignment className="text-pending" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Tickets with Images
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {tickets.filter((t) => t.image).length}
                  </Typography>
                </div>
                <Avatar className="bg-primary/10">
                  <ImageIcon className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Today's Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-success">
                    {
                      tickets.filter((t) =>
                        dayjs(t.created_at).isSame(dayjs(), "day"),
                      ).length
                    }
                  </Typography>
                </div>
                <Avatar className="bg-success/10">
                  <CalendarToday className="text-success" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section - Fixed Grid layout */}
      <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search tickets by details or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-hintText" />
                  </InputAdornment>
                ),
                className: "bg-white",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Building</InputLabel>
              <Select
                value={selectedBuilding}
                label="Building"
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-white"
                disabled={availableBuildings.length === 0}
              >
                <MenuItem value="all">All Buildings</MenuItem>
                {availableBuildings.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3} className="text-right">
            <Typography variant="caption" className="text-hintText">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchTerm("");
                setSelectedBuilding("all");
                setStatusFilter("all");
              }}
              className="ml-2"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tickets Table */}
      <Paper className="shadow-sm border border-gray-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-lightBackground">
              <TableRow>
                <TableCell className="font-semibold text-primary">
                  Ticket ID
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  User & Location
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Description
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Created Date
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Status
                </TableCell>
                <TableCell className="font-semibold text-primary text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <CircularProgress className="text-primary mb-4" />
                      <Typography variant="body1" className="text-hintText">
                        Loading tickets...
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Assignment className="text-hintText text-4xl mb-4" />
                      <Typography variant="h6" className="text-hintText mb-2">
                        {searchTerm || selectedBuilding !== "all"
                          ? "No matching tickets found"
                          : "No tickets available"}
                      </Typography>
                      <Typography variant="body2" className="text-hintText">
                        {searchTerm || selectedBuilding !== "all"
                          ? "Try adjusting your filters"
                          : "No tickets have been created yet"}
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const user = users[ticket.user_id];
                  const society = societies[ticket.society_id];
                  const building = buildings[ticket.building_id];

                  return (
                    <TableRow
                      key={ticket.id}
                      hover
                      className="hover:bg-lightBackground/50"
                    >
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          className="font-semibold"
                        >
                          #{ticket.id}
                        </Typography>
                        {ticket.image && (
                          <Chip
                            icon={<ImageIcon />}
                            label="Has Image"
                            size="small"
                            className="bg-blue-100 text-blue-800 mt-1"
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Person fontSize="small" className="text-primary" />
                            <Typography variant="body2" className="font-medium">
                              {user?.name || `User ${ticket.user_id}`}
                              {user?.email && (
                                <Typography
                                  variant="caption"
                                  className="text-hintText block"
                                >
                                  {user.email}
                                </Typography>
                              )}
                            </Typography>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Domain fontSize="small" className="text-primary" />
                            <Typography
                              variant="caption"
                              className="text-hintText"
                            >
                              {society?.name || "No society specified"}
                              {building && ` • ${building.name}`}
                            </Typography>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" className="line-clamp-2">
                          {ticket.details || "No description provided"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {formatDateTime(ticket.created_at)}
                        </Typography>
                        <Typography variant="caption" className="text-hintText">
                          {getTimeAgo(ticket.created_at)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={statusConfig.open.icon}
                          label={statusConfig.open.label}
                          size="small"
                          style={{
                            backgroundColor: statusConfig.open.bgColor,
                            color: statusConfig.open.color,
                            border: `1px solid ${statusConfig.open.color}`,
                          }}
                          className="font-medium"
                        />
                      </TableCell>

                      <TableCell align="center">
                        <div className="flex justify-center space-x-1">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setDetailDialogOpen(true);
                              }}
                              className="text-primary hover:bg-lightBackground"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Ticket">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle className="bg-gradient-to-r from-primary to-primary/90 text-white">
              <div className="flex justify-between items-center">
                <Typography variant="h6">
                  Ticket #{selectedTicket.id} Details
                </Typography>
                <Chip
                  label="Open"
                  className="bg-white text-primary"
                  size="small"
                />
              </div>
            </DialogTitle>

            <DialogContent className="p-6">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body1"
                    className="mt-2 p-3 bg-gray-50 rounded"
                  >
                    {selectedTicket.details || "No description provided"}
                  </Typography>
                </Grid>

                {selectedTicket.image && (
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      color="textSecondary"
                      gutterBottom
                    >
                      Attached Image
                    </Typography>
                    <CardMedia
                      component="img"
                      image={selectedTicket.image}
                      alt="Ticket Attachment"
                      className="rounded-lg mt-2 max-h-64 object-contain border"
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedTicket.created_at)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getTimeAgo(selectedTicket.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    User Information
                  </Typography>
                  {users[selectedTicket.user_id] ? (
                    <>
                      <Typography variant="body1">
                        {users[selectedTicket.user_id].name}
                      </Typography>
                      {users[selectedTicket.user_id].email && (
                        <Typography variant="caption" color="textSecondary">
                          {users[selectedTicket.user_id].email}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1">
                      User ID: {selectedTicket.user_id}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Location Details
                  </Typography>
                  <div className="space-y-2">
                    <Typography variant="body1">
                      Society:{" "}
                      {societies[selectedTicket.society_id]?.name ||
                        "Not specified"}
                    </Typography>
                    {buildings[selectedTicket.building_id] && (
                      <Typography variant="body1">
                        Building: {buildings[selectedTicket.building_id].name}
                      </Typography>
                    )}
                  </div>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions className="p-4 bg-gray-50">
              <Button
                onClick={() => setDetailDialogOpen(false)}
                color="primary"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleDeleteTicket(selectedTicket.id);
                  setDetailDialogOpen(false);
                }}
                color="error"
              >
                Delete Ticket
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
