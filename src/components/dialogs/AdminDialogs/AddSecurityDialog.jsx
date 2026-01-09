import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close,
  Person,
  Phone,
  Email,
  Badge,
  Key,
  Visibility,
  VisibilityOff,
  CloudUpload,
  Delete,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { supabase } from "../../../api/supabaseClient";
import { toast } from "react-toastify";
import { uploadImage } from "../../../api/uploadImage";
import { motion } from "framer-motion";

export default function AddSecurityDialog({
  open,
  onClose,
  guard,
  buildings = [],

  societyId,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    building_id: "",
    profile_url: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  const theme = {
    primary: "#6F0B14",
    textAndTab: "#6F0B14",
    hintText: "#A29EB6",
    button: "#6F0B14",
    lightBackground: "rgba(111, 11, 20, 0.09)",
    trackSelect: "rgba(111, 11, 20, 0.44)",
    darkTrackSelect: "rgba(111, 11, 20, 0.61)",
    success: "#008000",
    reject: "#B31B1B",
    white: "#FFFFFF",
  };

  useEffect(() => {
    if (open) {
      resetForm();
      if (guard) {
        setFormData({
          name: guard.name || "",
          email: guard.email || "",
          //   password: "", // Don't show existing password
          phone: guard.number || "",
          building_id: guard.building_id || "",
          profile_url: guard.profile_url || "",
          is_active: guard.is_active,
        });
      }
    }
  }, [open, guard]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      building_id: "",
      profile_url: "",
      is_active: true,
    });
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!guard && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!guard && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    if (field === "phone") {
      const digits = value.replace(/\D/g, "");
      const formatted = digits.slice(0, 10);
      setFormData({ ...formData, [field]: formatted });
      if (errors[field]) setErrors({ ...errors, [field]: "" });
    } else {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) setErrors({ ...errors, [field]: "" });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleImageUpload(files[0]);
    }
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        profile_url: result.url,
      }));
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_url: "",
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      if (!adminUser?.id) {
        throw new Error("Admin not authenticated");
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        number: formData.phone,
        role_type: "Security",
        building_id: formData.building_id || null,
        society_id: societyId,
        profile_url: formData.profile_url || null,
        is_active: formData.is_active,
        is_delete: false,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString(),
      };

      if (guard) {
        // ✅ UPDATE
        const { error } = await supabase
          .from("users")
          .update(payload)
          .eq("id", guard.id);

        if (error) throw error;
        toast.success("Security guard updated");
      } else {
        // ✅ INSERT
        payload.created_by = adminUser.id;
        payload.created_at = new Date().toISOString();

        const { error } = await supabase.from("users").insert([payload]);

        if (error) throw error;
        toast.success("Security guard added");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save guard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: `0 20px 60px ${theme.primary}20`,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          backgroundColor: theme.lightBackground,
          borderBottom: `2px solid ${theme.trackSelect}`,
          py: 2.5,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                backgroundColor: `${theme.primary}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SecurityIcon sx={{ fontSize: 24, color: theme.primary }} />
            </Box>
          </motion.div>
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                color: theme.textAndTab,
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {guard ? "Edit Security Guard" : "Add Security Guard"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: theme.hintText, fontFamily: "'Roboto', sans-serif" }}
            >
              {guard
                ? "Update guard details"
                : "Add new security guard to society"}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.textAndTab,
            "&:hover": {
              backgroundColor: `${theme.primary}10`,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box p={3}>
          <Grid container spacing={3}>
            {/* Left Column - Profile Image */}
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Card
                  sx={{
                    border: `2px solid ${theme.trackSelect}`,
                    borderRadius: 3,
                    overflow: "hidden",
                    height: "100%",
                    boxShadow: `0 8px 32px ${theme.trackSelect}20`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Profile Image Upload */}
                    <Box mb={3}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 2,
                          color: theme.textAndTab,
                          fontWeight: 600,
                          fontFamily: "'Roboto', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        Profile Image
                      </Typography>

                      <Box
                        sx={{
                          border: `2px dashed ${
                            dragging ? theme.primary : theme.trackSelect
                          }`,
                          borderRadius: 2,
                          p: 3,
                          textAlign: "center",
                          backgroundColor: dragging
                            ? theme.lightBackground
                            : "transparent",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            borderColor: theme.primary,
                            backgroundColor: theme.lightBackground,
                            transform: "translateY(-2px)",
                            boxShadow: `0 8px 24px ${theme.trackSelect}30`,
                          },
                        }}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileInput}
                          accept="image/*"
                          style={{ display: "none" }}
                        />

                        {formData.profile_url ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box position="relative">
                              <Avatar
                                src={formData.profile_url}
                                sx={{
                                  width: 120,
                                  height: 120,
                                  mx: "auto",
                                  mb: 2,
                                  border: `4px solid ${theme.primary}30`,
                                  boxShadow: `0 8px 24px ${theme.trackSelect}40`,
                                }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: "calc(50% - 70px)",
                                  backgroundColor: theme.reject,
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: theme.reject,
                                    opacity: 0.9,
                                    transform: "scale(1.1)",
                                  },
                                  transition: "all 0.2s",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage();
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box>
                              <CloudUpload
                                sx={{
                                  fontSize: 48,
                                  color: uploadingImage
                                    ? theme.trackSelect
                                    : theme.hintText,
                                  mb: 1.5,
                                  opacity: uploadingImage ? 0.5 : 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.hintText,
                                  fontFamily: "'Roboto', sans-serif",
                                }}
                              >
                                {uploadingImage ? (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                  >
                                    <CircularProgress
                                      size={20}
                                      sx={{ color: theme.primary }}
                                    />
                                    Uploading...
                                  </Box>
                                ) : (
                                  <>
                                    <Box
                                      component="span"
                                      sx={{
                                        fontWeight: 500,
                                        color: theme.textAndTab,
                                      }}
                                    >
                                      Drag & drop or click to upload
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      mt={1}
                                      sx={{
                                        color: theme.hintText,
                                        fontFamily: "'Roboto', sans-serif",
                                      }}
                                    >
                                      JPG, PNG up to 5MB
                                    </Typography>
                                  </>
                                )}
                              </Typography>
                            </Box>
                          </motion.div>
                        )}
                      </Box>
                    </Box>

                    {/* Status Toggle (only for edit) */}
                    {guard && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mb: 1.5,
                            color: theme.textAndTab,
                            fontWeight: 600,
                            fontFamily: "'Roboto', sans-serif",
                          }}
                        >
                          Status
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={formData.is_active}
                            onChange={handleChange("is_active")}
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.primary,
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: theme.primary,
                                  borderWidth: 2,
                                },
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem
                              value={true}
                              sx={{ fontFamily: "'Roboto', sans-serif" }}
                            >
                              Active
                            </MenuItem>
                            <MenuItem
                              value={false}
                              sx={{ fontFamily: "'Roboto', sans-serif" }}
                            >
                              Inactive
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card
                  sx={{
                    border: `2px solid ${theme.trackSelect}`,
                    borderRadius: 3,
                    overflow: "hidden",
                    height: "100%",
                    boxShadow: `0 8px 32px ${theme.trackSelect}20`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 3,
                        color: theme.textAndTab,
                        fontWeight: 600,
                        fontFamily: "'Roboto', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      Personal Information
                    </Typography>

                    <Grid container spacing={2.5}>
                      {/* Name Field */}
                      <Grid item xs={12}>
                        <TextField
                          label="Full Name"
                          fullWidth
                          value={formData.name}
                          onChange={handleChange("name")}
                          error={!!errors.name}
                          helperText={errors.name}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Badge sx={{ color: theme.primary }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiInputLabel-root": {
                              fontFamily: "'Roboto', sans-serif",
                              color: theme.hintText,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: theme.primary,
                            },
                            "& .MuiOutlinedInput-root": {
                              fontFamily: "'Roboto', sans-serif",
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: theme.primary,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: theme.primary,
                                borderWidth: 2,
                              },
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>

                      {/* Email Field */}
                      <Grid item xs={12}>
                        <TextField
                          label="Email Address"
                          fullWidth
                          type="email"
                          value={formData.email}
                          onChange={handleChange("email")}
                          error={!!errors.email}
                          helperText={errors.email}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: theme.primary }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiInputLabel-root": {
                              fontFamily: "'Roboto', sans-serif",
                              color: theme.hintText,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: theme.primary,
                            },
                            "& .MuiOutlinedInput-root": {
                              fontFamily: "'Roboto', sans-serif",
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: theme.primary,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: theme.primary,
                                borderWidth: 2,
                              },
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>

                      {/* Password Field (only for new guards) */}
                      {!guard && (
                        <Grid item xs={12}>
                          <TextField
                            label="Password"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange("password")}
                            error={!!errors.password}
                            helperText={
                              errors.password || "Minimum 6 characters"
                            }
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Key sx={{ color: theme.primary }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                    size="small"
                                    sx={{ color: theme.primary }}
                                  >
                                    {showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiInputLabel-root": {
                                fontFamily: "'Roboto', sans-serif",
                                color: theme.hintText,
                              },
                              "& .MuiInputLabel-root.Mui-focused": {
                                color: theme.primary,
                              },
                              "& .MuiOutlinedInput-root": {
                                fontFamily: "'Roboto', sans-serif",
                                "& fieldset": {
                                  borderColor: theme.trackSelect,
                                  borderWidth: 2,
                                },
                                "&:hover fieldset": {
                                  borderColor: theme.primary,
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: theme.primary,
                                  borderWidth: 2,
                                },
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Grid>
                      )}

                      {/* Phone Field */}
                      <Grid item xs={12}>
                        <TextField
                          label="Phone Number"
                          fullWidth
                          value={formData.phone}
                          onChange={handleChange("phone")}
                          error={!!errors.phone}
                          helperText={errors.phone || "10 digits"}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone sx={{ color: theme.primary }} />
                              </InputAdornment>
                            ),
                            inputProps: {
                              maxLength: 10,
                            },
                          }}
                          sx={{
                            "& .MuiInputLabel-root": {
                              fontFamily: "'Roboto', sans-serif",
                              color: theme.hintText,
                            },
                            "& .MuiInputLabel-root.Mui-focused": {
                              color: theme.primary,
                            },
                            "& .MuiOutlinedInput-root": {
                              fontFamily: "'Roboto', sans-serif",
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                              "&:hover fieldset": {
                                borderColor: theme.primary,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: theme.primary,
                                borderWidth: 2,
                              },
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>

                      {/* Building Selection */}
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              color: theme.hintText,
                            }}
                          >
                            Assign to Building (Optional)
                          </InputLabel>
                          <Select
                            value={formData.building_id}
                            onChange={handleChange("building_id")}
                            label="Assign to Building (Optional)"
                            sx={{
                              fontFamily: "'Roboto', sans-serif",
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.primary,
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: theme.primary,
                                  borderWidth: 2,
                                },
                              borderRadius: 2,
                            }}
                          >
                            <MenuItem value="">
                              <em>Society-wide (All Buildings)</em>
                            </MenuItem>
                            {buildings.map((building) => (
                              <MenuItem
                                key={building.id}
                                value={building.id}
                                sx={{ fontFamily: "'Roboto', sans-serif" }}
                              >
                                {building.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Info Box */}
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <Alert
                            severity="info"
                            sx={{
                              backgroundColor: theme.lightBackground,
                              color: theme.textAndTab,
                              border: `1px solid ${theme.trackSelect}`,
                              borderRadius: 2,
                              fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: "'Roboto', sans-serif" }}
                            >
                              <strong>Note:</strong> Security guards will be
                              added as users with "Security" role type. They
                              will appear in the users table and can login using
                              their email and password.
                            </Typography>
                          </Alert>
                        </motion.div>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 3,
          backgroundColor: theme.lightBackground,
          borderTop: `2px solid ${theme.trackSelect}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          startIcon={<Close />}
          sx={{
            fontFamily: "'Roboto', sans-serif",
            textTransform: "none",
            fontWeight: 600,
            borderColor: theme.trackSelect,
            color: theme.textAndTab,
            borderRadius: 2,
            px: 4,
            py: 1,
            "&:hover": {
              borderColor: theme.primary,
              backgroundColor: `${theme.primary}08`,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || uploadingImage}
          startIcon={
            loading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : null
          }
          sx={{
            fontFamily: "'Roboto', sans-serif",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: theme.button,
            borderRadius: 2,
            px: 5,
            py: 1,
            "&:hover": {
              backgroundColor: theme.darkTrackSelect,
            },
            "&:disabled": {
              backgroundColor: `${theme.button}80`,
            },
          }}
        >
          {loading
            ? "Processing..."
            : guard
            ? "Update Guard"
            : "Add Security Guard"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
