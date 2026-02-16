import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Typography,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
  FormHelperText,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { supabase } from "../../../api/supabaseClient";
import { uploadImage } from "../../../api/uploadImage";

const normalizeRole = (rawRole = "") => {
  const r = rawRole.toLowerCase().replace("-", "");
  if (r === "tanento") return "tenant_o";
  if (r === "tanentm") return "tenant_m";
  if (r === "security") return "security";
  return r;
};

const UploadArea = styled(Paper)(({ theme, error }) => ({
  border: `2px dashed ${error ? "#B31B1B" : "rgba(111, 11, 20, 0.2)"}`,
  borderRadius: "12px",
  padding: "24px",
  textAlign: "center",
  backgroundColor: "rgba(111, 11, 20, 0.02)",
  transition: "all 0.2s ease",
  cursor: "pointer",
  "&:hover": {
    borderColor: "#6F0B14",
    backgroundColor: "rgba(111, 11, 20, 0.04)",
  },
}));

export default function AddVisitor({ open, onClose }) {
  const rawRole = localStorage.getItem("role") || "";
  const role = normalizeRole(rawRole);

  const isTenant = role === "tenant_o" || role === "tenant_m";
  const isSecurity = role === "security";

  // Allow only these roles
  if (!isTenant && !isSecurity) return null;

  const societyId = localStorage.getItem("societyId");
  const buildingId = localStorage.getItem("buildingId");
  const flatId = localStorage.getItem("flatId");
  const flatNumber = localStorage.getItem("flatNumber");
  const userId = localStorage.getItem("userId");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    visitPurpose: "",
    visitDate: "",
    visitTime: "",
    visitorPhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const visitPurposes = [
    { value: "Guest", label: "Guest", icon: "👤" },
    { value: "Delivery", label: "Delivery", icon: "📦" },
    { value: "Cab", label: "Cab", icon: "🚕" },
    { value: "Maintenance", label: "Maintenance", icon: "🔧" },
    { value: "Other", label: "Other", icon: "📝" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          photo: "File size should be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          photo: "Please upload an image file",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, visitorPhoto: file }));
      setErrors((prev) => ({ ...prev, photo: null }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, visitorPhoto: null }));
    setPhotoPreview(null);
    setErrors((prev) => ({ ...prev, photo: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.visitPurpose)
      newErrors.visitPurpose = "Visit purpose is required";
    if (!formData.visitDate) newErrors.visitDate = "Visit date is required";
    if (!formData.visitTime) newErrors.visitTime = "Visit time is required";

    if (
      formData.phoneNumber &&
      !/^[0-9+\-\s()]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      let imageUrl = null;

      // 🔹 Upload Image using the custom uploadImage function
      if (formData.visitorPhoto) {
        try {
          const uploadResult = await uploadImage(formData.visitorPhoto);
          imageUrl = uploadResult.url; // Adjust based on your API response structure
        } catch (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }

      // 🔹 Decide visit_type
      const visitType = isTenant ? "PreVisitor" : "Normal";

      // 🔹 Approved status logic
      const approvedStatus = isTenant ? "Pending" : "Approved";

      // 🔹 Insert Visitor
      const { error } = await supabase.from("visitors").insert([
        {
          society_id: Number(societyId),
          building_id: Number(buildingId),
          flat_id: isTenant ? Number(flatId) : null,
          flat_number: isTenant ? flatNumber : null,
          visitor_name: formData.fullName,
          phone_number: formData.phoneNumber,
          purpose: formData.visitPurpose,
          visitor_type: formData.visitPurpose,
          visit_type: visitType,
          image_url: imageUrl,
          approved_status: approvedStatus,
          approved_by: isTenant ? Number(userId) : null,
          verified_by_guard: isSecurity ? Number(userId) : null,
          in_time: `${formData.visitDate} ${formData.visitTime}`,
        },
      ]);

      if (error) throw error;

      setSuccess(true);

      // Reset form and close after success
      setTimeout(() => {
        setFormData({
          fullName: "",
          phoneNumber: "",
          visitPurpose: "",
          visitDate: "",
          visitTime: "",
          visitorPhoto: null,
        });
        setPhotoPreview(null);
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error:", err.message);
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fullName: "",
        phoneNumber: "",
        visitPurpose: "",
        visitDate: "",
        visitTime: "",
        visitorPhoto: null,
      });
      setPhotoPreview(null);
      setErrors({});
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 3,
          bgcolor: "#6F0B14",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "Roboto, sans-serif",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 40, height: 40 }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, letterSpacing: 0.5 }}
            >
              Add New Visitor
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {isTenant
                ? "Pre-approve a visitor"
                : "Register a visitor at gate"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "#FFFFFF",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
          }}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, bgcolor: "#FFFFFF" }}>
          {success && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{
                mb: 3,
                bgcolor: "#008000",
                color: "#FFFFFF",
                "& .MuiAlert-icon": { color: "#FFFFFF" },
              }}
            >
              Visitor added successfully!
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Full Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name *"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                disabled={loading}
                variant="outlined"
                placeholder="Enter visitor's full name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: "#6F0B14" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover fieldset": {
                      borderColor: "#6F0B14",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6F0B14",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#6F0B14",
                  },
                }}
              />
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number *"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                disabled={loading}
                variant="outlined"
                placeholder="Enter 10-digit mobile number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: "#6F0B14" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover fieldset": {
                      borderColor: "#6F0B14",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6F0B14",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#6F0B14",
                  },
                }}
              />
            </Grid>

            {/* Visit Purpose */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!errors.visitPurpose}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover fieldset": {
                      borderColor: "#6F0B14",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6F0B14",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#6F0B14",
                  },
                }}
              >
                <InputLabel>Visit Purpose *</InputLabel>
                <Select
                  name="visitPurpose"
                  value={formData.visitPurpose}
                  onChange={handleInputChange}
                  label="Visit Purpose *"
                  disabled={loading}
                  renderValue={(selected) => {
                    if (!selected) return <em>Select Purpose</em>;
                    const purpose = visitPurposes.find(
                      (p) => p.value === selected,
                    );
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{purpose?.icon}</span>
                        <span>{purpose?.label}</span>
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Select Purpose</em>
                  </MenuItem>
                  {visitPurposes.map((purpose) => (
                    <MenuItem key={purpose.value} value={purpose.value}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>{purpose.icon}</span>
                        <span>{purpose.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.visitPurpose && (
                  <FormHelperText>{errors.visitPurpose}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Visit Date *"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleInputChange}
                error={!!errors.visitDate}
                helperText={errors.visitDate}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ color: "#6F0B14" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover fieldset": {
                      borderColor: "#6F0B14",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6F0B14",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#6F0B14",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="time"
                label="Visit Time *"
                name="visitTime"
                value={formData.visitTime}
                onChange={handleInputChange}
                error={!!errors.visitTime}
                helperText={errors.visitTime}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon sx={{ color: "#6F0B14" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "&:hover fieldset": {
                      borderColor: "#6F0B14",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6F0B14",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#6F0B14",
                  },
                }}
              />
            </Grid>

            {/* Photo Upload */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{
                  color: "#000000",
                  fontWeight: 500,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <UploadIcon sx={{ fontSize: 20, color: "#6F0B14" }} />
                Visitor Photo
              </Typography>

              {photoPreview ? (
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-block",
                    width: "100%",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "2px solid rgba(111, 11, 20, 0.1)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(111, 11, 20, 0.02)",
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={photoPreview}
                        alt="Preview"
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: "12px",
                          border: "3px solid #6F0B14",
                        }}
                        variant="rounded"
                      />
                      <IconButton
                        onClick={removePhoto}
                        sx={{
                          position: "absolute",
                          top: -12,
                          right: -12,
                          bgcolor: "#B31B1B",
                          color: "#FFFFFF",
                          width: 32,
                          height: 32,
                          "&:hover": { bgcolor: "#8B1515" },
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Box>
              ) : (
                <UploadArea error={!!errors.photo}>
                  <input
                    accept="image/*"
                    id="photo-upload"
                    type="file"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                    disabled={loading}
                  />
                  <label htmlFor="photo-upload" style={{ cursor: "pointer" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: "rgba(111, 11, 20, 0.1)",
                          color: "#6F0B14",
                          mb: 1,
                        }}
                      >
                        <UploadIcon />
                      </Avatar>
                      <Typography
                        variant="body1"
                        sx={{ color: "#6F0B14", fontWeight: 500 }}
                      >
                        Click to upload photo
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#A29EB6", mt: 0.5 }}
                      >
                        or drag and drop
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#A29EB6", mt: 1 }}
                      >
                        PNG, JPG, GIF up to 5MB
                      </Typography>
                    </Box>
                  </label>
                </UploadArea>
              )}
              {errors.photo && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 1,
                    bgcolor: "rgba(179, 27, 27, 0.1)",
                    color: "#B31B1B",
                    "& .MuiAlert-icon": { color: "#B31B1B" },
                  }}
                >
                  {errors.photo}
                </Alert>
              )}
            </Grid>

            {/* Status Info for Tenants */}
            {isTenant && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "rgba(111, 11, 20, 0.09)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <InfoIcon sx={{ color: "#6F0B14", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#000000" }}>
                    This visitor will be marked as{" "}
                    <strong style={{ color: "#DBA400" }}>Pending</strong> and
                    requires guard approval
                  </Typography>
                </Paper>
              </Grid>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <Grid item xs={12}>
                <Alert
                  severity="error"
                  sx={{
                    bgcolor: "rgba(179, 27, 27, 0.1)",
                    color: "#B31B1B",
                    "& .MuiAlert-icon": { color: "#B31B1B" },
                  }}
                >
                  {errors.submit}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, bgcolor: "#FFFFFF" }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{
              color: "#6F0B14",
              borderColor: "#6F0B14",
              borderRadius: "8px",
              px: 3,
              py: 1,
              "&:hover": {
                borderColor: "#8F0D1A",
                backgroundColor: "rgba(111, 11, 20, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
            sx={{
              bgcolor: "#6F0B14",
              borderRadius: "8px",
              px: 4,
              py: 1,
              "&:hover": {
                bgcolor: "#8F0D1A",
              },
              "&:disabled": {
                bgcolor: "rgba(111, 11, 20, 0.5)",
              },
            }}
          >
            {loading ? "Adding..." : "Add Visitor"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
