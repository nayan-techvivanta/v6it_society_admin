// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Box,
//   TextField,
//   Button,
//   Card,
//   CardContent,
//   Typography,
//   IconButton,
//   Paper,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   Chip,
//   Divider,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Switch,
//   FormControlLabel,
//   ToggleButton,
//   ToggleButtonGroup,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Avatar,
//   AvatarGroup,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Autocomplete,
// } from "@mui/material";
// import {
//   CloudUpload as CloudUploadIcon,
//   Delete as DeleteIcon,
//   Send as SendIcon,
//   AttachFile as AttachFileIcon,
//   Image as ImageIcon,
//   Description as DescriptionIcon,
//   Announcement as AnnouncementIcon,
//   Business as BuildingIcon,
//   Apartment as ApartmentIcon,
//   Visibility as VisibilityIcon,
//   Edit as EditIcon,
//   DeleteForever as DeleteForeverIcon,
//   List as ListIcon,
//   Add as AddIcon,
//   Download as DownloadIcon,
//   LocationCity as SocietyIcon,
// } from "@mui/icons-material";
// import { styled } from "@mui/material/styles";
// import { supabase } from "../../api/supabaseClient";
// import { uploadImage } from "../../api/uploadImage";

// // Styled components for custom design
// const VisuallyHiddenInput = styled("input")({
//   clip: "rect(0 0 0 0)",
//   clipPath: "inset(50%)",
//   height: 1,
//   overflow: "hidden",
//   position: "absolute",
//   bottom: 0,
//   left: 0,
//   whiteSpace: "nowrap",
//   width: 1,
// });

// const StyledCard = styled(Card)(({ theme }) => ({
//   borderRadius: "12px",
//   boxShadow: "0 4px 20px rgba(111, 11, 20, 0.08)",
//   background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
//   border: "1px solid rgba(111, 11, 20, 0.1)",
//   backdropFilter: "blur(10px)",
// }));

// const GradientButton = styled(Button)(({ theme }) => ({
//   background: "linear-gradient(135deg, #6F0B14 0%, #8A0F1B 60%, #6F0B14 100%)",
//   color: "#FFFFFF",
//   fontFamily: "'Roboto', sans-serif",
//   fontWeight: 600,
//   borderRadius: "10px",
//   textTransform: "none",
//   fontSize: "15px",
//   letterSpacing: "0.4px",
//   boxShadow: "0 6px 18px rgba(111, 11, 20, 0.25)",

//   "&:hover": {
//     background:
//       "linear-gradient(135deg, #8A0F1B 0%, #A51423 60%, #8A0F1B 100%)",
//     boxShadow: "0 10px 26px rgba(111, 11, 20, 0.35)",
//     transform: "translateY(-1px)",
//   },

//   "&:active": {
//     transform: "translateY(0)",
//     boxShadow: "0 5px 14px rgba(111, 11, 20, 0.3)",
//   },

//   "&:focus-visible": {
//     outline: "none",
//     boxShadow:
//       "0 0 0 3px rgba(165, 20, 35, 0.35), 0 8px 22px rgba(111, 11, 20, 0.35)",
//   },

//   "&:disabled": {
//     background: "#E5E7EB",
//     color: "#9CA3AF",
//     boxShadow: "none",
//     transform: "none",
//     cursor: "not-allowed",
//   },

//   transition: "background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
// }));

// const FileUploadArea = styled(Paper)(({ theme, isdragging }) => ({
//   border: "2px dashed",
//   borderColor: isdragging === "true" ? "#6F0B14" : "#D1D5DB",
//   borderRadius: "12px",
//   padding: "40px 20px",
//   textAlign: "center",
//   cursor: "pointer",
//   background: isdragging === "true" ? "rgba(111, 11, 20, 0.05)" : "transparent",
//   transition: "all 0.3s ease",
//   "&:hover": {
//     borderColor: "#6F0B14",
//     background: "rgba(111, 11, 20, 0.05)",
//   },
// }));

// // Animation variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: {
//     y: 0,
//     opacity: 1,
//     transition: {
//       type: "spring",
//       stiffness: 100,
//       damping: 12,
//     },
//   },
// };

// const PMBroadCast = () => {
//   // View mode: 'create' or 'list'
//   const [viewMode, setViewMode] = useState("create");

//   // Broadcast list data
//   const [broadcasts, setBroadcasts] = useState([]);
//   const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
//   const [selectedBroadcast, setSelectedBroadcast] = useState(null);
//   const [viewDialogOpen, setViewDialogOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [broadcastToDelete, setBroadcastToDelete] = useState(null);

//   // Create form data
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "general",
//     scheduleForLater: false,
//     scheduledDate: "",
//     scheduledTime: "",
//     broadcastType: "society",
//     societyId: null,
//     buildingId: null,
//   });

//   const [files, setFiles] = useState([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });

//   // Get PM ID from localStorage
//   const [pmId, setPmId] = useState(null);
//   const [assignedSocieties, setAssignedSocieties] = useState([]);
//   const [buildings, setBuildings] = useState([]);
//   const [loadingSocieties, setLoadingSocieties] = useState(false);
//   const [loadingBuildings, setLoadingBuildings] = useState(false);
//   const fileInputRef = useRef(null);

//   // Fetch PM ID and assigned societies
//   useEffect(() => {
//     const fetchPMData = async () => {
//       const profileId = localStorage.getItem("profileId");
//       if (!profileId) {
//         setSnackbar({
//           open: true,
//           message: "Please login to access broadcast features.",
//           severity: "error",
//         });
//         return;
//       }

//       setPmId(profileId);
//       await fetchAssignedSocieties(profileId);
//     };

//     fetchPMData();
//   }, []);

//   // Fetch societies assigned to this PM
//   const fetchAssignedSocieties = async (pmId) => {
//     setLoadingSocieties(true);
//     try {
//       // First, get society IDs from pm_society table
//       const { data: pmSocieties, error: pmError } = await supabase
//         .from("pm_society")
//         .select("society_id")
//         .eq("pm_id", pmId);

//       if (pmError) throw pmError;

//       if (!pmSocieties || pmSocieties.length === 0) {
//         setAssignedSocieties([]);
//         setSnackbar({
//           open: true,
//           message: "No societies are assigned to you yet.",
//           severity: "info",
//         });
//         return;
//       }

//       const societyIds = pmSocieties.map((item) => item.society_id);

//       // Then, get full society details
//       const { data: societiesData, error: societiesError } = await supabase
//         .from("societies")
//         .select("*")
//         .in("id", societyIds)
//         .order("name", { ascending: true });

//       if (societiesError) throw societiesError;

//       setAssignedSocieties(societiesData || []);

//       // Set first society as default if available
//       if (societiesData && societiesData.length > 0) {
//         setFormData((prev) => ({
//           ...prev,
//           societyId: societiesData[0].id,
//         }));
//         await fetchBuildingsForSociety(societiesData[0].id);
//       }
//     } catch (error) {
//       console.error("Error fetching assigned societies:", error);
//       setSnackbar({
//         open: true,
//         message: "Failed to load your assigned societies.",
//         severity: "error",
//       });
//     } finally {
//       setLoadingSocieties(false);
//     }
//   };

//   // Fetch buildings for a specific society
//   const fetchBuildingsForSociety = async (societyId) => {
//     if (!societyId) return;

//     setLoadingBuildings(true);
//     try {
//       const { data, error } = await supabase
//         .from("buildings")
//         .select("id, name")
//         .eq("society_id", societyId)
//         .order("name");

//       if (error) throw error;

//       setBuildings(data || []);

//       // Set first building as default if available and broadcast type is building
//       if (data && data.length > 0 && formData.broadcastType === "building") {
//         setFormData((prev) => ({
//           ...prev,
//           buildingId: data[0].id,
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching buildings:", error);
//       setSnackbar({
//         open: true,
//         message: "Failed to load buildings for this society.",
//         severity: "error",
//       });
//     } finally {
//       setLoadingBuildings(false);
//     }
//   };

//   const fetchBroadcasts = async () => {
//     if (!pmId) {
//       setSnackbar({
//         open: true,
//         message: "PM ID not found. Please login again.",
//         severity: "error",
//       });
//       return;
//     }

//     setLoadingBroadcasts(true);
//     try {
//       const { data: pmSocieties, error: pmError } = await supabase
//         .from("pm_society")
//         .select("society_id")
//         .eq("pm_id", pmId);

//       if (pmError) throw pmError;

//       if (!pmSocieties || pmSocieties.length === 0) {
//         setBroadcasts([]);
//         return;
//       }

//       const societyIds = pmSocieties.map((item) => item.society_id);

//       const { data, error } = await supabase
//         .from("broadcast")
//         .select(
//           `
//           *,
//           buildings(name),
//           societies(name)
//         `,
//         )
//         .in("socity_id", societyIds)
//         .order("created_at", { ascending: false });

//       if (error) throw error;

//       setBroadcasts(data || []);
//     } catch (error) {
//       console.error("Error fetching broadcasts:", error);
//       setSnackbar({
//         open: true,
//         message: "Failed to load broadcasts. Please try again.",
//         severity: "error",
//       });
//       setBroadcasts([]);
//     } finally {
//       setLoadingBroadcasts(false);
//     }
//   };

//   // Handle view mode change
//   const handleViewModeChange = (event, newViewMode) => {
//     if (!newViewMode || newViewMode === viewMode) return;

//     setViewMode(newViewMode);

//     if (newViewMode === "create") {
//       setLoadingBroadcasts(false);
//       resetCreateForm();
//     }

//     if (newViewMode === "list") {
//       setLoadingBroadcasts(true);
//       fetchBroadcasts();
//     }
//   };

//   // Handle society change
//   const handleSocietyChange = (event) => {
//     const societyId = event.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       societyId,
//       buildingId: null,
//     }));
//     fetchBuildingsForSociety(societyId);
//   };

//   // Handle broadcast type change
//   const handleBroadcastTypeChange = (event) => {
//     const broadcastType = event.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       broadcastType,
//       buildingId:
//         broadcastType === "building" && buildings.length > 0
//           ? buildings[0].id
//           : null,
//     }));
//   };

//   // View broadcast details
//   const handleViewBroadcast = (broadcast) => {
//     setSelectedBroadcast(broadcast);
//     setViewDialogOpen(true);
//   };

//   // Delete broadcast
//   const handleDeleteBroadcast = async () => {
//     try {
//       const { error } = await supabase
//         .from("broadcast")
//         .delete()
//         .eq("id", broadcastToDelete.id);

//       if (error) throw error;

//       // Remove from local state
//       setBroadcasts(broadcasts.filter((b) => b.id !== broadcastToDelete.id));

//       setSnackbar({
//         open: true,
//         message: "Broadcast deleted successfully!",
//         severity: "success",
//       });

//       setDeleteDialogOpen(false);
//       setBroadcastToDelete(null);
//     } catch (error) {
//       console.error("Error deleting broadcast:", error);
//       setSnackbar({
//         open: true,
//         message: "Failed to delete broadcast.",
//         severity: "error",
//       });
//     }
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const resetCreateForm = useCallback(() => {
//     const defaultSocietyId =
//       assignedSocieties.length > 0 ? assignedSocieties[0].id : null;
//     setFormData({
//       title: "",
//       description: "",
//       category: "general",
//       scheduleForLater: false,
//       scheduledDate: "",
//       scheduledTime: "",
//       broadcastType: "society",
//       societyId: defaultSocietyId,
//       buildingId: null,
//     });
//     setFiles([]);
//     setLoading(false);
//     setIsDragging(false);
//   }, [assignedSocieties]);

//   // Get file URLs from document string
//   const getFileUrls = (documentString) => {
//     if (!documentString) return [];
//     return documentString.split(",").filter((url) => url.trim() !== "");
//   };

//   // Download file
//   const handleDownload = (url, filename) => {
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = filename || "download";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Form handlers
//   const handleInputChange = (e) => {
//     const { name, value, checked, type } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleFileChange = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     addFiles(selectedFiles);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     addFiles(droppedFiles);
//   };

//   const addFiles = (newFiles) => {
//     const validFiles = newFiles.filter((file) => {
//       const maxSize = 10 * 1024 * 1024; // 10MB
//       const allowedTypes = [
//         "image/jpeg",
//         "image/png",
//         "image/gif",
//         "application/pdf",
//         "application/msword",
//       ];

//       if (file.size > maxSize) {
//         setSnackbar({
//           open: true,
//           message: `File ${file.name} is too large. Maximum size is 10MB.`,
//           severity: "error",
//         });
//         return false;
//       }

//       if (!allowedTypes.includes(file.type)) {
//         setSnackbar({
//           open: true,
//           message: `File type ${file.type} is not supported.`,
//           severity: "error",
//         });
//         return false;
//       }

//       return true;
//     });

//     setFiles((prev) => [
//       ...prev,
//       ...validFiles.map((file) => ({
//         file,
//         id: Date.now() + Math.random(),
//         name: file.name,
//         size: file.size,
//         type: file.type,
//       })),
//     ]);
//   };

//   const removeFile = (id) => {
//     setFiles((prev) => prev.filter((file) => file.id !== id));
//   };

//   const getFileIcon = (type) => {
//     if (type.startsWith("image/")) return <ImageIcon />;
//     if (type === "application/pdf") return <DescriptionIcon />;
//     return <AttachFileIcon />;
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   // Upload file to Supabase storage
//   const uploadFileToSupabase = async (file) => {
//     try {
//       const result = await uploadImage(file);
//       return result.url;
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       throw new Error(`Failed to upload ${file.name}: ${error.message}`);
//     }
//   };

//   // Save broadcast to database
//   const saveBroadcastToDatabase = async (broadcastData, fileUrls) => {
//     const { data, error } = await supabase
//       .from("broadcast")
//       .insert([broadcastData])
//       .select();

//     if (error) throw error;
//     return data;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.title.trim()) {
//       setSnackbar({
//         open: true,
//         message: "Please enter a title for the broadcast",
//         severity: "error",
//       });
//       return;
//     }

//     if (!formData.description.trim()) {
//       setSnackbar({
//         open: true,
//         message: "Please enter a description",
//         severity: "error",
//       });
//       return;
//     }

//     if (!formData.societyId) {
//       setSnackbar({
//         open: true,
//         message: "Please select a society",
//         severity: "error",
//       });
//       return;
//     }

//     if (formData.broadcastType === "building" && !formData.buildingId) {
//       setSnackbar({
//         open: true,
//         message: "Please select a building",
//         severity: "error",
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       // Upload files if any
//       let fileUrls = [];
//       if (files.length > 0) {
//         const uploadPromises = files.map((file) =>
//           uploadFileToSupabase(file.file),
//         );
//         fileUrls = await Promise.all(uploadPromises);
//       }

//       // Prepare broadcast data
//       const broadcastData = {
//         title: formData.title.trim(),
//         message: formData.description.trim(),
//         socity_id: formData.societyId,
//         building_id:
//           formData.broadcastType === "building" ? formData.buildingId : null,
//         document: fileUrls.length > 0 ? fileUrls.join(",") : null,
//         created_at: new Date().toISOString(),
//       };

//       // Save to database
//       await saveBroadcastToDatabase(broadcastData, fileUrls);

//       // Success message
//       const societyName =
//         assignedSocieties.find((s) => s.id === formData.societyId)?.name ||
//         "the society";
//       const buildingName =
//         formData.broadcastType === "building"
//           ? buildings.find((b) => b.id === formData.buildingId)?.name ||
//             "selected building"
//           : null;

//       const successMessage =
//         formData.broadcastType === "building"
//           ? `Broadcast sent successfully to ${buildingName} in ${societyName}!`
//           : `Broadcast sent successfully to entire ${societyName}!`;

//       setSnackbar({
//         open: true,
//         message: successMessage,
//         severity: "success",
//       });

//       // Reset form
//       resetCreateForm();

//       // Switch to list view and refresh
//       setViewMode("list");
//       fetchBroadcasts();
//     } catch (error) {
//       console.error("Error sending broadcast:", error);
//       setSnackbar({
//         open: true,
//         message: `Failed to send broadcast: ${error.message}`,
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar((prev) => ({ ...prev, open: false }));
//   };

//   // Get society name by ID
//   const getSocietyName = (societyId) => {
//     const society = assignedSocieties.find((s) => s.id === societyId);
//     return society ? society.name : "Unknown Society";
//   };

//   // Render create form
//   const renderCreateForm = () => (
//     <form onSubmit={handleSubmit}>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Form */}
//         <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
//           <StyledCard>
//             <CardContent className="p-6 space-y-6">
//               {/* Title */}
//               <motion.div variants={itemVariants}>
//                 <TextField
//                   fullWidth
//                   label="Broadcast Title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   variant="outlined"
//                   required
//                   placeholder="Enter announcement title..."
//                   InputProps={{
//                     sx: {
//                       borderRadius: "8px",
//                       backgroundColor: "rgba(255, 255, 255, 0.8)",
//                       fontFamily: "'Roboto', sans-serif",
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "rgba(111, 11, 20, 0.2)",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                         borderWidth: "2px",
//                       },
//                     },
//                   }}
//                   InputLabelProps={{
//                     sx: {
//                       fontFamily: "'Roboto', sans-serif",
//                       color: "#6F0B14",
//                     },
//                   }}
//                 />
//               </motion.div>

//               {/* Description */}
//               <motion.div variants={itemVariants}>
//                 <TextField
//                   fullWidth
//                   label="Description"
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   variant="outlined"
//                   required
//                   multiline
//                   rows={6}
//                   placeholder="Write your announcement details here..."
//                   InputProps={{
//                     sx: {
//                       borderRadius: "8px",
//                       backgroundColor: "rgba(255, 255, 255, 0.8)",
//                       fontFamily: "'Roboto', sans-serif",
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "rgba(111, 11, 20, 0.2)",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                         borderWidth: "2px",
//                       },
//                     },
//                   }}
//                   InputLabelProps={{
//                     sx: {
//                       fontFamily: "'Roboto', sans-serif",
//                       color: "#6F0B14",
//                     },
//                   }}
//                 />
//               </motion.div>

//               {/* Society Selection */}
//               <motion.div variants={itemVariants}>
//                 <FormControl fullWidth>
//                   <InputLabel
//                     sx={{
//                       fontFamily: "'Roboto', sans-serif",
//                       color: "#6F0B14",
//                     }}
//                   >
//                     Select Society
//                   </InputLabel>
//                   <Select
//                     name="societyId"
//                     value={formData.societyId || ""}
//                     onChange={handleSocietyChange}
//                     label="Select Society"
//                     disabled={
//                       loadingSocieties || assignedSocieties.length === 0
//                     }
//                     sx={{
//                       fontFamily: "'Roboto', sans-serif",
//                       borderRadius: "8px",
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "rgba(111, 11, 20, 0.2)",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                         borderWidth: "2px",
//                       },
//                     }}
//                   >
//                     {loadingSocieties ? (
//                       <MenuItem disabled>
//                         <CircularProgress size={20} className="mr-2" />
//                         Loading societies...
//                       </MenuItem>
//                     ) : assignedSocieties.length === 0 ? (
//                       <MenuItem disabled>No societies assigned to you</MenuItem>
//                     ) : (
//                       assignedSocieties.map((society) => (
//                         <MenuItem
//                           key={society.id}
//                           value={society.id}
//                           sx={{ fontFamily: "'Roboto', sans-serif" }}
//                         >
//                           <SocietyIcon
//                             className="mr-2 text-primary"
//                             fontSize="small"
//                           />
//                           {society.name}
//                         </MenuItem>
//                       ))
//                     )}
//                   </Select>
//                 </FormControl>
//               </motion.div>

//               {/* Broadcast Type Selection */}
//               <motion.div variants={itemVariants}>
//                 <FormControl fullWidth>
//                   <InputLabel
//                     sx={{
//                       fontFamily: "'Roboto', sans-serif",
//                       color: "#6F0B14",
//                     }}
//                   >
//                     Send To
//                   </InputLabel>
//                   <Select
//                     name="broadcastType"
//                     value={formData.broadcastType}
//                     onChange={handleBroadcastTypeChange}
//                     label="Send To"
//                     disabled={!formData.societyId || buildings.length === 0}
//                     sx={{
//                       fontFamily: "'Roboto', sans-serif",
//                       borderRadius: "8px",
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "rgba(111, 11, 20, 0.2)",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#6F0B14",
//                         borderWidth: "2px",
//                       },
//                     }}
//                   >
//                     <MenuItem
//                       value="society"
//                       sx={{ fontFamily: "'Roboto', sans-serif" }}
//                     >
//                       <ApartmentIcon className="mr-2 text-primary" />
//                       Entire Society
//                     </MenuItem>
//                     <MenuItem
//                       value="building"
//                       sx={{ fontFamily: "'Roboto', sans-serif" }}
//                       disabled={buildings.length === 0}
//                     >
//                       <BuildingIcon className="mr-2 text-primary" />
//                       Specific Building
//                     </MenuItem>
//                   </Select>
//                 </FormControl>
//               </motion.div>

//               {/* Building Selection (shown only when broadcastType is 'building') */}
//               <AnimatePresence>
//                 {formData.broadcastType === "building" &&
//                   formData.societyId && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       variants={itemVariants}
//                     >
//                       <FormControl fullWidth>
//                         <InputLabel
//                           sx={{
//                             fontFamily: "'Roboto', sans-serif",
//                             color: "#6F0B14",
//                           }}
//                         >
//                           Select Building
//                         </InputLabel>
//                         <Select
//                           name="buildingId"
//                           value={formData.buildingId || ""}
//                           onChange={handleInputChange}
//                           label="Select Building"
//                           disabled={loadingBuildings || buildings.length === 0}
//                           sx={{
//                             fontFamily: "'Roboto', sans-serif",
//                             borderRadius: "8px",
//                             "& .MuiOutlinedInput-notchedOutline": {
//                               borderColor: "rgba(111, 11, 20, 0.2)",
//                             },
//                             "&:hover .MuiOutlinedInput-notchedOutline": {
//                               borderColor: "#6F0B14",
//                             },
//                             "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                               borderColor: "#6F0B14",
//                               borderWidth: "2px",
//                             },
//                           }}
//                         >
//                           {loadingBuildings ? (
//                             <MenuItem disabled>
//                               <CircularProgress size={20} className="mr-2" />
//                               Loading buildings...
//                             </MenuItem>
//                           ) : buildings.length === 0 ? (
//                             <MenuItem disabled>
//                               No buildings found in this society
//                             </MenuItem>
//                           ) : (
//                             buildings.map((building) => (
//                               <MenuItem
//                                 key={building.id}
//                                 value={building.id}
//                                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//                               >
//                                 {building.name}
//                               </MenuItem>
//                             ))
//                           )}
//                         </Select>
//                       </FormControl>
//                     </motion.div>
//                   )}
//               </AnimatePresence>
//             </CardContent>
//           </StyledCard>

//           {/* File Upload Section */}
//           <motion.div variants={itemVariants}>
//             <StyledCard>
//               <CardContent className="p-6">
//                 <Typography
//                   variant="h6"
//                   className="mb-4 font-semibold text-primary"
//                   sx={{ fontFamily: "'Roboto', sans-serif" }}
//                 >
//                   Attachments (Optional)
//                 </Typography>

//                 <FileUploadArea
//                   isdragging={isDragging.toString()}
//                   onDragOver={handleDragOver}
//                   onDragLeave={handleDragLeave}
//                   onDrop={handleDrop}
//                   onClick={() => fileInputRef.current.click()}
//                 >
//                   <CloudUploadIcon className="text-4xl text-primary mb-4" />
//                   <Typography
//                     variant="body1"
//                     className="mb-2 text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {isDragging
//                       ? "Drop files here"
//                       : "Drag & drop files or click to browse"}
//                   </Typography>
//                   <Typography
//                     variant="caption"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Supports images, PDF, DOC (Max 10MB per file)
//                   </Typography>
//                   <VisuallyHiddenInput
//                     ref={fileInputRef}
//                     type="file"
//                     multiple
//                     onChange={handleFileChange}
//                     accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
//                   />
//                 </FileUploadArea>

//                 {/* File List */}
//                 <AnimatePresence>
//                   {files.length > 0 && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="mt-6 space-y-3"
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         className="font-medium text-primary"
//                         sx={{ fontFamily: "'Roboto', sans-serif" }}
//                       >
//                         Selected Files ({files.length})
//                       </Typography>
//                       {files.map((file) => (
//                         <motion.div
//                           key={file.id}
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           exit={{ opacity: 0, x: 20 }}
//                           className="flex items-center justify-between p-3 bg-lightBackground rounded-lg"
//                         >
//                           <div className="flex items-center space-x-3">
//                             <div className="text-primary">
//                               {getFileIcon(file.type)}
//                             </div>
//                             <div>
//                               <Typography
//                                 variant="body2"
//                                 className="font-medium"
//                                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//                               >
//                                 {file.name}
//                               </Typography>
//                               <Typography
//                                 variant="caption"
//                                 className="text-hintText"
//                                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//                               >
//                                 {formatFileSize(file.size)}
//                               </Typography>
//                             </div>
//                           </div>
//                           <IconButton
//                             size="small"
//                             onClick={() => removeFile(file.id)}
//                             className="text-reject hover:bg-red-50"
//                           >
//                             <DeleteIcon fontSize="small" />
//                           </IconButton>
//                         </motion.div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </CardContent>
//             </StyledCard>
//           </motion.div>
//         </motion.div>

//         {/* Right Column - Preview & Send */}
//         <motion.div variants={itemVariants} className="space-y-6">
//           {/* Preview Card */}
//           <StyledCard>
//             <CardContent className="p-6">
//               <Typography
//                 variant="h6"
//                 className="mb-4 font-semibold text-primary"
//                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 Preview
//               </Typography>

//               <div className="space-y-4">
//                 <div>
//                   <Typography
//                     variant="caption"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Title
//                   </Typography>
//                   <Typography
//                     variant="body1"
//                     className="font-medium text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {formData.title || "No title entered"}
//                   </Typography>
//                 </div>

//                 <Divider className="bg-lightBackground" />

//                 <div>
//                   <Typography
//                     variant="caption"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Society
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     className="mt-1 font-medium text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {formData.societyId
//                       ? getSocietyName(formData.societyId)
//                       : "No society selected"}
//                   </Typography>
//                 </div>

//                 <Divider className="bg-lightBackground" />

//                 <div>
//                   <Typography
//                     variant="caption"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Send To
//                   </Typography>
//                   <div className="mt-1">
//                     <Chip
//                       label={
//                         formData.broadcastType === "society"
//                           ? "Entire Society"
//                           : buildings.find((b) => b.id === formData.buildingId)
//                               ?.name || "Select Building"
//                       }
//                       size="small"
//                       sx={{
//                         backgroundColor: "rgba(111, 11, 20, 0.1)",
//                         color: "#6F0B14",
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 500,
//                       }}
//                       icon={
//                         formData.broadcastType === "society" ? (
//                           <ApartmentIcon fontSize="small" />
//                         ) : (
//                           <BuildingIcon fontSize="small" />
//                         )
//                       }
//                     />
//                   </div>
//                 </div>

//                 {files.length > 0 && (
//                   <>
//                     <Divider className="bg-lightBackground" />
//                     <div>
//                       <Typography
//                         variant="caption"
//                         className="text-hintText"
//                         sx={{ fontFamily: "'Roboto', sans-serif" }}
//                       >
//                         Attachments
//                       </Typography>
//                       <Typography
//                         variant="body2"
//                         className="mt-1 text-primary"
//                         sx={{ fontFamily: "'Roboto', sans-serif" }}
//                       >
//                         {files.length} file{files.length !== 1 ? "s" : ""}{" "}
//                         attached
//                       </Typography>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </CardContent>
//           </StyledCard>

//           {/* Send Button */}
//           <motion.div
//             variants={itemVariants}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             <GradientButton
//               fullWidth
//               type="submit"
//               disabled={
//                 loading ||
//                 !formData.societyId ||
//                 (formData.broadcastType === "building" && !formData.buildingId)
//               }
//               startIcon={
//                 loading ? (
//                   <CircularProgress size={20} color="inherit" />
//                 ) : (
//                   <SendIcon />
//                 )
//               }
//               size="large"
//             >
//               {loading ? "Sending..." : "Send Broadcast"}
//             </GradientButton>
//           </motion.div>

//           {/* Quick Stats */}
//           <StyledCard>
//             <CardContent className="p-6">
//               <Typography
//                 variant="subtitle2"
//                 className="mb-3 text-hintText"
//                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 Broadcast Stats
//               </Typography>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <Typography
//                     variant="body2"
//                     className="text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Societies Assigned
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     className="font-medium text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {assignedSocieties.length}
//                   </Typography>
//                 </div>
//                 <div className="flex justify-between">
//                   <Typography
//                     variant="body2"
//                     className="text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Characters
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     className="font-medium text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {formData.description.length}/5000
//                   </Typography>
//                 </div>
//                 <div className="flex justify-between">
//                   <Typography
//                     variant="body2"
//                     className="text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Attachments
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     className="font-medium text-primary"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {files.length}/10
//                   </Typography>
//                 </div>
//               </div>
//             </CardContent>
//           </StyledCard>
//         </motion.div>
//       </div>
//     </form>
//   );

//   // Render broadcast list
//   const renderBroadcastList = () => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.3 }}
//     >
//       <StyledCard className="mb-6">
//         <CardContent className="p-6">
//           <div className="flex justify-between items-center mb-6">
//             <Typography
//               variant="h5"
//               className="font-bold text-primary"
//               sx={{ fontFamily: "'Roboto', sans-serif" }}
//             >
//               <ListIcon className="mr-3" />
//               Broadcast History
//             </Typography>
//             <div className="flex items-center space-x-4">
//               <Typography
//                 variant="body2"
//                 className="text-hintText"
//                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 Societies: {assignedSocieties.length} | Broadcasts:{" "}
//                 {broadcasts.length}
//               </Typography>
//             </div>
//           </div>

//           {loadingBroadcasts ? (
//             <div className="flex justify-center items-center py-12">
//               <CircularProgress sx={{ color: "#6F0B14" }} />
//             </div>
//           ) : broadcasts.length === 0 ? (
//             <div className="text-center py-12">
//               <AnnouncementIcon className="text-6xl text-gray-300 mb-4" />
//               <Typography
//                 variant="h6"
//                 className="text-gray-500 mb-2"
//                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 No broadcasts yet
//               </Typography>
//               <Typography
//                 variant="body2"
//                 className="text-gray-400 mb-4"
//                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 Create your first broadcast to get started
//               </Typography>
//               <GradientButton
//                 startIcon={<AddIcon />}
//                 onClick={(e) => handleViewModeChange(e, "create")}
//               >
//                 Create Broadcast
//               </GradientButton>
//             </div>
//           ) : (
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell
//                       sx={{
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 600,
//                         color: "#6F0B14",
//                       }}
//                     >
//                       Title
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 600,
//                         color: "#6F0B14",
//                       }}
//                     >
//                       Society
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 600,
//                         color: "#6F0B14",
//                       }}
//                     >
//                       Sent To
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 600,
//                         color: "#6F0B14",
//                       }}
//                     >
//                       Attachments
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 600,
//                         color: "#6F0B14",
//                       }}
//                     >
//                       Date
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontFamily: "'Roboto', sans-serif",
//                         fontWeight: 600,
//                         color: "#6F0B14",
//                       }}
//                     >
//                       Actions
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {broadcasts.map((broadcast) => (
//                     <TableRow key={broadcast.id} hover>
//                       <TableCell>
//                         <div>
//                           <Typography
//                             variant="subtitle2"
//                             sx={{
//                               fontFamily: "'Roboto', sans-serif",
//                               fontWeight: 600,
//                             }}
//                           >
//                             {broadcast.title}
//                           </Typography>
//                           <Typography
//                             variant="caption"
//                             className="text-hintText line-clamp-2"
//                             sx={{ fontFamily: "'Roboto', sans-serif" }}
//                           >
//                             {broadcast.message.substring(0, 100)}...
//                           </Typography>
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={broadcast.societies?.name || "Unknown Society"}
//                           size="small"
//                           sx={{
//                             backgroundColor: "rgba(111, 11, 20, 0.1)",
//                             color: "#6F0B14",
//                             fontFamily: "'Roboto', sans-serif",
//                             fontWeight: 500,
//                           }}
//                           icon={<SocietyIcon fontSize="small" />}
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={
//                             broadcast.building_id
//                               ? `Building: ${broadcast.buildings?.name || "Unknown"}`
//                               : "Entire Society"
//                           }
//                           size="small"
//                           sx={{
//                             backgroundColor: broadcast.building_id
//                               ? "rgba(111, 11, 20, 0.1)"
//                               : "rgba(0, 128, 0, 0.1)",
//                             color: broadcast.building_id
//                               ? "#6F0B14"
//                               : "#008000",
//                             fontFamily: "'Roboto', sans-serif",
//                             fontWeight: 500,
//                           }}
//                           icon={
//                             broadcast.building_id ? (
//                               <BuildingIcon fontSize="small" />
//                             ) : (
//                               <ApartmentIcon fontSize="small" />
//                             )
//                           }
//                         />
//                       </TableCell>
//                       <TableCell>
//                         {broadcast.document ? (
//                           <AvatarGroup max={3}>
//                             {getFileUrls(broadcast.document).map(
//                               (url, index) => (
//                                 <Tooltip
//                                   key={index}
//                                   title={`Attachment ${index + 1}`}
//                                 >
//                                   <Avatar
//                                     sx={{
//                                       width: 32,
//                                       height: 32,
//                                       bgcolor: "rgba(111, 11, 20, 0.1)",
//                                       cursor: "pointer",
//                                     }}
//                                     onClick={() =>
//                                       handleDownload(
//                                         url,
//                                         `attachment-${index + 1}`,
//                                       )
//                                     }
//                                   >
//                                     {url.includes(".pdf") ? (
//                                       <DescriptionIcon fontSize="small" />
//                                     ) : url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                                       <ImageIcon fontSize="small" />
//                                     ) : (
//                                       <AttachFileIcon fontSize="small" />
//                                     )}
//                                   </Avatar>
//                                 </Tooltip>
//                               ),
//                             )}
//                           </AvatarGroup>
//                         ) : (
//                           <Typography
//                             variant="caption"
//                             className="text-hintText"
//                             sx={{ fontFamily: "'Roboto', sans-serif" }}
//                           >
//                             No attachments
//                           </Typography>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <Typography
//                           variant="caption"
//                           sx={{ fontFamily: "'Roboto', sans-serif" }}
//                         >
//                           {formatDate(broadcast.created_at)}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex space-x-1">
//                           <IconButton
//                             size="small"
//                             onClick={() => handleViewBroadcast(broadcast)}
//                             className="text-primary hover:bg-lightBackground"
//                           >
//                             <VisibilityIcon fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             size="small"
//                             onClick={() => {
//                               setBroadcastToDelete(broadcast);
//                               setDeleteDialogOpen(true);
//                             }}
//                             className="text-reject hover:bg-red-50"
//                           >
//                             <DeleteForeverIcon fontSize="small" />
//                           </IconButton>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </CardContent>
//       </StyledCard>
//     </motion.div>
//   );

//   return (
//     <motion.div
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//       className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-roboto"
//     >
//       <div className="max-w-7xl mx-auto">
//         {/* Header with Toggle */}
//         <motion.div variants={itemVariants} className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <Typography
//                 variant="h4"
//                 className="font-semibold text-primary"
//                 sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 400 }}
//               >
//                 <AnnouncementIcon className="mr-3" />
//                 {viewMode === "create"
//                   ? "Create Broadcast"
//                   : "Broadcast History"}
//               </Typography>
//               <Typography
//                 variant="subtitle1"
//                 className="mt-2 text-hintText"
//                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//               >
//                 {viewMode === "create"
//                   ? "Send announcements to your assigned societies"
//                   : "View and manage your broadcast history"}
//                 {pmId && ` (PM ID: ${pmId})`}
//                 {assignedSocieties.length > 0 &&
//                   ` | ${assignedSocieties.length} societies assigned`}
//               </Typography>
//             </div>

//             <ToggleButtonGroup
//               value={viewMode}
//               exclusive
//               onChange={handleViewModeChange}
//               aria-label="view mode"
//               sx={{
//                 "& .MuiToggleButton-root": {
//                   fontFamily: "'Roboto', sans-serif",
//                   fontWeight: 500,
//                   borderColor: "#6F0B14",
//                   color: "#6F0B14",
//                   "&.Mui-selected": {
//                     backgroundColor: "#6F0B14",
//                     color: "#FFFFFF",
//                     "&:hover": {
//                       backgroundColor: "#8A0F1B",
//                     },
//                   },
//                   "&:not(.Mui-selected):hover": {
//                     backgroundColor: "rgba(111, 11, 20, 0.08)",
//                   },
//                 },
//               }}
//             >
//               <ToggleButton value="create" aria-label="create mode">
//                 <AddIcon className="mr-2" />
//                 Create New
//               </ToggleButton>
//               <ToggleButton value="list" aria-label="list mode">
//                 <ListIcon className="mr-2" />
//                 View List
//               </ToggleButton>
//             </ToggleButtonGroup>
//           </div>
//         </motion.div>

//         {viewMode === "create" ? (
//           renderCreateForm()
//         ) : loadingBroadcasts ? (
//           <div className="flex justify-center items-center py-20">
//             <CircularProgress sx={{ color: "#6F0B14" }} />
//             <Typography className="ml-4 text-primary">
//               Loading broadcasts...
//             </Typography>
//           </div>
//         ) : (
//           renderBroadcastList()
//         )}

//         {/* Create New Button in List View */}
//         {viewMode === "list" && broadcasts.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-6"
//           >
//             <GradientButton
//               fullWidth
//               startIcon={<AddIcon />}
//               onClick={(e) => handleViewModeChange(e, "create")}
//             >
//               Create New Broadcast
//             </GradientButton>
//           </motion.div>
//         )}
//       </div>

//       {/* View Broadcast Dialog */}
//       <Dialog
//         open={viewDialogOpen}
//         onClose={() => setViewDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle
//           sx={{ fontFamily: "'Roboto', sans-serif", color: "#6F0B14" }}
//         >
//           <AnnouncementIcon className="mr-2" />
//           Broadcast Details
//         </DialogTitle>
//         <DialogContent>
//           {selectedBroadcast && (
//             <div className="space-y-4 mt-2">
//               <div>
//                 <Typography
//                   variant="subtitle2"
//                   className="text-hintText"
//                   sx={{ fontFamily: "'Roboto', sans-serif" }}
//                 >
//                   Title
//                 </Typography>
//                 <Typography
//                   variant="body1"
//                   sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}
//                 >
//                   {selectedBroadcast.title}
//                 </Typography>
//               </div>

//               <Divider />

//               <div>
//                 <Typography
//                   variant="subtitle2"
//                   className="text-hintText"
//                   sx={{ fontFamily: "'Roboto', sans-serif" }}
//                 >
//                   Message
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   sx={{
//                     fontFamily: "'Roboto', sans-serif",
//                     whiteSpace: "pre-wrap",
//                   }}
//                 >
//                   {selectedBroadcast.message}
//                 </Typography>
//               </div>

//               <Divider />

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <Typography
//                     variant="subtitle2"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Society
//                   </Typography>
//                   <Chip
//                     label={
//                       selectedBroadcast.societies?.name || "Unknown Society"
//                     }
//                     size="small"
//                     sx={{
//                       backgroundColor: "rgba(111, 11, 20, 0.1)",
//                       color: "#6F0B14",
//                       fontFamily: "'Roboto', sans-serif",
//                       fontWeight: 500,
//                     }}
//                     icon={<SocietyIcon fontSize="small" />}
//                   />
//                 </div>

//                 <div>
//                   <Typography
//                     variant="subtitle2"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Sent To
//                   </Typography>
//                   <Chip
//                     label={
//                       selectedBroadcast.building_id
//                         ? `Building: ${selectedBroadcast.buildings?.name || "Unknown"}`
//                         : "Entire Society"
//                     }
//                     size="small"
//                     sx={{
//                       backgroundColor: selectedBroadcast.building_id
//                         ? "rgba(111, 11, 20, 0.1)"
//                         : "rgba(0, 128, 0, 0.1)",
//                       color: selectedBroadcast.building_id
//                         ? "#6F0B14"
//                         : "#008000",
//                       fontFamily: "'Roboto', sans-serif",
//                       fontWeight: 500,
//                     }}
//                     icon={
//                       selectedBroadcast.building_id ? (
//                         <BuildingIcon fontSize="small" />
//                       ) : (
//                         <ApartmentIcon fontSize="small" />
//                       )
//                     }
//                   />
//                 </div>

//                 <div>
//                   <Typography
//                     variant="subtitle2"
//                     className="text-hintText"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     Date Sent
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     sx={{ fontFamily: "'Roboto', sans-serif" }}
//                   >
//                     {formatDate(selectedBroadcast.created_at)}
//                   </Typography>
//                 </div>
//               </div>

//               {selectedBroadcast.document && (
//                 <>
//                   <Divider />
//                   <div>
//                     <Typography
//                       variant="subtitle2"
//                       className="text-hintText mb-2"
//                       sx={{ fontFamily: "'Roboto', sans-serif" }}
//                     >
//                       Attachments
//                     </Typography>
//                     <div className="space-y-2">
//                       {getFileUrls(selectedBroadcast.document).map(
//                         (url, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between p-2 bg-lightBackground rounded"
//                           >
//                             <div className="flex items-center space-x-2">
//                               {url.includes(".pdf") ? (
//                                 <DescriptionIcon className="text-primary" />
//                               ) : url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                                 <ImageIcon className="text-primary" />
//                               ) : (
//                                 <AttachFileIcon className="text-primary" />
//                               )}
//                               <Typography
//                                 variant="body2"
//                                 sx={{ fontFamily: "'Roboto', sans-serif" }}
//                               >
//                                 Attachment {index + 1}
//                               </Typography>
//                             </div>
//                             <IconButton
//                               size="small"
//                               onClick={() =>
//                                 handleDownload(url, `attachment-${index + 1}`)
//                               }
//                             >
//                               <DownloadIcon fontSize="small" />
//                             </IconButton>
//                           </div>
//                         ),
//                       )}
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setViewDialogOpen(false)}
//             sx={{ fontFamily: "'Roboto', sans-serif" }}
//           >
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//       >
//         <DialogTitle
//           sx={{ fontFamily: "'Roboto', sans-serif", color: "#B31B1B" }}
//         >
//           <DeleteForeverIcon className="mr-2" />
//           Confirm Delete
//         </DialogTitle>
//         <DialogContent>
//           <Typography sx={{ fontFamily: "'Roboto', sans-serif" }}>
//             Are you sure you want to delete this broadcast? This action cannot
//             be undone.
//           </Typography>
//           {broadcastToDelete && (
//             <Typography
//               variant="body2"
//               className="mt-2 font-medium"
//               sx={{ fontFamily: "'Roboto', sans-serif" }}
//             >
//               "{broadcastToDelete.title}"
//             </Typography>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => setDeleteDialogOpen(false)}
//             sx={{ fontFamily: "'Roboto', sans-serif", color: "#6F0B14" }}
//           >
//             Cancel
//           </Button>
//           <Button
//             onClick={handleDeleteBroadcast}
//             variant="contained"
//             sx={{
//               fontFamily: "'Roboto', sans-serif",
//               backgroundColor: "#B31B1B",
//               "&:hover": { backgroundColor: "#8A1515" },
//             }}
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           onClose={handleCloseSnackbar}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{
//             width: "100%",
//             fontFamily: "'Roboto', sans-serif",
//             "&.MuiAlert-filledSuccess": {
//               backgroundColor: "#008000",
//             },
//             "&.MuiAlert-filledError": {
//               backgroundColor: "#B31B1B",
//             },
//             "&.MuiAlert-filledWarning": {
//               backgroundColor: "#DBA400",
//             },
//             "&.MuiAlert-filledInfo": {
//               backgroundColor: "#6F0B14",
//             },
//           }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </motion.div>
//   );
// };

// export default PMBroadCast;
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Announcement as AnnouncementIcon,
  Business as BuildingIcon,
  Apartment as ApartmentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  DeleteForever as DeleteForeverIcon,
  List as ListIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  LocationCity as SocietyIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  People as PeopleIcon,
  SendAndArchive as SendAndArchiveIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { supabase } from "../../api/supabaseClient";
import { uploadImage } from "../../api/uploadImage";

// Styled components for custom design
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(111, 11, 20, 0.08)",
  background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
  border: "1px solid rgba(111, 11, 20, 0.1)",
  backdropFilter: "blur(10px)",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #6F0B14 0%, #8A0F1B 60%, #6F0B14 100%)",
  color: "#FFFFFF",
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 600,
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "15px",
  letterSpacing: "0.4px",
  boxShadow: "0 6px 18px rgba(111, 11, 20, 0.25)",

  "&:hover": {
    background:
      "linear-gradient(135deg, #8A0F1B 0%, #A51423 60%, #8A0F1B 100%)",
    boxShadow: "0 10px 26px rgba(111, 11, 20, 0.35)",
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 5px 14px rgba(111, 11, 20, 0.3)",
  },

  "&:focus-visible": {
    outline: "none",
    boxShadow:
      "0 0 0 3px rgba(165, 20, 35, 0.35), 0 8px 22px rgba(111, 11, 20, 0.35)",
  },

  "&:disabled": {
    background: "#E5E7EB",
    color: "#9CA3AF",
    boxShadow: "none",
    transform: "none",
    cursor: "not-allowed",
  },

  transition: "background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
}));

const NotificationButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
  color: "#FFFFFF",
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 600,
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "14px",
  letterSpacing: "0.3px",
  boxShadow: "0 4px 12px rgba(76, 175, 80, 0.25)",

  "&:hover": {
    background: "linear-gradient(135deg, #66BB6A 0%, #388E3C 100%)",
    boxShadow: "0 6px 18px rgba(76, 175, 80, 0.35)",
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 3px 10px rgba(76, 175, 80, 0.3)",
  },
}));

const FileUploadArea = styled(Paper)(({ theme, isdragging }) => ({
  border: "2px dashed",
  borderColor: isdragging === "true" ? "#6F0B14" : "#D1D5DB",
  borderRadius: "12px",
  padding: "40px 20px",
  textAlign: "center",
  cursor: "pointer",
  background: isdragging === "true" ? "rgba(111, 11, 20, 0.05)" : "transparent",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#6F0B14",
    background: "rgba(111, 11, 20, 0.05)",
  },
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// Notification functions
const sendAndSaveNotification = async ({ title, body, userId, type }) => {
  try {
    // 1. Save notification in DB
    const { error: insertError } = await supabase.from("notifications").insert({
      title,
      body,
      type,
      user_id: userId,
      is_read: false,
      is_delete: false,
      created_at: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    // 2. Get user FCM token
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("fcm_token")
      .eq("id", userId)
      .single();

    if (userError || !user?.fcm_token) {
      console.warn(`No FCM token found for user ${userId}`);
      return;
    }

    // 3. Call edge function to send push notification
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          tokens: [user.fcm_token],
          title,
          body,
          type,
          data: {
            broadcastId: Date.now().toString(),
            type: "broadcast",
            priority: "high",
          },
        },
      });
    } catch (fcmError) {
      console.warn("FCM notification failed, but DB record saved:", fcmError);
      // Continue even if FCM fails - at least DB record is saved
    }
  } catch (err) {
    console.error("Notification Error:", err);
    throw err; // Re-throw to handle in calling function
  }
};

const fetchTenantsForBroadcast = async ({ societyId, buildingId }) => {
  let query = supabase
    .from("users")
    .select("id, fcm_token, email, phone")
    .eq("is_delete", false)
    .in("role_type", ["Tanent-M", "Tanent-O"]);

  if (buildingId) {
    query = query.eq("building_id", buildingId);
  } else {
    query = query.eq("society_id", societyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

const PMBroadCast = () => {
  // View mode: 'create' or 'list'
  const [viewMode, setViewMode] = useState("create");

  // Broadcast list data
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState(null);

  // Create form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    scheduleForLater: false,
    scheduledDate: "",
    scheduledTime: "",
    broadcastType: "society",
    societyId: null,
    buildingId: null,
    sendNotifications: true, // New field for notification toggle
  });

  // Notification preview
  const [notificationPreview, setNotificationPreview] = useState({
    tenantCount: 0,
    estimatedTenants: 0,
    sendingNotifications: false,
  });

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get PM ID from localStorage
  const [pmId, setPmId] = useState(null);
  const [assignedSocieties, setAssignedSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch PM ID and assigned societies
  useEffect(() => {
    const fetchPMData = async () => {
      const profileId = localStorage.getItem("profileId");
      if (!profileId) {
        setSnackbar({
          open: true,
          message: "Please login to access broadcast features.",
          severity: "error",
        });
        return;
      }

      setPmId(profileId);
      await fetchAssignedSocieties(profileId);
    };

    fetchPMData();
  }, []);

  // Estimate tenant count when society or building changes
  useEffect(() => {
    const estimateTenantCount = async () => {
      if (!formData.societyId) {
        setNotificationPreview((prev) => ({ ...prev, estimatedTenants: 0 }));
        return;
      }

      try {
        const tenants = await fetchTenantsForBroadcast({
          societyId: formData.societyId,
          buildingId:
            formData.broadcastType === "building" ? formData.buildingId : null,
        });

        setNotificationPreview((prev) => ({
          ...prev,
          estimatedTenants: tenants.length,
        }));
      } catch (error) {
        console.error("Error estimating tenant count:", error);
      }
    };

    estimateTenantCount();
  }, [formData.societyId, formData.buildingId, formData.broadcastType]);

  // Fetch societies assigned to this PM
  const fetchAssignedSocieties = async (pmId) => {
    setLoadingSocieties(true);
    try {
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", pmId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setAssignedSocieties([]);
        setSnackbar({
          open: true,
          message: "No societies are assigned to you yet.",
          severity: "info",
        });
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      const { data: societiesData, error: societiesError } = await supabase
        .from("societies")
        .select("*")
        .in("id", societyIds)
        .order("name", { ascending: true });

      if (societiesError) throw societiesError;

      setAssignedSocieties(societiesData || []);

      if (societiesData && societiesData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          societyId: societiesData[0].id,
        }));
        await fetchBuildingsForSociety(societiesData[0].id);
      }
    } catch (error) {
      console.error("Error fetching assigned societies:", error);
      setSnackbar({
        open: true,
        message: "Failed to load your assigned societies.",
        severity: "error",
      });
    } finally {
      setLoadingSocieties(false);
    }
  };

  // Fetch buildings for a specific society
  const fetchBuildingsForSociety = async (societyId) => {
    if (!societyId) return;

    setLoadingBuildings(true);
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name")
        .eq("society_id", societyId)
        .order("name");

      if (error) throw error;

      setBuildings(data || []);

      if (data && data.length > 0 && formData.broadcastType === "building") {
        setFormData((prev) => ({
          ...prev,
          buildingId: data[0].id,
        }));
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setSnackbar({
        open: true,
        message: "Failed to load buildings for this society.",
        severity: "error",
      });
    } finally {
      setLoadingBuildings(false);
    }
  };

  const fetchBroadcasts = async () => {
    if (!pmId) {
      setSnackbar({
        open: true,
        message: "PM ID not found. Please login again.",
        severity: "error",
      });
      return;
    }

    setLoadingBroadcasts(true);
    try {
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", pmId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setBroadcasts([]);
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      const { data, error } = await supabase
        .from("broadcast")
        .select(
          `
          *,
          buildings(name),
          societies(name)
        `,
        )
        .in("socity_id", societyIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBroadcasts(data || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      setSnackbar({
        open: true,
        message: "Failed to load broadcasts. Please try again.",
        severity: "error",
      });
      setBroadcasts([]);
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  // Send notifications to tenants
  const sendNotificationsToTenants = async (broadcastData) => {
    if (!formData.sendNotifications) {
      return { success: true, count: 0, message: "Notifications disabled" };
    }

    setNotificationPreview((prev) => ({ ...prev, sendingNotifications: true }));

    try {
      // Fetch tenants
      const tenants = await fetchTenantsForBroadcast({
        societyId: formData.societyId,
        buildingId:
          formData.broadcastType === "building" ? formData.buildingId : null,
      });

      if (tenants.length === 0) {
        return { success: true, count: 0, message: "No tenants found" };
      }

      // Send notifications to each tenant
      const notificationPromises = tenants.map((tenant) =>
        sendAndSaveNotification({
          title: formData.title,
          body: formData.description,
          userId: tenant.id,
          type: "broadcast",
        }).catch((err) => {
          console.error(
            `Failed to send notification to user ${tenant.id}:`,
            err,
          );
          return { success: false, userId: tenant.id };
        }),
      );

      const results = await Promise.allSettled(notificationPromises);

      const successful = results.filter(
        (result) => result.status === "fulfilled",
      ).length;
      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;

      return {
        success: true,
        count: successful,
        failed,
        total: tenants.length,
        message: `Notifications sent to ${successful} tenants${failed > 0 ? ` (${failed} failed)` : ""}`,
      };
    } catch (error) {
      console.error("Error sending notifications:", error);
      return {
        success: false,
        count: 0,
        message: "Failed to send notifications",
        error: error.message,
      };
    } finally {
      setNotificationPreview((prev) => ({
        ...prev,
        sendingNotifications: false,
      }));
    }
  };

  // Handle view mode change
  const handleViewModeChange = (event, newViewMode) => {
    if (!newViewMode || newViewMode === viewMode) return;

    setViewMode(newViewMode);

    if (newViewMode === "create") {
      setLoadingBroadcasts(false);
      resetCreateForm();
    }

    if (newViewMode === "list") {
      setLoadingBroadcasts(true);
      fetchBroadcasts();
    }
  };

  // Handle society change
  const handleSocietyChange = (event) => {
    const societyId = event.target.value;
    setFormData((prev) => ({
      ...prev,
      societyId,
      buildingId: null,
    }));
    fetchBuildingsForSociety(societyId);
  };

  // Handle broadcast type change
  const handleBroadcastTypeChange = (event) => {
    const broadcastType = event.target.value;
    setFormData((prev) => ({
      ...prev,
      broadcastType,
      buildingId:
        broadcastType === "building" && buildings.length > 0
          ? buildings[0].id
          : null,
    }));
  };

  // View broadcast details
  const handleViewBroadcast = (broadcast) => {
    setSelectedBroadcast(broadcast);
    setViewDialogOpen(true);
  };

  // Delete broadcast
  const handleDeleteBroadcast = async () => {
    try {
      const { error } = await supabase
        .from("broadcast")
        .delete()
        .eq("id", broadcastToDelete.id);

      if (error) throw error;

      setBroadcasts(broadcasts.filter((b) => b.id !== broadcastToDelete.id));

      setSnackbar({
        open: true,
        message: "Broadcast deleted successfully!",
        severity: "success",
      });

      setDeleteDialogOpen(false);
      setBroadcastToDelete(null);
    } catch (error) {
      console.error("Error deleting broadcast:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete broadcast.",
        severity: "error",
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const resetCreateForm = useCallback(() => {
    const defaultSocietyId =
      assignedSocieties.length > 0 ? assignedSocieties[0].id : null;
    setFormData({
      title: "",
      description: "",
      category: "general",
      scheduleForLater: false,
      scheduledDate: "",
      scheduledTime: "",
      broadcastType: "society",
      societyId: defaultSocietyId,
      buildingId: null,
      sendNotifications: true,
    });
    setFiles([]);
    setLoading(false);
    setIsDragging(false);
    setNotificationPreview({
      tenantCount: 0,
      estimatedTenants: 0,
      sendingNotifications: false,
    });
  }, [assignedSocieties]);

  // Get file URLs from document string
  const getFileUrls = (documentString) => {
    if (!documentString) return [];
    return documentString.split(",").filter((url) => url.trim() !== "");
  };

  // Download file
  const handleDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
      ];

      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: `File ${file.name} is too large. Maximum size is 10MB.`,
          severity: "error",
        });
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `File type ${file.type} is not supported.`,
          severity: "error",
        });
        return false;
      }

      return true;
    });

    setFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon />;
    if (type === "application/pdf") return <DescriptionIcon />;
    return <AttachFileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Upload file to Supabase storage
  const uploadFileToSupabase = async (file) => {
    try {
      const result = await uploadImage(file);
      return result.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  };

  // Save broadcast to database
  const saveBroadcastToDatabase = async (broadcastData, fileUrls) => {
    const { data, error } = await supabase
      .from("broadcast")
      .insert([broadcastData])
      .select();

    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a title for the broadcast",
        severity: "error",
      });
      return;
    }

    if (!formData.description.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a description",
        severity: "error",
      });
      return;
    }

    if (!formData.societyId) {
      setSnackbar({
        open: true,
        message: "Please select a society",
        severity: "error",
      });
      return;
    }

    if (formData.broadcastType === "building" && !formData.buildingId) {
      setSnackbar({
        open: true,
        message: "Please select a building",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload files if any
      let fileUrls = [];
      if (files.length > 0) {
        const uploadPromises = files.map((file) =>
          uploadFileToSupabase(file.file),
        );
        fileUrls = await Promise.all(uploadPromises);
      }

      // Prepare broadcast data
      const broadcastData = {
        title: formData.title.trim(),
        message: formData.description.trim(),
        socity_id: formData.societyId,
        building_id:
          formData.broadcastType === "building" ? formData.buildingId : null,
        document: fileUrls.length > 0 ? fileUrls.join(",") : null,
        created_at: new Date().toISOString(),
        send_notifications: formData.sendNotifications,
      };

      // Save to database
      const savedBroadcast = await saveBroadcastToDatabase(
        broadcastData,
        fileUrls,
      );

      // Send notifications if enabled
      let notificationResult = null;
      if (formData.sendNotifications) {
        notificationResult = await sendNotificationsToTenants(broadcastData);
      }

      // Success message
      const societyName =
        assignedSocieties.find((s) => s.id === formData.societyId)?.name ||
        "the society";
      const buildingName =
        formData.broadcastType === "building"
          ? buildings.find((b) => b.id === formData.buildingId)?.name ||
            "selected building"
          : null;

      let successMessage = `Broadcast sent successfully to ${
        formData.broadcastType === "building"
          ? `${buildingName} in ${societyName}`
          : `entire ${societyName}`
      }!`;

      if (formData.sendNotifications && notificationResult?.success) {
        successMessage += ` Notifications sent to ${notificationResult.count} tenants.`;
      } else if (!formData.sendNotifications) {
        successMessage += " (Notifications disabled)";
      }

      setSnackbar({
        open: true,
        message: successMessage,
        severity: "success",
      });

      // Reset form
      resetCreateForm();

      // Switch to list view and refresh
      setViewMode("list");
      fetchBroadcasts();
    } catch (error) {
      console.error("Error sending broadcast:", error);
      setSnackbar({
        open: true,
        message: `Failed to send broadcast: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Get society name by ID
  const getSocietyName = (societyId) => {
    const society = assignedSocieties.find((s) => s.id === societyId);
    return society ? society.name : "Unknown Society";
  };

  // Render create form
  const renderCreateForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <StyledCard>
            <CardContent className="p-6 space-y-6">
              {/* Title */}
              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Broadcast Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  placeholder="Enter announcement title..."
                  InputProps={{
                    sx: {
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      fontFamily: "'Roboto', sans-serif",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(111, 11, 20, 0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: "2px",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    },
                  }}
                />
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  variant="outlined"
                  required
                  multiline
                  rows={6}
                  placeholder="Write your announcement details here..."
                  InputProps={{
                    sx: {
                      borderRadius: "8px",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      fontFamily: "'Roboto', sans-serif",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(111, 11, 20, 0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: "2px",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    },
                  }}
                />
              </motion.div>

              {/* Society Selection */}
              <motion.div variants={itemVariants}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    }}
                  >
                    Select Society
                  </InputLabel>
                  <Select
                    name="societyId"
                    value={formData.societyId || ""}
                    onChange={handleSocietyChange}
                    label="Select Society"
                    disabled={
                      loadingSocieties || assignedSocieties.length === 0
                    }
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(111, 11, 20, 0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: "2px",
                      },
                    }}
                  >
                    {loadingSocieties ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} className="mr-2" />
                        Loading societies...
                      </MenuItem>
                    ) : assignedSocieties.length === 0 ? (
                      <MenuItem disabled>No societies assigned to you</MenuItem>
                    ) : (
                      assignedSocieties.map((society) => (
                        <MenuItem
                          key={society.id}
                          value={society.id}
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          <SocietyIcon
                            className="mr-2 text-primary"
                            fontSize="small"
                          />
                          {society.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </motion.div>

              {/* Broadcast Type Selection */}
              <motion.div variants={itemVariants}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      color: "#6F0B14",
                    }}
                  >
                    Send To
                  </InputLabel>
                  <Select
                    name="broadcastType"
                    value={formData.broadcastType}
                    onChange={handleBroadcastTypeChange}
                    label="Send To"
                    disabled={!formData.societyId || buildings.length === 0}
                    sx={{
                      fontFamily: "'Roboto', sans-serif",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(111, 11, 20, 0.2)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: "2px",
                      },
                    }}
                  >
                    <MenuItem
                      value="society"
                      sx={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      <ApartmentIcon className="mr-2 text-primary" />
                      Entire Society
                    </MenuItem>
                    <MenuItem
                      value="building"
                      sx={{ fontFamily: "'Roboto', sans-serif" }}
                      disabled={buildings.length === 0}
                    >
                      <BuildingIcon className="mr-2 text-primary" />
                      Specific Building
                    </MenuItem>
                  </Select>
                </FormControl>
              </motion.div>

              {/* Building Selection */}
              <AnimatePresence>
                {formData.broadcastType === "building" &&
                  formData.societyId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      variants={itemVariants}
                    >
                      <FormControl fullWidth>
                        <InputLabel
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            color: "#6F0B14",
                          }}
                        >
                          Select Building
                        </InputLabel>
                        <Select
                          name="buildingId"
                          value={formData.buildingId || ""}
                          onChange={handleInputChange}
                          label="Select Building"
                          disabled={loadingBuildings || buildings.length === 0}
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            borderRadius: "8px",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "rgba(111, 11, 20, 0.2)",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#6F0B14",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#6F0B14",
                              borderWidth: "2px",
                            },
                          }}
                        >
                          {loadingBuildings ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} className="mr-2" />
                              Loading buildings...
                            </MenuItem>
                          ) : buildings.length === 0 ? (
                            <MenuItem disabled>
                              No buildings found in this society
                            </MenuItem>
                          ) : (
                            buildings.map((building) => (
                              <MenuItem
                                key={building.id}
                                value={building.id}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                {building.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </motion.div>
                  )}
              </AnimatePresence>

              {/* Notification Toggle */}
              <motion.div variants={itemVariants}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.sendNotifications}
                      onChange={handleInputChange}
                      name="sendNotifications"
                      color="primary"
                    />
                  }
                  label={
                    <div className="flex items-center">
                      <NotificationsIcon className="mr-2" />
                      <Typography sx={{ fontFamily: "'Roboto', sans-serif" }}>
                        Send push notifications to tenants
                      </Typography>
                    </div>
                  }
                />
                <Typography
                  variant="caption"
                  className="text-hintText ml-12"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Estimated recipients: {notificationPreview.estimatedTenants}{" "}
                  tenants
                </Typography>
              </motion.div>
            </CardContent>
          </StyledCard>

          {/* File Upload Section */}
          <motion.div variants={itemVariants}>
            <StyledCard>
              <CardContent className="p-6">
                <Typography
                  variant="h6"
                  className="mb-4 font-semibold text-primary"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Attachments (Optional)
                </Typography>

                <FileUploadArea
                  isdragging={isDragging.toString()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <CloudUploadIcon className="text-4xl text-primary mb-4" />
                  <Typography
                    variant="body1"
                    className="mb-2 text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {isDragging
                      ? "Drop files here"
                      : "Drag & drop files or click to browse"}
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Supports images, PDF, DOC (Max 10MB per file)
                  </Typography>
                  <VisuallyHiddenInput
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                  />
                </FileUploadArea>

                {/* File List */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 space-y-3"
                    >
                      <Typography
                        variant="subtitle2"
                        className="font-medium text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Selected Files ({files.length})
                      </Typography>
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between p-3 bg-lightBackground rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-primary">
                              {getFileIcon(file.type)}
                            </div>
                            <div>
                              <Typography
                                variant="body2"
                                className="font-medium"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                {file.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-hintText"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                {formatFileSize(file.size)}
                              </Typography>
                            </div>
                          </div>
                          <IconButton
                            size="small"
                            onClick={() => removeFile(file.id)}
                            className="text-reject hover:bg-red-50"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </StyledCard>
          </motion.div>
        </motion.div>

        {/* Right Column - Preview & Send */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Preview Card */}
          <StyledCard>
            <CardContent className="p-6">
              <Typography
                variant="h6"
                className="mb-4 font-semibold text-primary"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Preview
              </Typography>

              <div className="space-y-4">
                <div>
                  <Typography
                    variant="caption"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Title
                  </Typography>
                  <Typography
                    variant="body1"
                    className="font-medium text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {formData.title || "No title entered"}
                  </Typography>
                </div>

                <Divider className="bg-lightBackground" />

                <div>
                  <Typography
                    variant="caption"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Society
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mt-1 font-medium text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {formData.societyId
                      ? getSocietyName(formData.societyId)
                      : "No society selected"}
                  </Typography>
                </div>

                <Divider className="bg-lightBackground" />

                <div>
                  <Typography
                    variant="caption"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Send To
                  </Typography>
                  <div className="mt-1">
                    <Chip
                      label={
                        formData.broadcastType === "society"
                          ? "Entire Society"
                          : buildings.find((b) => b.id === formData.buildingId)
                              ?.name || "Select Building"
                      }
                      size="small"
                      sx={{
                        backgroundColor: "rgba(111, 11, 20, 0.1)",
                        color: "#6F0B14",
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 500,
                      }}
                      icon={
                        formData.broadcastType === "society" ? (
                          <ApartmentIcon fontSize="small" />
                        ) : (
                          <BuildingIcon fontSize="small" />
                        )
                      }
                    />
                  </div>
                </div>

                {/* Notification Preview */}
                <Divider className="bg-lightBackground" />
                <div>
                  <Typography
                    variant="caption"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Notifications
                  </Typography>
                  <div className="mt-1 flex items-center space-x-2">
                    {formData.sendNotifications ? (
                      <>
                        <NotificationsActiveIcon
                          className="text-green-600"
                          fontSize="small"
                        />
                        <Typography
                          variant="body2"
                          className="text-green-600"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          Push notifications enabled
                        </Typography>
                      </>
                    ) : (
                      <>
                        <NotificationsIcon
                          className="text-gray-400"
                          fontSize="small"
                        />
                        <Typography
                          variant="body2"
                          className="text-gray-400"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          Push notifications disabled
                        </Typography>
                      </>
                    )}
                  </div>
                  {formData.sendNotifications && (
                    <Typography
                      variant="caption"
                      className="text-hintText"
                      sx={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      Estimated: {notificationPreview.estimatedTenants} tenants
                      will receive notification
                    </Typography>
                  )}
                </div>

                {files.length > 0 && (
                  <>
                    <Divider className="bg-lightBackground" />
                    <div>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Attachments
                      </Typography>
                      <Typography
                        variant="body2"
                        className="mt-1 text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                        attached
                      </Typography>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </StyledCard>

          {/* Send Button with Notification Indicator */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <GradientButton
              fullWidth
              type="submit"
              disabled={
                loading ||
                !formData.societyId ||
                (formData.broadcastType === "building" &&
                  !formData.buildingId) ||
                notificationPreview.sendingNotifications
              }
              startIcon={
                loading || notificationPreview.sendingNotifications ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendAndArchiveIcon />
                )
              }
              size="large"
            >
              {loading
                ? "Sending..."
                : notificationPreview.sendingNotifications
                  ? "Sending Notifications..."
                  : formData.sendNotifications
                    ? "Send Broadcast with Notifications"
                    : "Send Broadcast Only"}
            </GradientButton>
          </motion.div>

          {/* Quick Stats */}
          <StyledCard>
            <CardContent className="p-6">
              <Typography
                variant="subtitle2"
                className="mb-3 text-hintText"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Broadcast Stats
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography
                    variant="body2"
                    className="text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Societies Assigned
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {assignedSocieties.length}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography
                    variant="body2"
                    className="text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Estimated Tenants
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {notificationPreview.estimatedTenants}
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography
                    variant="body2"
                    className="text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Characters
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {formData.description.length}/5000
                  </Typography>
                </div>
                <div className="flex justify-between">
                  <Typography
                    variant="body2"
                    className="text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Attachments
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-medium text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {files.length}/10
                  </Typography>
                </div>
              </div>
            </CardContent>
          </StyledCard>

          {/* Notification Test Button (Optional) */}
          {formData.sendNotifications && formData.societyId && (
            <StyledCard>
              <CardContent className="p-6">
                <Typography
                  variant="subtitle2"
                  className="mb-3 text-hintText"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Test Notifications
                </Typography>
                <Typography
                  variant="body2"
                  className="mb-4 text-primary"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Send a test notification to yourself to verify the system
                </Typography>
                <NotificationButton
                  fullWidth
                  startIcon={<NotificationsIcon />}
                  onClick={async () => {
                    if (!pmId) {
                      setSnackbar({
                        open: true,
                        message: "PM ID not found",
                        severity: "error",
                      });
                      return;
                    }

                    try {
                      await sendAndSaveNotification({
                        title: "Test Broadcast",
                        body: "This is a test notification from the broadcast system",
                        userId: pmId,
                        type: "test",
                      });

                      setSnackbar({
                        open: true,
                        message: "Test notification sent successfully!",
                        severity: "success",
                      });
                    } catch (error) {
                      setSnackbar({
                        open: true,
                        message: "Failed to send test notification",
                        severity: "error",
                      });
                    }
                  }}
                >
                  Send Test Notification
                </NotificationButton>
              </CardContent>
            </StyledCard>
          )}
        </motion.div>
      </div>
    </form>
  );

  // Render broadcast list
  const renderBroadcastList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <StyledCard className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Typography
              variant="h5"
              className="font-bold text-primary"
              sx={{ fontFamily: "'Roboto', sans-serif" }}
            >
              <ListIcon className="mr-3" />
              Broadcast History
            </Typography>
            <div className="flex items-center space-x-4">
              <Typography
                variant="body2"
                className="text-hintText"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Societies: {assignedSocieties.length} | Broadcasts:{" "}
                {broadcasts.length}
              </Typography>
            </div>
          </div>

          {loadingBroadcasts ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress sx={{ color: "#6F0B14" }} />
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-12">
              <AnnouncementIcon className="text-6xl text-gray-300 mb-4" />
              <Typography
                variant="h6"
                className="text-gray-500 mb-2"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                No broadcasts yet
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-400 mb-4"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Create your first broadcast to get started
              </Typography>
              <GradientButton
                startIcon={<AddIcon />}
                onClick={(e) => handleViewModeChange(e, "create")}
              >
                Create Broadcast
              </GradientButton>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Title
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Society
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Sent To
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Notifications
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Attachments
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontFamily: "'Roboto', sans-serif",
                        fontWeight: 600,
                        color: "#6F0B14",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {broadcasts.map((broadcast) => (
                    <TableRow key={broadcast.id} hover>
                      <TableCell>
                        <div>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {broadcast.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-hintText line-clamp-2"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {broadcast.message.substring(0, 100)}...
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={broadcast.societies?.name || "Unknown Society"}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(111, 11, 20, 0.1)",
                            color: "#6F0B14",
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                          icon={<SocietyIcon fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            broadcast.building_id
                              ? `Building: ${broadcast.buildings?.name || "Unknown"}`
                              : "Entire Society"
                          }
                          size="small"
                          sx={{
                            backgroundColor: broadcast.building_id
                              ? "rgba(111, 11, 20, 0.1)"
                              : "rgba(0, 128, 0, 0.1)",
                            color: broadcast.building_id
                              ? "#6F0B14"
                              : "#008000",
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                          }}
                          icon={
                            broadcast.building_id ? (
                              <BuildingIcon fontSize="small" />
                            ) : (
                              <ApartmentIcon fontSize="small" />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            broadcast.send_notifications
                              ? "Push notifications were sent to tenants"
                              : "Push notifications were not sent"
                          }
                        >
                          <Badge
                            color={
                              broadcast.send_notifications
                                ? "success"
                                : "default"
                            }
                            variant="dot"
                          >
                            <Chip
                              label={
                                broadcast.send_notifications
                                  ? "Sent"
                                  : "Not Sent"
                              }
                              size="small"
                              sx={{
                                backgroundColor: broadcast.send_notifications
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "rgba(158, 158, 158, 0.1)",
                                color: broadcast.send_notifications
                                  ? "#4CAF50"
                                  : "#9E9E9E",
                                fontFamily: "'Roboto', sans-serif",
                                fontWeight: 500,
                              }}
                              icon={
                                broadcast.send_notifications ? (
                                  <NotificationsActiveIcon fontSize="small" />
                                ) : (
                                  <NotificationsIcon fontSize="small" />
                                )
                              }
                            />
                          </Badge>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {broadcast.document ? (
                          <AvatarGroup max={3}>
                            {getFileUrls(broadcast.document).map(
                              (url, index) => (
                                <Tooltip
                                  key={index}
                                  title={`Attachment ${index + 1}`}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: "rgba(111, 11, 20, 0.1)",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleDownload(
                                        url,
                                        `attachment-${index + 1}`,
                                      )
                                    }
                                  >
                                    {url.includes(".pdf") ? (
                                      <DescriptionIcon fontSize="small" />
                                    ) : url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                      <ImageIcon fontSize="small" />
                                    ) : (
                                      <AttachFileIcon fontSize="small" />
                                    )}
                                  </Avatar>
                                </Tooltip>
                              ),
                            )}
                          </AvatarGroup>
                        ) : (
                          <Typography
                            variant="caption"
                            className="text-hintText"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            No attachments
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          {formatDate(broadcast.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <IconButton
                            size="small"
                            onClick={() => handleViewBroadcast(broadcast)}
                            className="text-primary hover:bg-lightBackground"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setBroadcastToDelete(broadcast);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-reject hover:bg-red-50"
                          >
                            <DeleteForeverIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </StyledCard>
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-roboto"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with Toggle */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Typography
                variant="h4"
                className="font-semibold text-primary"
                sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 400 }}
              >
                <AnnouncementIcon className="mr-3" />
                {viewMode === "create"
                  ? "Create Broadcast"
                  : "Broadcast History"}
              </Typography>
              <Typography
                variant="subtitle1"
                className="mt-2 text-hintText"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                {viewMode === "create"
                  ? "Send announcements with push notifications to your assigned societies"
                  : "View and manage your broadcast history"}
                {pmId && ` (PM ID: ${pmId})`}
                {assignedSocieties.length > 0 &&
                  ` | ${assignedSocieties.length} societies assigned`}
              </Typography>
            </div>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              sx={{
                "& .MuiToggleButton-root": {
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  borderColor: "#6F0B14",
                  color: "#6F0B14",
                  "&.Mui-selected": {
                    backgroundColor: "#6F0B14",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#8A0F1B",
                    },
                  },
                  "&:not(.Mui-selected):hover": {
                    backgroundColor: "rgba(111, 11, 20, 0.08)",
                  },
                },
              }}
            >
              <ToggleButton value="create" aria-label="create mode">
                <AddIcon className="mr-2" />
                Create New
              </ToggleButton>
              <ToggleButton value="list" aria-label="list mode">
                <ListIcon className="mr-2" />
                View List
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </motion.div>

        {viewMode === "create" ? (
          renderCreateForm()
        ) : loadingBroadcasts ? (
          <div className="flex justify-center items-center py-20">
            <CircularProgress sx={{ color: "#6F0B14" }} />
            <Typography className="ml-4 text-primary">
              Loading broadcasts...
            </Typography>
          </div>
        ) : (
          renderBroadcastList()
        )}

        {/* Create New Button in List View */}
        {viewMode === "list" && broadcasts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <GradientButton
              fullWidth
              startIcon={<AddIcon />}
              onClick={(e) => handleViewModeChange(e, "create")}
            >
              Create New Broadcast
            </GradientButton>
          </motion.div>
        )}
      </div>

      {/* View Broadcast Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: "'Roboto', sans-serif", color: "#6F0B14" }}
        >
          <AnnouncementIcon className="mr-2" />
          Broadcast Details
        </DialogTitle>
        <DialogContent>
          {selectedBroadcast && (
            <div className="space-y-4 mt-2">
              <div>
                <Typography
                  variant="subtitle2"
                  className="text-hintText"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Title
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }}
                >
                  {selectedBroadcast.title}
                </Typography>
              </div>

              <Divider />

              <div>
                <Typography
                  variant="subtitle2"
                  className="text-hintText"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Message
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedBroadcast.message}
                </Typography>
              </div>

              <Divider />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="subtitle2"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Society
                  </Typography>
                  <Chip
                    label={
                      selectedBroadcast.societies?.name || "Unknown Society"
                    }
                    size="small"
                    sx={{
                      backgroundColor: "rgba(111, 11, 20, 0.1)",
                      color: "#6F0B14",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                    }}
                    icon={<SocietyIcon fontSize="small" />}
                  />
                </div>

                <div>
                  <Typography
                    variant="subtitle2"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Sent To
                  </Typography>
                  <Chip
                    label={
                      selectedBroadcast.building_id
                        ? `Building: ${selectedBroadcast.buildings?.name || "Unknown"}`
                        : "Entire Society"
                    }
                    size="small"
                    sx={{
                      backgroundColor: selectedBroadcast.building_id
                        ? "rgba(111, 11, 20, 0.1)"
                        : "rgba(0, 128, 0, 0.1)",
                      color: selectedBroadcast.building_id
                        ? "#6F0B14"
                        : "#008000",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                    }}
                    icon={
                      selectedBroadcast.building_id ? (
                        <BuildingIcon fontSize="small" />
                      ) : (
                        <ApartmentIcon fontSize="small" />
                      )
                    }
                  />
                </div>

                <div>
                  <Typography
                    variant="subtitle2"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Notifications
                  </Typography>
                  <Chip
                    label={
                      selectedBroadcast.send_notifications
                        ? "Push notifications sent"
                        : "No push notifications"
                    }
                    size="small"
                    sx={{
                      backgroundColor: selectedBroadcast.send_notifications
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(158, 158, 158, 0.1)",
                      color: selectedBroadcast.send_notifications
                        ? "#4CAF50"
                        : "#9E9E9E",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 500,
                    }}
                    icon={
                      selectedBroadcast.send_notifications ? (
                        <NotificationsActiveIcon fontSize="small" />
                      ) : (
                        <NotificationsIcon fontSize="small" />
                      )
                    }
                  />
                </div>

                <div>
                  <Typography
                    variant="subtitle2"
                    className="text-hintText"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Date Sent
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {formatDate(selectedBroadcast.created_at)}
                  </Typography>
                </div>
              </div>

              {selectedBroadcast.document && (
                <>
                  <Divider />
                  <div>
                    <Typography
                      variant="subtitle2"
                      className="text-hintText mb-2"
                      sx={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      Attachments
                    </Typography>
                    <div className="space-y-2">
                      {getFileUrls(selectedBroadcast.document).map(
                        (url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-lightBackground rounded"
                          >
                            <div className="flex items-center space-x-2">
                              {url.includes(".pdf") ? (
                                <DescriptionIcon className="text-primary" />
                              ) : url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <ImageIcon className="text-primary" />
                              ) : (
                                <AttachFileIcon className="text-primary" />
                              )}
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                Attachment {index + 1}
                              </Typography>
                            </div>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDownload(url, `attachment-${index + 1}`)
                              }
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle
          sx={{ fontFamily: "'Roboto', sans-serif", color: "#B31B1B" }}
        >
          <DeleteForeverIcon className="mr-2" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "'Roboto', sans-serif" }}>
            Are you sure you want to delete this broadcast? This action cannot
            be undone.
          </Typography>
          {broadcastToDelete && (
            <Typography
              variant="body2"
              className="mt-2 font-medium"
              sx={{ fontFamily: "'Roboto', sans-serif" }}
            >
              "{broadcastToDelete.title}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ fontFamily: "'Roboto', sans-serif", color: "#6F0B14" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteBroadcast}
            variant="contained"
            sx={{
              fontFamily: "'Roboto', sans-serif",
              backgroundColor: "#B31B1B",
              "&:hover": { backgroundColor: "#8A1515" },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontFamily: "'Roboto', sans-serif",
            "&.MuiAlert-filledSuccess": {
              backgroundColor: "#008000",
            },
            "&.MuiAlert-filledError": {
              backgroundColor: "#B31B1B",
            },
            "&.MuiAlert-filledWarning": {
              backgroundColor: "#DBA400",
            },
            "&.MuiAlert-filledInfo": {
              backgroundColor: "#6F0B14",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default PMBroadCast;
