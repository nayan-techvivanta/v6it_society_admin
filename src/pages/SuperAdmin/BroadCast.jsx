import React, { useState, useRef } from "react";
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
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  backdropFilter: "blur(10px)",
}));

const GradientButton = styled(Button)(({ theme }) => {
  const primary = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;
  const secondary = theme.palette.secondary.main;

  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    padding: "12px 32px",
    borderRadius: "12px",
    textTransform: "none",

    "&:hover": {
      background: `linear-gradient(135deg, ${primaryDark} 0%, ${secondary} 100%)`,
      transform: "translateY(-2px)",
      boxShadow: `0 10px 25px ${primary}55`,
    },

    "&:disabled": {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    },

    transition: "all 0.3s ease",
  };
});

const FileUploadArea = styled(Paper)(({ theme, isdragging }) => ({
  border: "2px dashed",
  borderColor: isdragging === "true" ? "#667eea" : "#e2e8f0",
  borderRadius: "16px",
  padding: "40px 20px",
  textAlign: "center",
  cursor: "pointer",
  background:
    isdragging === "true" ? "rgba(102, 126, 234, 0.05)" : "transparent",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#667eea",
    background: "rgba(102, 126, 234, 0.05)",
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
    priority: "medium",
    scheduleForLater: false,
    scheduledDate: "",
    scheduledTime: "",
  });

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const fileInputRef = useRef(null);

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

    setLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("priority", formData.priority);

      if (formData.scheduleForLater) {
        formDataToSend.append("scheduledDate", formData.scheduledDate);
        formDataToSend.append("scheduledTime", formData.scheduledTime);
      }

      files.forEach((file, index) => {
        formDataToSend.append(`file${index}`, file.file);
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success
      setSnackbar({
        open: true,
        message: formData.scheduleForLater
          ? "Broadcast scheduled successfully!"
          : "Broadcast sent successfully!",
        severity: "success",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "general",
        priority: "medium",
        scheduleForLater: false,
        scheduledDate: "",
        scheduledTime: "",
      });
      setFiles([]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to send broadcast. Please try again.",
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
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Typography
            variant="h3"
            className="font-bold  bg-clip-text text-red-800"
          >
            <AnnouncementIcon className="mr-3" />
            Create Broadcast
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            className="mt-2"
          >
            Send important announcements, notifications, and updates to all
            society members
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
                          borderRadius: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
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
                          borderRadius: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.5)",
                        },
                      }}
                    />
                  </motion.div>

                  {/* Category and Priority */}
                  {/* <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        label="Category"
                      >
                        <MenuItem value="general">
                          General Announcement
                        </MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                        <MenuItem value="event">Event</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                        <MenuItem value="billing">Billing & Payments</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Priority</InputLabel>
                      <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        label="Priority"
                      >
                        <MenuItem value="low">
                          <Chip label="Low" color="success" size="small" />
                        </MenuItem>
                        <MenuItem value="medium">
                          <Chip label="Medium" color="warning" size="small" />
                        </MenuItem>
                        <MenuItem value="high">
                          <Chip label="High" color="error" size="small" />
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </motion.div> */}

                  {/* Schedule Option */}
                  {/* <motion.div variants={itemVariants}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.scheduleForLater}
                          onChange={handleInputChange}
                          name="scheduleForLater"
                          color="primary"
                        />
                      }
                      label="Schedule for later"
                    />

                    <AnimatePresence>
                      {formData.scheduleForLater && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                        >
                          <TextField
                            fullWidth
                            label="Date"
                            name="scheduledDate"
                            type="date"
                            value={formData.scheduledDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            fullWidth
                            label="Time"
                            name="scheduledTime"
                            type="time"
                            value={formData.scheduledTime}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div> */}
                </CardContent>
              </StyledCard>

              {/* File Upload Section */}
              <motion.div variants={itemVariants}>
                <StyledCard>
                  <CardContent className="p-6">
                    <Typography variant="h6" className="mb-4 font-semibold">
                      Attachments (Optional)
                    </Typography>

                    <FileUploadArea
                      isdragging={isDragging.toString()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <CloudUploadIcon className="text-4xl text-gray-400 mb-4" />
                      <Typography variant="body1" className="mb-2">
                        {isDragging
                          ? "Drop files here"
                          : "Drag & drop files or click to browse"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
                            className="font-medium"
                          >
                            Selected Files ({files.length})
                          </Typography>
                          {files.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="text-purple-600">
                                  {getFileIcon(file.type)}
                                </div>
                                <div>
                                  <Typography
                                    variant="body2"
                                    className="font-medium"
                                  >
                                    {file.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatFileSize(file.size)}
                                  </Typography>
                                </div>
                              </div>
                              <IconButton
                                size="small"
                                onClick={() => removeFile(file.id)}
                                className="text-red-500 hover:bg-red-50"
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
                  <Typography variant="h6" className="mb-4 font-semibold">
                    Preview
                  </Typography>

                  <div className="space-y-4">
                    <div>
                      <Typography variant="caption" color="text.secondary">
                        Title
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {formData.title || "No title entered"}
                      </Typography>
                    </div>

                    <Divider />

                    <div>
                      <Typography variant="caption" color="text.secondary">
                        Description Preview
                      </Typography>
                      <Typography variant="body2" className="mt-1 line-clamp-4">
                        {formData.description || "No description entered"}
                      </Typography>
                    </div>

                    <Divider />

                    {/* <div className="flex justify-between">
                      <div>
                        <Typography variant="caption" color="text.secondary">
                          Category
                        </Typography>
                        <Typography
                          variant="body2"
                          className="font-medium capitalize"
                        >
                          {formData.category}
                        </Typography>
                      </div>
                      <div>
                        <Typography variant="caption" color="text.secondary">
                          Priority
                        </Typography>
                        <div className="mt-1">
                          <Chip
                            label={formData.priority}
                            size="small"
                            color={
                              formData.priority === "high"
                                ? "error"
                                : formData.priority === "medium"
                                ? "warning"
                                : "success"
                            }
                          />
                        </div>
                      </div>
                    </div> */}

                    {files.length > 0 && (
                      <>
                        <Divider />
                        <div>
                          <Typography variant="caption" color="text.secondary">
                            Attachments
                          </Typography>
                          <Typography variant="body2" className="mt-1">
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
                  disabled={loading}
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
                    : "Send Broadcast "}
                </GradientButton>
              </motion.div>

              {/* Quick Stats */}
              <StyledCard>
                <CardContent className="p-6">
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    className="mb-3"
                  >
                    Broadcast Stats
                  </Typography>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Typography variant="body2">Characters</Typography>
                      <Typography variant="body2" className="font-medium">
                        {formData.description.length}/5000
                      </Typography>
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body2">Attachments</Typography>
                      <Typography variant="body2" className="font-medium">
                        {files.length}/10
                      </Typography>
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body2">Total Size</Typography>
                      <Typography variant="body2" className="font-medium">
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Broadcast;
