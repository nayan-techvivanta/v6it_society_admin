import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { GrAnnounce } from "react-icons/gr";
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Announcement as AnnouncementIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { supabase } from "../../../api/supabaseClient";
import { uploadImage } from "../../../api/uploadImage";
import { useBulkNotification } from "../../../Hooks/useBulkNotification";

// =================== Styled Components ===================
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: "linear-gradient(135deg, #6F0B14 0%, #8A0F1B 50%, #6F0B14 100%)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5, 2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2, 3),
  },
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -10,
    right: -10,
    width: 100,
    height: 100,
    background:
      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 150,
    height: 150,
    background:
      "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
}));
const TitleContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    gap: theme.spacing(1.5),
  },
  position: "relative",
  zIndex: 1,
}));
const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.15)",
  borderRadius: "12px",
  padding: "10px",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1),
    borderRadius: "14px",
  },
  backdropFilter: "blur(4px)",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
}));
const TitleTextContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1rem",
  lineHeight: 1.3,
  letterSpacing: "0.02em",
  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
  [theme.breakpoints.up("sm")]: {
    fontSize: "1.25rem",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "1.375rem",
  },
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.7rem",
  opacity: 0.9,
  letterSpacing: "0.01em",
  display: "none",
  [theme.breakpoints.up("sm")]: {
    display: "block",
    fontSize: "0.75rem",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "0.8rem",
  },
}));
const CloseIconButton = styled(IconButton)(({ theme }) => ({
  color: "#fff",
  backgroundColor: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(4px)",
  padding: theme.spacing(0.75),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1),
  },
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.25)",
    transform: "rotate(90deg) scale(1.1)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "1.2rem",
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.5rem",
    },
  },
  transition: "all 0.3s ease",
  position: "relative",
  zIndex: 1,
  "&::after": {
    content: '""',
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    transform: "translate(-50%, -50%) scale(0)",
    backgroundColor: "rgba(255,255,255,0.1)",
    transition: "transform 0.3s ease",
  },
  "&:hover::after": {
    transform: "translate(-50%, -50%) scale(1.5)",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  background: "linear-gradient(135deg,#ffffff 0%,#fef2f3 100%)",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg,#6F0B14 0%,#8A0F1B 60%,#6F0B14 100%)",
  color: "#fff",
  borderRadius: "12px",
  textTransform: "none",
  padding: "10px 15px",
  fontWeight: 600,
  "&:hover": {
    background: "linear-gradient(135deg,#8A0F1B 0%,#A51423 60%,#8A0B14 100%)",
  },
  "&:disabled": {
    background: "#cccccc",
    color: "#666666",
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: "#6F0B14",
  borderColor: "#6F0B14",
  borderRadius: "12px",
  textTransform: "none",
  fontWeight: 600,
  padding: "10px 15px",

  "&:hover": {
    borderColor: "#8A0F1B",
    backgroundColor: "rgba(111,11,20,0.04)",
  },
}));

const FileUploadArea = styled(Box)(({ isdragging }) => ({
  border: "2px dashed",
  borderColor: isdragging === "true" ? "#6F0B14" : "#D1D5DB",
  borderRadius: "12px",
  padding: "30px 20px",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor:
    isdragging === "true" ? "rgba(111,11,20,0.04)" : "transparent",
  "&:hover": {
    borderColor: "#6F0B14",
    backgroundColor: "rgba(111,11,20,0.02)",
  },
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

const FileListBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  maxHeight: "150px",
  overflowY: "auto",
  padding: theme.spacing(1),
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
}));

// =================== Component ===================
const Announcement = ({ open, onClose, userRole }) => {
  const profileId = Number(localStorage.getItem("profileId"));
  const profileSocietyId = Number(localStorage.getItem("societyId")); // security's society
  const isSecurity = userRole === "security";

  const [allSocieties, setAllSocieties] = useState([]);
  const [selectedSocieties, setSelectedSocieties] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fileInputRef = useRef(null);
  const { sendBulkNotification, getSocietyBuildingIds } = useBulkNotification();

  // =================== Fetch Societies ===================
  useEffect(() => {
    if (open) {
      fetchSocieties();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setFiles([]);
    setSelectedSocieties([]);
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("id,name,address")
        .order("name");
      if (error) throw error;

      let filtered = data;
      if (isSecurity) {
        filtered = data.filter((s) => s.id === profileSocietyId);
        // Auto-select society for security
        if (filtered.length > 0) {
          setSelectedSocieties([
            { id: filtered[0].id, name: filtered[0].name, sendTo: "society" },
          ]);
        }
      }
      setAllSocieties(filtered || []);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to load societies",
        severity: "error",
      });
    }
  };

  // =================== Handlers ===================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocietySelection = (event, newValue) => {
    setSelectedSocieties(
      newValue.map((s) => ({ id: s.id, name: s.name, sendTo: "society" })),
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
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
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // =================== Submit ===================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setSnackbar({
        open: true,
        message: "Title and Description are required",
        severity: "error",
      });
      return;
    }

    if (selectedSocieties.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one society",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload first file (optional)
      let fileUrl = null;
      if (files.length > 0) {
        const uploadResult = await uploadImage(files[0]);
        fileUrl = uploadResult.url;
      }

      // Send notifications & save broadcast
      for (const society of selectedSocieties) {
        const buildingIds = await getSocietyBuildingIds(society.id);
        if (buildingIds.length > 0) {
          await sendBulkNotification({
            buildingIds,
            title: formData.title,
            body: formData.description,
            imageUrl: fileUrl,
            notificationType: "Security",
            data: { screen: "broadcast" },
            societyName: society.name,
            society_id: society.id,
          });

          // Save to broadcast table
          await supabase.from("broadcast").insert([
            {
              title: formData.title,
              message: formData.description,
              socity_id: String(society.id),
              building_id: null,
              document: fileUrl,
              user_id: profileId,
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }

      setSnackbar({
        open: true,
        message: "Broadcast sent successfully!",
        severity: "success",
      });

      // Close dialog after successful submission
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to send broadcast",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // =================== Render ===================
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <StyledDialogTitle>
          <TitleContent>
            <IconWrapper>
              <GrAnnounce size={30} />
            </IconWrapper>
            <TitleTextContainer>
              <MainTitle variant="h6" component="span">
                Security Announcement
              </MainTitle>
              <SubTitle variant="caption">
                Broadcast important updates to residents
              </SubTitle>
            </TitleTextContainer>
          </TitleContent>

          <CloseIconButton
            onClick={onClose}
            size="small"
            aria-label="close dialog"
          >
            <CloseIcon />
          </CloseIconButton>
        </StyledDialogTitle>

        <form onSubmit={handleSubmit}>
          <StyledDialogContent dividers>
            {/* Society Selection */}
            {!isSecurity && (
              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  multiple
                  options={allSocieties}
                  getOptionLabel={(option) => option.name}
                  value={selectedSocieties
                    .map((s) => allSocieties.find((as) => as.id === s.id))
                    .filter(Boolean)}
                  onChange={handleSocietySelection}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id}
                        label={option.name}
                        deleteIcon={<CloseIcon />}
                        sx={{
                          backgroundColor: "rgba(111,11,20,0.1)",
                          color: "#6F0B14",
                          "& .MuiChip-deleteIcon": {
                            color: "#6F0B14",
                            "&:hover": {
                              color: "#8A0F1B",
                            },
                          },
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Societies"
                      placeholder="Choose societies to broadcast to"
                      required
                      helperText={
                        selectedSocieties.length === 0
                          ? "Please select at least one society"
                          : ""
                      }
                    />
                  )}
                />
              </Box>
            )}

            {/* Title */}
            <TextField
              fullWidth
              label="Broadcast Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              placeholder="Enter a compelling title for your broadcast"
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Broadcast Message"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              multiline
              rows={5}
              sx={{ mb: 3 }}
              placeholder="Write your broadcast message here..."
            />

            {/* File Upload */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "#6F0B14", fontWeight: 600 }}
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
              <CloudUploadIcon
                fontSize="large"
                sx={{ color: "#6F0B14", mb: 1 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {isDragging
                  ? "Drop files here"
                  : "Drag & drop or click to upload"}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supported files: Images, PDFs, Documents (Max 10MB)
              </Typography>
              <VisuallyHiddenInput
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
            </FileUploadArea>

            {/* File List */}
            {files.length > 0 && (
              <FileListBox>
                {files.map((file, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      mb: 0.5,
                      backgroundColor: "#fff",
                      borderRadius: "6px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: "80%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {file.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeFile(idx)}
                      sx={{ color: "#6F0B14" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </FileListBox>
            )}
          </StyledDialogContent>

          <DialogActions sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
            <CancelButton
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </CancelButton>
            <GradientButton
              type="submit"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
            >
              {loading ? "Sending..." : "Send"}
            </GradientButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          sx={{
            width: "100%",
            "& .MuiAlert-icon": {
              color: snackbar.severity === "success" ? "#4caf50" : "#f44336",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Announcement;
