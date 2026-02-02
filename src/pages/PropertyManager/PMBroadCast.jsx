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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { useBulkNotification } from "../../Hooks/useBulkNotification";
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
  // hidden: { y: 20, opacity: 0 },
  // visible: {
  //   y: 0,
  //   opacity: 1,
  //   transition: {
  //     type: "spring",
  //     stiffness: 100,
  //     damping: 12,
  //   },
  // },
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
    scheduleForLater: false,
    scheduledDate: "",
    scheduledTime: "",
    broadcastType: "society",
    societyId: null,
    buildingId: null,
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

  const {
    sendBulkNotification,
    isSending: isNotificationSending,
    progress,
    getSocietyBuildingIds,
  } = useBulkNotification();

  // Initialize PM data and assigned societies
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

  // Fetch buildings for selected society
  const fetchBuildingsForSociety = async (societyId) => {
    if (!societyId) return;

    setLoadingBuildings(true);
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, is_active, is_delete")
        .eq("society_id", societyId)
        .eq("is_active", true)
        .eq("is_delete", false)
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

  // Fetch broadcasts sent by this PM
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
      // 1️⃣ Get societies assigned to this PM
      const { data: pmSocieties, error: pmError } = await supabase
        .from("pm_society")
        .select("society_id")
        .eq("pm_id", pmId);

      if (pmError) throw pmError;

      if (!pmSocieties || pmSocieties.length === 0) {
        setBroadcasts([]);
        setLoadingBroadcasts(false);
        return;
      }

      const societyIds = pmSocieties.map((item) => item.society_id);

      // 2️⃣ Fetch broadcasts created by this PM for assigned societies
      const { data, error } = await supabase
        .from("broadcast")
        .select(
          `
        id,
        title,
        message,
        document,
        created_at,
        socity_id,
        building_id,
        societies ( id, name ),
        buildings ( id, name ),
        users ( id, full_name )
      `,
        )
        .eq("user_id", pmId)
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

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save broadcast to database
  const saveBroadcastToDatabase = async (broadcastData) => {
    try {
      const { data, error } = await supabase
        .from("broadcast")
        .insert([broadcastData])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving broadcast:", error);
      throw new Error(`Failed to save broadcast: ${error.message}`);
    }
  };

  // Get society name by ID
  const getSocietyName = (societyId) => {
    const society = assignedSocieties.find((s) => s.id === societyId);
    return society ? society.name : "Unknown Society";
  };

  // Main submit handler
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
      let fileUrls = [];
      if (files.length > 0) {
        fileUrls = await Promise.all(
          files.map((file) => uploadFileToSupabase(file.file)),
        );
      }
      const imageUrl = fileUrls.length > 0 ? fileUrls[0] : null;

      const broadcastData = {
        title: formData.title.trim(),
        message: formData.description.trim(),
        socity_id: String(formData.societyId),
        building_id:
          formData.broadcastType === "building"
            ? String(formData.buildingId)
            : null,
        document: fileUrls.length > 0 ? fileUrls.join(",") : null,
        user_id: pmId,
        created_at: new Date().toISOString(),
      };

      const society = assignedSocieties.find(
        (s) => s.id === formData.societyId,
      );
      const societyName = society ? society.name : "Unknown Society";

      let buildingIds = [];
      let buildingName = "";

      if (formData.broadcastType === "society") {
        buildingIds = await getSocietyBuildingIds(formData.societyId);

        if (buildingIds.length === 0) {
          throw new Error("No active buildings found in this society");
        }

        // Send to all buildings in society
        await sendBulkNotification({
          buildingIds,
          title: formData.title.trim(),
          body: formData.description.trim(),
          imageUrl,
          notificationType: "Property Manager",
          data: { screen: "broadcast" },
          societyName,
          society_id: formData.societyId,
          building_id: null,
        });

        // Save society-wide broadcast
        await saveBroadcastToDatabase(broadcastData);
      } else if (formData.broadcastType === "building") {
        buildingIds = [formData.buildingId];

        const building = buildings.find((b) => b.id === formData.buildingId);
        buildingName = building ? building.name : "Selected Building";

        // Send to specific building
        await sendBulkNotification({
          buildingIds,
          title: formData.title.trim(),
          body: formData.description.trim(),
          imageUrl,
          notificationType: "Property Manager",
          data: { screen: "broadcast" },
          societyName,
          society_id: formData.societyId,
          building_id: formData.buildingId,
        });

        // Save building-specific broadcast
        await saveBroadcastToDatabase(broadcastData);
      }

      // Success message
      const successMessage =
        formData.broadcastType === "building"
          ? `Broadcast sent successfully to ${buildingName} in ${societyName}!`
          : `Broadcast sent successfully to entire ${societyName}!`;

      setSnackbar({
        open: true,
        message: successMessage,
        severity: "success",
      });

      // Reset form
      resetCreateForm();

      // Switch to list view and refresh
      setViewMode("list");
      await fetchBroadcasts();
    } catch (error) {
      console.error("Error sending broadcast:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to send broadcast",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
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

      // Remove from local state
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

  // Reset create form
  const resetCreateForm = useCallback(() => {
    const defaultSocietyId =
      assignedSocieties.length > 0 ? assignedSocieties[0].id : null;

    setFormData({
      title: "",
      description: "",
      scheduleForLater: false,
      scheduledDate: "",
      scheduledTime: "",
      broadcastType: "society",
      societyId: defaultSocietyId,
      buildingId: null,
    });

    // Fetch buildings for the default society
    if (defaultSocietyId) {
      fetchBuildingsForSociety(defaultSocietyId);
    }

    setFiles([]);
    setLoading(false);
    setIsDragging(false);
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

  // File upload handlers
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
      const maxSize = 10 * 1024 * 1024;
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Render create form
  const renderCreateForm = () => (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
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

                <Divider sx={{ my: 1 }} />

                {/* Select Society & Building */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
                  <motion.div variants={itemVariants}>
                    <FormControl fullWidth required>
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
                        disabled={loadingSocieties}
                        sx={{
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          fontFamily: "'Roboto', sans-serif",
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6F0B14",
                            borderWidth: "2px",
                          },
                        }}
                      >
                        {assignedSocieties.map((society) => (
                          <MenuItem key={society.id} value={society.id}>
                            <SocietyIcon
                              sx={{
                                fontSize: 20,
                                mr: 1,
                                color: "#6F0B14",
                                opacity: 0.7,
                              }}
                            />
                            {society.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormControl component="fieldset" fullWidth>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#6F0B14",
                          mb: 1,
                          display: "block",
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        Recipient Group
                      </Typography>
                      <ToggleButtonGroup
                        value={formData.broadcastType}
                        exclusive
                        onChange={handleBroadcastTypeChange}
                        aria-label="broadcast type"
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiToggleButton-root": {
                            border: "1px solid rgba(111, 11, 20, 0.2)",
                            "&.Mui-selected": {
                              backgroundColor: "rgba(111, 11, 20, 0.1)",
                              color: "#6F0B14",
                              fontWeight: "bold",
                            },
                          },
                        }}
                      >
                        <ToggleButton value="society">
                          <SocietyIcon sx={{ mr: 1, fontSize: 18 }} />
                          Entire Society
                        </ToggleButton>
                        <ToggleButton
                          value="building"
                          disabled={buildings.length === 0}
                        >
                          <BuildingIcon sx={{ mr: 1, fontSize: 18 }} />
                          Specific Building
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </FormControl>
                  </motion.div>
                </div>

                {/* Building Selection (Conditional) */}
                <AnimatePresence>
                  {formData.broadcastType === "building" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FormControl fullWidth required>
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
                          disabled={loadingBuildings}
                          sx={{
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            fontFamily: "'Roboto', sans-serif",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#6F0B14",
                              borderWidth: "2px",
                            },
                          }}
                        >
                          {buildings.map((building) => (
                            <MenuItem key={building.id} value={building.id}>
                              <ApartmentIcon
                                sx={{
                                  fontSize: 20,
                                  mr: 1,
                                  color: "#6F0B14",
                                  opacity: 0.7,
                                }}
                              />
                              {building.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </StyledCard>
          </motion.div>

          {/* Right Column - Media & Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            <StyledCard>
              <CardContent className="p-6">
                <Typography
                  variant="subtitle1"
                  className="font-bold mb-4"
                  sx={{ color: "#6F0B14", fontFamily: "'Roboto', sans-serif" }}
                >
                  Attachments
                </Typography>

                <FileUploadArea
                  isdragging={isDragging.toString()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  elevation={0}
                >
                  <input
                    type="file"
                    hidden
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "#6F0B14", opacity: 0.5, mb: 1 }}
                  />
                  <Typography
                    variant="body1"
                    className="font-medium"
                    sx={{
                      color: "#374151",
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  >
                    Click or Drop files here
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9CA3AF",
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  >
                    (Images, PDF, Doc - Max 10MB)
                  </Typography>
                </FileUploadArea>

                {/* File List */}
                <div className="mt-4 space-y-2">
                  <AnimatePresence>
                    {files.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Paper
                          variant="outlined"
                          className="flex items-center justify-between p-2 rounded-lg"
                        >
                          <div className="flex items-center space-x-2 overflow-hidden">
                            <div className="text-gray-500">
                              {getFileIcon(file.type)}
                            </div>
                            <div className="min-w-0">
                              <Typography
                                variant="body2"
                                noWrap
                                className="font-medium"
                              >
                                {file.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {formatFileSize(file.size)}
                              </Typography>
                            </div>
                          </div>
                          <IconButton
                            size="small"
                            onClick={() => removeFile(file.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent className="p-6">
                {/* <Typography
                  variant="subtitle1"
                  className="font-bold mb-4"
                  sx={{ color: "#6F0B14", fontFamily: "'Roboto', sans-serif" }}
                >
                  Publishing Options
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.scheduleForLater}
                      onChange={handleInputChange}
                      name="scheduleForLater"
                      color="primary"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      Schedule for later
                    </Typography>
                  }
                  className="mb-4"
                />

                <AnimatePresence>
                  {formData.scheduleForLater && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 mb-4"
                    >
                      <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        name="scheduledDate"
                        value={formData.scheduledDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        type="time"
                        label="Time"
                        name="scheduledTime"
                        value={formData.scheduledTime}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </motion.div>
                  )}
                </AnimatePresence> */}

                <GradientButton
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading || isNotificationSending}
                  startIcon={
                    loading || isNotificationSending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : formData.scheduleForLater ? (
                      <AnnouncementIcon />
                    ) : (
                      <SendIcon />
                    )
                  }
                >
                  {loading || isNotificationSending
                    ? "Sending..."
                    : formData.scheduleForLater
                      ? "Schedule Broadcast"
                      : "Send Broadcast"}
                </GradientButton>

                <div className="mt-4 text-center">
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {files.length} file(s) attached • Total size:{" "}
                    {formatFileSize(
                      files.reduce((acc, file) => acc + file.size, 0),
                    )}
                  </Typography>
                </div>
              </CardContent>
            </StyledCard>
          </motion.div>
        </div>
      </form>
    </div>
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
                      align="right"
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
                    <TableRow
                      key={broadcast.id}
                      hover
                      sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}
                    >
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          className="font-medium"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          {broadcast.title}
                        </Typography>
                        {/* <Chip
                          label={broadcast.category || "General"}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: "0.7rem",
                            backgroundColor:
                              broadcast.category === "emergency"
                                ? "#ffebee"
                                : "#e3f2fd",
                            color:
                              broadcast.category === "emergency"
                                ? "#c62828"
                                : "#1565c0",
                          }}
                        /> */}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <SocietyIcon
                            fontSize="small"
                            className="mr-2 text-gray-400"
                          />
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {broadcast.societies?.name || "Unknown"}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {broadcast.building_id ? (
                            <>
                              <ApartmentIcon
                                fontSize="small"
                                className="mr-2 text-gray-400"
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                {broadcast.buildings?.name || "Building"}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <SocietyIcon
                                fontSize="small"
                                className="mr-2 text-gray-400"
                              />
                              <Typography
                                variant="body2"
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                All Members
                              </Typography>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {broadcast.document ? (
                          <div className="flex -space-x-2 overflow-hidden">
                            {getFileUrls(broadcast.document).map(
                              (url, index) => (
                                <Tooltip
                                  key={index}
                                  title="Click to view/download"
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: "#f3f4f6",
                                      color: "#6b7280",
                                      border: "2px solid white",
                                      width: 32,
                                      height: 32,
                                      fontSize: 14,
                                      cursor: "pointer",
                                    }}
                                    onClick={() => handleDownload(url)}
                                  >
                                    <AttachFileIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                </Tooltip>
                              ),
                            )}
                          </div>
                        ) : (
                          <Typography
                            variant="caption"
                            className="text-gray-400"
                          >
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          {formatDate(broadcast.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewBroadcast(broadcast)}
                          sx={{ color: "#6F0B14" }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setBroadcastToDelete(broadcast);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
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
      style={{ minHeight: "80vh" }}
      className="p-6 max-w-7xl mx-auto space-y-8 "
    >
      {/* Notification sending progress */}
      {isNotificationSending && (
        <div className="fixed top-20 right-4 bg-white/95 backdrop-blur-sm p-4 shadow-xl rounded-lg z-50 border max-w-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <CircularProgress size={18} sx={{ color: "#6F0B14" }} />
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: "#6F0B14", fontFamily: "'Roboto', sans-serif" }}
            >
              Sending notifications...
            </Typography>
          </div>
          <div className="text-xs text-gray-600 mb-1">
            {Math.round(progress)}% complete
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <Typography
            variant="h4"
            className="font-bold text-gray-900"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              background:
                "linear-gradient(135deg, #6F0B14 0%, #8A0F1B 50%, #6F0B14 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            PM Broadcast Manager
          </Typography>
          <Typography
            variant="subtitle1"
            className="text-gray-500"
            sx={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Create and manage announcements for your assigned societies and
            buildings
          </Typography>
        </div>

        <Paper
          elevation={0}
          sx={{
            p: 1,
            border: "1px solid rgba(111, 11, 20, 0.1)",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
          }}
        >
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "create" ? "contained" : "text"}
              onClick={(e) => handleViewModeChange(e, "create")}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 600,
                backgroundColor:
                  viewMode === "create" ? "#6F0B14" : "transparent",
                color: viewMode === "create" ? "#ffffff" : "#6B7280",
                "&:hover": {
                  backgroundColor:
                    viewMode === "create"
                      ? "#8A0F1B"
                      : "rgba(111, 11, 20, 0.05)",
                },
              }}
            >
              New Broadcast
            </Button>
            <Button
              variant={viewMode === "list" ? "contained" : "text"}
              onClick={(e) => handleViewModeChange(e, "list")}
              startIcon={<ListIcon />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 600,
                backgroundColor:
                  viewMode === "list" ? "#6F0B14" : "transparent",
                color: viewMode === "list" ? "#ffffff" : "#6B7280",
                "&:hover": {
                  backgroundColor:
                    viewMode === "list" ? "#8A0F1B" : "rgba(111, 11, 20, 0.05)",
                },
              }}
            >
              History
            </Button>
          </div>
        </Paper>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === "create" ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {renderCreateForm()}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            {renderBroadcastList()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Broadcast Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Outfit', sans-serif",
            borderBottom: "1px solid #f0f0f0",
            pb: 2,
          }}
        >
          <div className="flex justify-between items-center">
            <Typography variant="h6" className="font-bold text-gray-800">
              Broadcast Details
            </Typography>
            {selectedBroadcast?.category && (
              <Chip
                label={selectedBroadcast.category}
                size="small"
                sx={{
                  backgroundColor:
                    selectedBroadcast.category === "emergency"
                      ? "#ffebee"
                      : "#e3f2fd",
                  color:
                    selectedBroadcast.category === "emergency"
                      ? "#c62828"
                      : "#1565c0",
                  fontWeight: 600,
                }}
              />
            )}
          </div>
        </DialogTitle>
        <DialogContent className="py-6">
          {selectedBroadcast && (
            <div className="space-y-6 mt-4">
              <div>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  className="uppercase tracking-wider text-xs mb-1"
                >
                  Message Title
                </Typography>
                <Typography
                  variant="h6"
                  className="font-bold text-gray-900"
                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  {selectedBroadcast.title}
                </Typography>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    className="uppercase tracking-wider text-xs mb-1"
                  >
                    Sent To
                  </Typography>
                  <div className="flex items-center text-gray-700">
                    {selectedBroadcast.building_id ? (
                      <>
                        <ApartmentIcon fontSize="small" className="mr-2" />
                        <Typography variant="body2">
                          {selectedBroadcast.buildings?.name || "Building"}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <SocietyIcon fontSize="small" className="mr-2" />
                        <Typography variant="body2">
                          {selectedBroadcast.societies?.name || "All Members"}
                        </Typography>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    className="uppercase tracking-wider text-xs mb-1"
                  >
                    Date
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    {formatDate(selectedBroadcast.created_at)}
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    className="uppercase tracking-wider text-xs mb-1"
                  >
                    Society
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    {selectedBroadcast.societies?.name || "Unknown Society"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    className="uppercase tracking-wider text-xs mb-1"
                  >
                    Sent By
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    {selectedBroadcast.user_profiles?.name ||
                      "Property Manager"}
                  </Typography>
                </div>
              </div>

              <Divider />

              <div>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  className="uppercase tracking-wider text-xs mb-2"
                >
                  Content
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "'Roboto', sans-serif",
                      color: "#374151",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedBroadcast.message}
                  </Typography>
                </Paper>
              </div>

              {selectedBroadcast.document &&
                getFileUrls(selectedBroadcast.document).length > 0 && (
                  <div>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      className="uppercase tracking-wider text-xs mb-2"
                    >
                      Attachments
                    </Typography>
                    <div className="flex flex-wrap gap-2">
                      {getFileUrls(selectedBroadcast.document).map(
                        (url, index) => (
                          <Chip
                            key={index}
                            icon={<AttachFileIcon />}
                            label={`Attachment ${index + 1}`}
                            onClick={() => handleDownload(url)}
                            variant="outlined"
                            clickable
                            sx={{ borderColor: "#6F0B14", color: "#6F0B14" }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: "#6F0B14", fontFamily: "'Roboto', sans-serif" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Outfit', sans-serif",
            color: "#B31B1B",
          }}
        >
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
