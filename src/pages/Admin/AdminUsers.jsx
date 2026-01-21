// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   IconButton,
//   Menu,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Avatar,
//   Stack,
//   TablePagination,
//   useTheme,
//   useMediaQuery,
//   Card,
//   CardContent,
//   Grid,
//   CircularProgress,
//   Tooltip,
// } from "@mui/material";
// import { toast } from "react-toastify";
// import supabase from "../../api/supabaseClient";

// // Import React Icons
// import {
//   FiSearch,
//   FiFilter,
//   FiMoreVertical,
//   FiUser,
//   FiMail,
//   FiPhone,
//   FiHome,
//   FiBuilding,
//   FiCalendar,
//   FiEye,
//   FiEdit,
//   FiTrash2,
//   FiRefreshCw,
//   FiDownload,
// } from "react-icons/fi";
// import {
//   MdApartment,
//   MdLocationOn,
//   MdOutlinePerson,
//   MdOutlineEmail,
//   MdOutlinePhone,
//   MdOutlineHome,
//   MdOutlineBusiness,
//   MdOutlineDateRange,
// } from "react-icons/md";
// import {
//   RiUserLine,
//   RiBuildingLine,
//   RiHomeLine,
//   RiFileListLine,
// } from "react-icons/ri";

// export default function AdminUsers() {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterAnchorEl, setFilterAnchorEl] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [roleFilter, setRoleFilter] = useState("all");

//   const [adminSocietyId, setAdminSocietyId] = useState(null);
//   const [adminSocietyName, setAdminSocietyName] = useState("");

//   // State for user details dialog
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [openUserDialog, setOpenUserDialog] = useState(false);
//   const [actionAnchorEl, setActionAnchorEl] = useState(null);
//   const [selectedUserId, setSelectedUserId] = useState(null);

//   // Get admin's society ID
//   const getAdminSocietyId = useCallback(async () => {
//     try {
//       const storedSocietyId = localStorage.getItem("societyId");
//       if (storedSocietyId) {
//         return storedSocietyId;
//       }

//       const storedProfile = localStorage.getItem("profile");
//       if (!storedProfile) {
//         console.error("No profile found in localStorage");
//         return null;
//       }

//       const profile = JSON.parse(storedProfile);
//       const userId = profile.id;

//       const { data: societyData, error } = await supabase
//         .from("societies")
//         .select("id, name")
//         .eq("user_id", userId)
//         .single();

//       if (error) {
//         console.error("Error fetching society:", error);
//         toast.error("Unable to fetch society information");
//         return null;
//       }

//       if (societyData) {
//         localStorage.setItem("societyId", societyData.id);
//         localStorage.setItem("societyName", societyData.name);
//         return societyData.id;
//       }

//       return null;
//     } catch (error) {
//       console.error("Error in getAdminSocietyId:", error);
//       return null;
//     }
//   }, []);

//   // Initialize admin data
//   useEffect(() => {
//     const initializeAdminData = async () => {
//       const societyId = await getAdminSocietyId();

//       if (societyId) {
//         setAdminSocietyId(societyId);

//         const storedSocietyName = localStorage.getItem("societyName");
//         if (storedSocietyName) {
//           setAdminSocietyName(storedSocietyName);
//         } else {
//           const { data: societyData, error } = await supabase
//             .from("societies")
//             .select("name")
//             .eq("id", societyId)
//             .single();

//           if (!error && societyData) {
//             setAdminSocietyName(societyData.name);
//             localStorage.setItem("societyName", societyData.name);
//           }
//         }
//       } else {
//         toast.error(
//           "No society assigned to your account. Please contact administrator.",
//         );
//       }
//     };

//     initializeAdminData();
//   }, [getAdminSocietyId]);

//   // Fetch users/tenants
//   const fetchUsers = useCallback(async () => {
//     setLoading(true);
//     setRefreshing(true);

//     try {
//       const societyId = await getAdminSocietyId();

//       if (!societyId) {
//         toast.error("No society assigned. Cannot fetch users.");
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       // Get all buildings in this society
//       const { data: buildingsData, error: buildingsError } = await supabase
//         .from("buildings")
//         .select("id")
//         .eq("society_id", societyId)
//         .eq("is_delete", false);

//       if (buildingsError) {
//         console.error("Error fetching buildings:", buildingsError);
//         toast.error("Failed to fetch buildings");
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       const buildingIds = buildingsData.map((b) => b.id);

//       if (buildingIds.length === 0) {
//         setUsers([]);
//         setFilteredUsers([]);
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       // Get all flats in these buildings
//       const { data: flatsData, error: flatsError } = await supabase
//         .from("flats")
//         .select(
//           `
//           id,
//           flat_number,
//           building_id,
//           owner_id,
//           tenant_id,
//           flat_type,
//           status,
//           buildings (
//             id,
//             name,
//             societies (
//               id,
//               name
//             )
//           )
//         `,
//         )
//         .in("building_id", buildingIds)
//         .eq("is_delete", false);

//       if (flatsError) {
//         console.error("Error fetching flats:", flatsError);
//         toast.error("Failed to fetch flats");
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       // Collect all user IDs
//       const userIds = new Set();
//       flatsData.forEach((flat) => {
//         if (flat.owner_id) userIds.add(flat.owner_id);
//         if (flat.tenant_id) userIds.add(flat.tenant_id);
//       });

//       const uniqueUserIds = Array.from(userIds);

//       if (uniqueUserIds.length === 0) {
//         setUsers([]);
//         setFilteredUsers([]);
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       // Get user details
//       const { data: usersData, error: usersError } = await supabase
//         .from("users")
//         .select(
//           `
//           id,
//           email,
//           first_name,
//           last_name,
//           phone,
//           role,
//           is_active,
//           created_at,
//           profile_picture,
//           address
//         `,
//         )
//         .in("id", uniqueUserIds);

//       if (usersError) {
//         console.error("Error fetching users:", usersError);
//         toast.error("Failed to fetch users");
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       // Map users with their flat and building information
//       const mappedUsers = usersData.map((user) => {
//         const userFlats = flatsData.filter(
//           (flat) => flat.owner_id === user.id || flat.tenant_id === user.id,
//         );

//         const firstFlat = userFlats[0];
//         const building = firstFlat?.buildings;
//         const society = building?.societies;

//         const userRolesInSociety = new Set();
//         userFlats.forEach((flat) => {
//           if (flat.owner_id === user.id) userRolesInSociety.add("Owner");
//           if (flat.tenant_id === user.id) userRolesInSociety.add("Tenant");
//         });

//         return {
//           id: user.id,
//           email: user.email,
//           firstName: user.first_name || "",
//           lastName: user.last_name || "",
//           fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
//           phone: user.phone || "N/A",
//           address: user.address || "N/A",
//           userRole: user.role,
//           societyRole: Array.from(userRolesInSociety).join(", ") || "Resident",
//           isActive: user.is_active,
//           profilePicture: user.profile_picture,
//           buildingId: building?.id,
//           buildingName: building?.name || "N/A",
//           societyId: society?.id,
//           societyName: society?.name || "N/A",
//           flatsCount: userFlats.length,
//           flatNumbers: userFlats.map((f) => f.flat_number).join(", "),
//           flatTypes: userFlats
//             .map((f) => f.flat_type)
//             .filter(Boolean)
//             .join(", "),
//           joinDate: user.created_at
//             ? new Date(user.created_at).toLocaleDateString()
//             : "—",
//           joinDateTime: user.created_at ? new Date(user.created_at) : null,
//           status: user.is_active ? "active" : "inactive",
//           avatar:
//             user.first_name?.[0]?.toUpperCase() ||
//             user.email?.[0]?.toUpperCase() ||
//             "U",
//         };
//       });

//       // Sort by join date (newest first)
//       mappedUsers.sort((a, b) => {
//         if (!a.joinDateTime) return 1;
//         if (!b.joinDateTime) return -1;
//         return b.joinDateTime - a.joinDateTime;
//       });

//       setUsers(mappedUsers);
//       setFilteredUsers(mappedUsers);
//       toast.success(`Loaded ${mappedUsers.length} users`);
//     } catch (error) {
//       console.error("Error in fetchUsers:", error);
//       toast.error("Error fetching users");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [getAdminSocietyId]);

//   useEffect(() => {
//     if (adminSocietyId) {
//       fetchUsers();
//     }
//   }, [fetchUsers, adminSocietyId]);

//   // Apply filters
//   useEffect(() => {
//     let filtered = users;

//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (user) =>
//           user.fullName.toLowerCase().includes(searchLower) ||
//           user.email.toLowerCase().includes(searchLower) ||
//           user.phone.toLowerCase().includes(searchLower) ||
//           user.buildingName.toLowerCase().includes(searchLower) ||
//           user.flatNumbers.toLowerCase().includes(searchLower),
//       );
//     }

//     if (statusFilter !== "all") {
//       filtered = filtered.filter((user) => user.status === statusFilter);
//     }

//     if (roleFilter !== "all") {
//       filtered = filtered.filter((user) =>
//         user.societyRole.toLowerCase().includes(roleFilter.toLowerCase()),
//       );
//     }

//     setFilteredUsers(filtered);
//     setPage(0);
//   }, [users, searchTerm, statusFilter, roleFilter]);

//   // Handle filter menu
//   const handleFilterClick = (event) => {
//     setFilterAnchorEl(event.currentTarget);
//   };

//   const handleFilterClose = () => {
//     setFilterAnchorEl(null);
//   };

//   // Handle action menu
//   const handleActionClick = (event, userId) => {
//     setActionAnchorEl(event.currentTarget);
//     setSelectedUserId(userId);
//   };

//   const handleActionClose = () => {
//     setActionAnchorEl(null);
//     setSelectedUserId(null);
//   };

//   // Handle user actions
//   const handleViewUser = (userId) => {
//     const user = users.find((u) => u.id === userId);
//     setSelectedUser(user);
//     setOpenUserDialog(true);
//     handleActionClose();
//   };

//   const handleEditUser = (userId) => {
//     const user = users.find((u) => u.id === userId);
//     toast.info(`Edit user: ${user?.fullName}`);
//     handleActionClose();
//   };

//   const handleDeleteUser = (userId) => {
//     const user = users.find((u) => u.id === userId);
//     if (window.confirm(`Are you sure you want to delete ${user?.fullName}?`)) {
//       toast.success(`User ${user?.fullName} deleted successfully`);
//       // Here you would typically call an API to delete the user
//       handleActionClose();
//     }
//   };

//   const handleExportUsers = () => {
//     toast.info("Exporting users to CSV...");
//     // Implement CSV export logic here
//   };

//   // Handle pagination
//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Get status chip color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "active":
//         return "success";
//       case "inactive":
//         return "error";
//       default:
//         return "default";
//     }
//   };

//   // Get role chip color
//   const getRoleColor = (role) => {
//     if (role.includes("Owner")) return "primary";
//     if (role.includes("Tenant")) return "secondary";
//     return "default";
//   };

//   // Get user avatar background color
//   const getAvatarColor = (name) => {
//     const colors = [
//       theme.palette.primary.main,
//       theme.palette.secondary.main,
//       theme.palette.success.main,
//       theme.palette.warning.main,
//       theme.palette.info.main,
//     ];
//     const index = name.charCodeAt(0) % colors.length;
//     return colors[index];
//   };

//   // Mobile card view for users
//   const MobileUserCard = ({ user }) => (
//     <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
//       <CardContent>
//         <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
//           <Avatar
//             src={user.profilePicture}
//             sx={{
//               bgcolor: getAvatarColor(user.fullName),
//               width: 48,
//               height: 48,
//             }}
//           >
//             {user.avatar}
//           </Avatar>
//           <Box sx={{ flex: 1 }}>
//             <Stack
//               direction="row"
//               justifyContent="space-between"
//               alignItems="flex-start"
//             >
//               <Box>
//                 <Typography variant="h6" fontWeight="600">
//                   {user.fullName}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {user.email}
//                 </Typography>
//               </Box>
//               <Chip
//                 label={user.status}
//                 size="small"
//                 color={getStatusColor(user.status)}
//                 sx={{ height: 24 }}
//               />
//             </Stack>
//           </Box>
//         </Stack>

//         <Grid container spacing={1.5}>
//           <Grid item xs={12}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <MdOutlinePhone size={16} color={theme.palette.text.secondary} />
//               <Typography variant="body2">{user.phone}</Typography>
//             </Stack>
//           </Grid>
//           <Grid item xs={12}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <RiBuildingLine size={16} color={theme.palette.text.secondary} />
//               <Typography variant="body2" fontWeight="500">
//                 {user.buildingName}
//               </Typography>
//             </Stack>
//           </Grid>
//           <Grid item xs={12}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <RiHomeLine size={16} color={theme.palette.text.secondary} />
//               <Typography variant="body2">
//                 Flat{user.flatsCount > 1 ? "s" : ""}:{" "}
//                 {user.flatNumbers || "N/A"}
//               </Typography>
//             </Stack>
//           </Grid>
//           <Grid item xs={12}>
//             <Stack direction="row" alignItems="center" spacing={1}>
//               <MdOutlineDateRange
//                 size={16}
//                 color={theme.palette.text.secondary}
//               />
//               <Typography variant="body2" color="text.secondary">
//                 Joined: {user.joinDate}
//               </Typography>
//             </Stack>
//           </Grid>
//           <Grid item xs={12} sx={{ mt: 1 }}>
//             <Stack direction="row" spacing={1} alignItems="center">
//               <Chip
//                 label={user.societyRole}
//                 size="small"
//                 color={getRoleColor(user.societyRole)}
//                 sx={{ height: 24 }}
//               />
//               <IconButton
//                 size="small"
//                 onClick={(e) => handleActionClick(e, user.id)}
//                 sx={{ ml: "auto" }}
//               >
//                 <FiMoreVertical size={18} />
//               </IconButton>
//             </Stack>
//           </Grid>
//         </Grid>
//       </CardContent>
//     </Card>
//   );

//   // Paginated data
//   const paginatedUsers = filteredUsers.slice(
//     page * rowsPerPage,
//     page * rowsPerPage + rowsPerPage,
//   );

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       {/* Header Section */}
//       <Box sx={{ mb: 4 }}>
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={2}
//         >
//           <Box>
//             <Typography variant="h4" fontWeight="700" gutterBottom>
//               Society Users
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               {adminSocietyName
//                 ? `Managing users in ${adminSocietyName}`
//                 : "Loading society information..."}
//             </Typography>
//           </Box>
//           <Stack direction="row" spacing={1}>
//             <IconButton
//               onClick={fetchUsers}
//               disabled={refreshing}
//               sx={{
//                 border: `1px solid ${theme.palette.divider}`,
//                 borderRadius: 2,
//               }}
//             >
//               <FiRefreshCw size={20} className={refreshing ? "spin" : ""} />
//             </IconButton>
//             <IconButton
//               onClick={handleExportUsers}
//               sx={{
//                 border: `1px solid ${theme.palette.divider}`,
//                 borderRadius: 2,
//               }}
//             >
//               <FiDownload size={20} />
//             </IconButton>
//           </Stack>
//         </Stack>
//       </Box>

//       {/* Filters and Search */}
//       <Box
//         sx={{
//           mb: 3,
//           p: 3,
//           bgcolor: "background.paper",
//           borderRadius: 2,
//           boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//         }}
//       >
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} md={6}>
//             <TextField
//               fullWidth
//               variant="outlined"
//               placeholder="Search users..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               InputProps={{
//                 startAdornment: (
//                   <FiSearch
//                     style={{
//                       marginRight: 8,
//                       color: theme.palette.text.secondary,
//                     }}
//                   />
//                 ),
//               }}
//               size="small"
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: 2,
//                 },
//               }}
//             />
//           </Grid>

//           <Grid item xs={6} md={2}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Status</InputLabel>
//               <Select
//                 value={statusFilter}
//                 label="Status"
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 sx={{ borderRadius: 2 }}
//               >
//                 <MenuItem value="all">All Status</MenuItem>
//                 <MenuItem value="active">Active</MenuItem>
//                 <MenuItem value="inactive">Inactive</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>

//           <Grid item xs={6} md={2}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Role</InputLabel>
//               <Select
//                 value={roleFilter}
//                 label="Role"
//                 onChange={(e) => setRoleFilter(e.target.value)}
//                 sx={{ borderRadius: 2 }}
//               >
//                 <MenuItem value="all">All Roles</MenuItem>
//                 <MenuItem value="Owner">Owners</MenuItem>
//                 <MenuItem value="Tenant">Tenants</MenuItem>
//                 <MenuItem value="Resident">Residents</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>

//           <Grid item xs={12} md={2}>
//             <IconButton
//               onClick={handleFilterClick}
//               sx={{
//                 border: `1px solid ${theme.palette.divider}`,
//                 borderRadius: 2,
//                 width: "100%",
//                 height: 40,
//               }}
//             >
//               <FiFilter size={18} />
//               <Typography variant="body2" sx={{ ml: 1 }}>
//                 More Filters
//               </Typography>
//             </IconButton>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* User Count and Stats */}
//       <Box
//         sx={{
//           mb: 2,
//           p: 2,
//           bgcolor: "background.default",
//           borderRadius: 2,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <Typography variant="body1" color="text.secondary">
//           <strong>{filteredUsers.length}</strong> user
//           {filteredUsers.length !== 1 ? "s" : ""} found
//         </Typography>
//         <Stack direction="row" spacing={2}>
//           <Chip
//             icon={<FiUser size={14} />}
//             label={`${users.filter((u) => u.societyRole.includes("Owner")).length} Owners`}
//             size="small"
//             variant="outlined"
//           />
//           <Chip
//             icon={<RiUserLine size={14} />}
//             label={`${users.filter((u) => u.societyRole.includes("Tenant")).length} Tenants`}
//             size="small"
//             variant="outlined"
//           />
//         </Stack>
//       </Box>

//       {/* Loading State */}
//       {loading ? (
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             alignItems: "center",
//             p: 8,
//             bgcolor: "background.paper",
//             borderRadius: 2,
//             boxShadow: 1,
//           }}
//         >
//           <CircularProgress size={60} />
//           <Typography variant="h6" sx={{ mt: 3 }}>
//             Loading users...
//           </Typography>
//         </Box>
//       ) : (
//         <>
//           {/* Mobile View */}
//           {isMobile ? (
//             <Box>
//               {paginatedUsers.length === 0 ? (
//                 <Box
//                   sx={{
//                     textAlign: "center",
//                     p: 8,
//                     bgcolor: "background.paper",
//                     borderRadius: 2,
//                     boxShadow: 1,
//                   }}
//                 >
//                   <RiUserLine size={64} color={theme.palette.text.disabled} />
//                   <Typography
//                     variant="h6"
//                     color="text.secondary"
//                     sx={{ mt: 2 }}
//                   >
//                     No users found
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     {searchTerm
//                       ? "Try adjusting your search"
//                       : "No users in your society yet"}
//                   </Typography>
//                 </Box>
//               ) : (
//                 paginatedUsers.map((user) => (
//                   <MobileUserCard key={user.id} user={user} />
//                 ))
//               )}
//             </Box>
//           ) : (
//             /* Desktop View */
//             <Paper
//               sx={{
//                 width: "100%",
//                 overflow: "hidden",
//                 borderRadius: 2,
//                 boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//               }}
//             >
//               <TableContainer>
//                 <Table>
//                   <TableHead>
//                     <TableRow sx={{ bgcolor: "background.default" }}>
//                       <TableCell sx={{ fontWeight: "600" }}>User</TableCell>
//                       <TableCell sx={{ fontWeight: "600" }}>Contact</TableCell>
//                       <TableCell sx={{ fontWeight: "600" }}>
//                         Building & Flats
//                       </TableCell>
//                       <TableCell sx={{ fontWeight: "600" }}>Role</TableCell>
//                       <TableCell sx={{ fontWeight: "600" }}>Status</TableCell>
//                       <TableCell sx={{ fontWeight: "600" }}>Joined</TableCell>
//                       <TableCell sx={{ fontWeight: "600" }}>Actions</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {paginatedUsers.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
//                           <RiUserLine
//                             size={48}
//                             color={theme.palette.text.disabled}
//                           />
//                           <Typography
//                             variant="h6"
//                             color="text.secondary"
//                             sx={{ mt: 2 }}
//                           >
//                             No users found
//                           </Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {searchTerm
//                               ? "Try adjusting your search"
//                               : "No users in your society yet"}
//                           </Typography>
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginatedUsers.map((user) => (
//                         <TableRow
//                           key={user.id}
//                           hover
//                           sx={{
//                             "&:last-child td": { borderBottom: 0 },
//                             transition: "background-color 0.2s",
//                           }}
//                         >
//                           <TableCell>
//                             <Stack
//                               direction="row"
//                               alignItems="center"
//                               spacing={2}
//                             >
//                               <Avatar
//                                 src={user.profilePicture}
//                                 sx={{
//                                   bgcolor: getAvatarColor(user.fullName),
//                                   width: 40,
//                                   height: 40,
//                                 }}
//                               >
//                                 {user.avatar}
//                               </Avatar>
//                               <Box>
//                                 <Typography variant="body2" fontWeight="600">
//                                   {user.fullName}
//                                 </Typography>
//                                 <Typography
//                                   variant="caption"
//                                   color="text.secondary"
//                                 >
//                                   {user.email}
//                                 </Typography>
//                               </Box>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <Stack spacing={0.5}>
//                               <Stack
//                                 direction="row"
//                                 alignItems="center"
//                                 spacing={1}
//                               >
//                                 <MdOutlinePhone
//                                   size={14}
//                                   color={theme.palette.text.secondary}
//                                 />
//                                 <Typography variant="body2">
//                                   {user.phone}
//                                 </Typography>
//                               </Stack>
//                               <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                               >
//                                 {user.address}
//                               </Typography>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <Stack spacing={1}>
//                               <Stack
//                                 direction="row"
//                                 alignItems="center"
//                                 spacing={1}
//                               >
//                                 <RiBuildingLine
//                                   size={14}
//                                   color={theme.palette.text.secondary}
//                                 />
//                                 <Typography variant="body2" fontWeight="500">
//                                   {user.buildingName}
//                                 </Typography>
//                               </Stack>
//                               <Tooltip
//                                 title={user.flatNumbers || "No flats assigned"}
//                               >
//                                 <Chip
//                                   icon={<RiHomeLine size={14} />}
//                                   label={`${user.flatsCount} flat${user.flatsCount !== 1 ? "s" : ""}`}
//                                   size="small"
//                                   variant="outlined"
//                                   sx={{ width: "fit-content" }}
//                                 />
//                               </Tooltip>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={user.societyRole}
//                               size="small"
//                               color={getRoleColor(user.societyRole)}
//                               sx={{ fontWeight: "500" }}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               label={user.status}
//                               size="small"
//                               color={getStatusColor(user.status)}
//                               sx={{
//                                 fontWeight: "500",
//                                 textTransform: "capitalize",
//                               }}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Stack
//                               direction="row"
//                               alignItems="center"
//                               spacing={1}
//                             >
//                               <MdOutlineDateRange
//                                 size={14}
//                                 color={theme.palette.text.secondary}
//                               />
//                               <Typography variant="body2">
//                                 {user.joinDate}
//                               </Typography>
//                             </Stack>
//                           </TableCell>
//                           <TableCell>
//                             <IconButton
//                               size="small"
//                               onClick={(e) => handleActionClick(e, user.id)}
//                               sx={{
//                                 border: `1px solid ${theme.palette.divider}`,
//                                 borderRadius: 1,
//                               }}
//                             >
//                               <FiMoreVertical size={18} />
//                             </IconButton>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </TableContainer>

//               {/* Pagination */}
//               {filteredUsers.length > 0 && (
//                 <TablePagination
//                   rowsPerPageOptions={[10, 25, 50]}
//                   component="div"
//                   count={filteredUsers.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   onPageChange={handleChangePage}
//                   onRowsPerPageChange={handleChangeRowsPerPage}
//                   sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
//                 />
//               )}
//             </Paper>
//           )}
//         </>
//       )}

//       {/* Filter Menu */}
//       <Menu
//         anchorEl={filterAnchorEl}
//         open={Boolean(filterAnchorEl)}
//         onClose={handleFilterClose}
//         PaperProps={{
//           sx: {
//             width: 200,
//             borderRadius: 2,
//             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//           },
//         }}
//       >
//         <MenuItem onClick={() => handleFilterClose()}>
//           <FiFilter size={16} style={{ marginRight: 8 }} />
//           Filter Options
//         </MenuItem>
//         <MenuItem
//           onClick={() => {
//             setStatusFilter("all");
//             setRoleFilter("all");
//             handleFilterClose();
//           }}
//         >
//           Clear All Filters
//         </MenuItem>
//       </Menu>

//       {/* Action Menu */}
//       <Menu
//         anchorEl={actionAnchorEl}
//         open={Boolean(actionAnchorEl)}
//         onClose={handleActionClose}
//         PaperProps={{
//           sx: {
//             width: 180,
//             borderRadius: 2,
//             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
//           },
//         }}
//       >
//         <MenuItem onClick={() => handleViewUser(selectedUserId)}>
//           <FiEye size={16} style={{ marginRight: 8 }} />
//           View Details
//         </MenuItem>
//         <MenuItem onClick={() => handleEditUser(selectedUserId)}>
//           <FiEdit size={16} style={{ marginRight: 8 }} />
//           Edit User
//         </MenuItem>
//         <MenuItem
//           onClick={() => handleDeleteUser(selectedUserId)}
//           sx={{ color: "error.main" }}
//         >
//           <FiTrash2 size={16} style={{ marginRight: 8 }} />
//           Delete
//         </MenuItem>
//       </Menu>

//       <style jsx>{`
//         @keyframes spin {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }
//         .spin {
//           animation: spin 1s linear infinite;
//         }
//       `}</style>
//     </Box>
//   );
// }
import React from "react";

export default function AdminUsers() {
  return <div>AdminUsers</div>;
}
