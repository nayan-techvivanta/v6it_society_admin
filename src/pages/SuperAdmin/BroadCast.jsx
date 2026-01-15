import React, { useState, useRef, useEffect } from "react";
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
  padding: "12px 28px",
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

const Broadcast = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    scheduleForLater: false,
    scheduledDate: "",
    scheduledTime: "",
    broadcastType: "society",
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
  const [societyId, setSocietyId] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(true);
  const fileInputRef = useRef(null);
  // Get society ID from localStorage on component mount
  useEffect(() => {
    const storedSocietyId = localStorage.getItem("societyId");
    if (storedSocietyId) {
      setSocietyId(parseInt(storedSocietyId));
      // Fetch buildings for this society
      fetchBuildings(parseInt(storedSocietyId));
    } else {
      setSnackbar({
        open: true,
        message: "Society ID not found. Please login again.",
        severity: "error",
      });
    }
  }, []);
  useEffect(() => {
    if (viewMode === "list") {
      fetchBroadcasts();
    }
  }, [viewMode]);

  const fetchBroadcasts = async () => {
    setLoadingBroadcasts(true);
    try {
      const { data, error } = await supabase
        .from("broadcast")
        .select(
          `
          id,
          title,
          message,
          socity_id,
          building_id,
          document,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBroadcasts(data || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      setSnackbar({
        open: true,
        message: "Failed to load broadcasts.",
        severity: "error",
      });
    } finally {
      setLoadingBroadcasts(false);
    }
  };
  // Fetch buildings for the society
  const fetchBuildings = async (societyId) => {
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
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setSnackbar({
        open: true,
        message: "Failed to load buildings. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingBuildings(false);
    }
  };

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
      return result.url; // Assuming the uploadImage function returns { url: string }
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

    if (formData.broadcastType === "building" && !formData.buildingId) {
      setSnackbar({
        open: true,
        message: "Please select a building",
        severity: "error",
      });
      return;
    }

    if (!societyId) {
      setSnackbar({
        open: true,
        message: "Society ID not found. Please login again.",
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
          uploadFileToSupabase(file.file)
        );
        fileUrls = await Promise.all(uploadPromises);
      }

      // Prepare broadcast data
      const broadcastData = {
        title: formData.title.trim(),
        message: formData.description.trim(),
        socity_id: societyId,
        building_id:
          formData.broadcastType === "building" ? formData.buildingId : null,
        document: fileUrls.length > 0 ? fileUrls.join(",") : null,
        created_at: new Date().toISOString(),
      };

      // Save to database
      await saveBroadcastToDatabase(broadcastData, fileUrls);

      // Success
      setSnackbar({
        open: true,
        message: `Broadcast sent successfully to ${
          formData.broadcastType === "society"
            ? "entire society"
            : "selected building"
        }!`,
        severity: "success",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        // category: "general",
        scheduleForLater: false,
        scheduledDate: "",
        scheduledTime: "",
        broadcastType: "society",
        buildingId: null,
      });
      setFiles([]);
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-roboto"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Typography
            variant="h4"
            className=" text-primary"
            sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700 }}
          >
            <AnnouncementIcon className="mr-3" />
            Create Broadcast
          </Typography>
          <Typography
            variant="subtitle1"
            className="mt-2 text-hintText"
            sx={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Send important announcements, notifications, and updates to society
            members
            {societyId && ` (Society ID: ${societyId})`}
          </Typography>
        </motion.div>

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
                        onChange={handleInputChange}
                        label="Send To"
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
                        >
                          <BuildingIcon className="mr-2 text-primary" />
                          Specific Building
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </motion.div>

                  {/* Building Selection (shown only when broadcastType is 'building') */}
                  <AnimatePresence>
                    {formData.broadcastType === "building" && (
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
                            disabled={loadingBuildings}
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              borderRadius: "8px",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(111, 11, 20, 0.2)",
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#6F0B14",
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
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
                                No buildings found for this society
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
                        Description Preview
                      </Typography>
                      <Typography
                        variant="body2"
                        className="mt-1 line-clamp-4 text-black"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {formData.description || "No description entered"}
                      </Typography>
                    </div>

                    <Divider className="bg-lightBackground" />

                    <div className="flex justify-between">
                      <div>
                        <Typography
                          variant="caption"
                          className="text-hintText"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          Category
                        </Typography>
                        <Typography
                          variant="body2"
                          className="font-medium capitalize text-primary"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          {formData.category}
                        </Typography>
                      </div>
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
                                : buildings.find(
                                    (b) => b.id === formData.buildingId
                                  )?.building_name || "Select Building"
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

              {/* Send Button */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GradientButton
                  fullWidth
                  type="submit"
                  disabled={loading || !societyId}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                  size="large"
                >
                  {loading
                    ? "Sending..."
                    : formData.scheduleForLater
                    ? "Schedule Broadcast"
                    : "Send Broadcast"}
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
                    <div className="flex justify-between">
                      <Typography
                        variant="body2"
                        className="text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Total Size
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-medium text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {formatFileSize(
                          files.reduce((acc, file) => acc + file.size, 0)
                        )}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </StyledCard>
            </motion.div>
          </div>
        </form>
      </div>

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
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Broadcast;
