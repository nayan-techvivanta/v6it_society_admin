import React, { useState, useRef, useEffect } from "react";
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
  FormHelperText,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { supabase } from "../../../api/supabaseClient";
import { toast } from "react-toastify";
import { uploadImage } from "../../../api/uploadImage";
import {
  CloudUpload,
  Delete,
  Person,
  FamilyRestroom,
  WhatsApp,
  Phone,
  Email,
  Badge,
  Visibility,
  VisibilityOff,
  Key,
  Close,
  Edit,
} from "@mui/icons-material";
import { createUser } from "../../../api/createUser";
import { motion } from "framer-motion";

export default function AddOwnerDialog({ open, onClose, flat }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [existingOwner, setExistingOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp_number: "",
    profile_url: "",
    role_type: "Tanent-O",
  });

  const [errors, setErrors] = useState({});

  // Theme colors
  const theme = {
    primary: "#6F0B14",
    textAndTab: "#6F0B14",
    hintText: "#A29EB6",
    button: "#6F0B14",
    checkbox: "#6F0B14",
    lightBackground: "rgba(111, 11, 20, 0.09)",
    trackSelect: "rgba(111, 11, 20, 0.44)",
    darkTrackSelect: "rgba(111, 11, 20, 0.61)",
    success: "#008000",
    pending: "#DBA400",
    reschedule: "#E86100",
    reject: "#B31B1B",
    black: "#000000",
    white: "#FFFFFF",
  };

  // Fetch existing owner when dialog opens
  useEffect(() => {
    if (open && flat?.id) {
      checkExistingOwner();
      resetForm();
    }
  }, [open, flat?.id]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      whatsapp_number: "",
      profile_url: "",
      role_type: "Tanent-O",
    });
    setErrors({});
    setShowPassword(false);
    setIsEditMode(false);
  };

  const checkExistingOwner = async () => {
    setOwnerLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, name, email, number, whatsapp_number, profile_url, role_type"
        )
        .eq("flat_id", flat.id)
        .eq("role_type", "Tanent-O")
        .eq("is_delete", false)
        .limit(1);

      if (error) {
        console.error("Error checking owner:", error);
        return;
      }

      if (data && data.length > 0) {
        setExistingOwner(data[0]);
        setFormData((prev) => ({
          ...prev,
          role_type: "Tanent-M",
        }));
      } else {
        setExistingOwner(null);
        setFormData((prev) => ({
          ...prev,
          role_type: "Tanent-O",
        }));
      }
    } catch (error) {
      console.error("Error checking existing owner:", error);
    } finally {
      setOwnerLoading(false);
    }
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

    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isEditMode && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (
      formData.whatsapp_number &&
      !/^[0-9]{10}$/.test(formData.whatsapp_number.replace(/\D/g, ""))
    ) {
      newErrors.whatsapp_number = "Enter a valid 10-digit WhatsApp number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    // Format phone numbers to only accept digits
    if (field === "phone" || field === "whatsapp_number") {
      const digits = value.replace(/\D/g, "");
      const formatted = digits.slice(0, 10);
      setFormData({ ...formData, [field]: formatted });

      // Clear error for this field when user types
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    } else {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle drag and drop
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
  const updateMemberUser = async ({ registedUserId }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) throw new Error("Admin not authenticated");

    const payload = {
      flat_id: flat.id,
      building_id: flat.building_id,
      society_id: flat.society_id,
      profile_url: formData.profile_url || null,
      created_by: user.id,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    console.log("🧾 User update payload:", payload);

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("registed_user_id", registedUserId);

    if (error) throw error;
  };

  const handleEditOwner = () => {
    if (existingOwner) {
      setIsEditMode(true);
      setFormData({
        name: existingOwner.name,
        email: existingOwner.email,
        password: "",
        phone: existingOwner.number,
        whatsapp_number: existingOwner.whatsapp_number || "",
        profile_url: existingOwner.profile_url || "",
        role_type: existingOwner.role_type,
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (isEditMode) {
      await handleUpdateUser(existingOwner.id);
    } else {
      await handleAddUser();
    }
  };

  const handleAddUser = async () => {
    try {
      setLoading(true);

      if (!flat?.id || !flat?.building_id || !flat?.society_id) {
        throw new Error("Flat data missing");
      }

      const apiResult = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        contact: formData.phone,
        whatsapp: formData.whatsapp_number || formData.phone,
        role_type: formData.role_type,
      });

      const registeredUserId =
        apiResult.user_id || apiResult.user?.id || apiResult.id;

      if (!registeredUserId) {
        throw new Error("User ID not returned from API");
      }

      console.log("✅ Registered User ID:", registeredUserId);

      // 2️⃣ Update users table with flat + image
      await updateMemberUser({ registedUserId: registeredUserId });

      // 3️⃣ Update flat occupancy if owner
      if (formData.role_type === "Tanent-O") {
        await supabase
          .from("flats")
          .update({
            occupancy_status: "Occupied",
            updated_at: new Date().toISOString(),
          })
          .eq("id", flat.id);
      }

      toast.success(
        formData.role_type === "Tanent-O"
          ? "Primary owner added successfully"
          : "Family member added successfully"
      );

      resetForm();
      onClose();
    } catch (error) {
      console.error("❌ Add user error:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      setLoading(true);

      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      if (!adminUser?.id) throw new Error("Admin not authenticated");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        number: formData.phone,
        whatsapp_number: formData.whatsapp_number || formData.phone,
        profile_url: formData.profile_url || null,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("users")
        .update(payload)
        .eq("id", userId);

      if (error) throw error;

      toast.success("User updated successfully");
      await checkExistingOwner();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(error.message || "Failed to update user");
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
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.lightBackground,
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
                bgcolor: theme.primary,
                color: "white",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${theme.primary}40`,
              }}
            >
              {isEditMode ? (
                <Edit sx={{ fontSize: 28 }} />
              ) : formData.role_type === "Tanent-O" ? (
                <Person sx={{ fontSize: 28 }} />
              ) : (
                <FamilyRestroom sx={{ fontSize: 28 }} />
              )}
            </Box>
          </motion.div>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.textAndTab,
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              {isEditMode
                ? "Edit Owner Details"
                : formData.role_type === "Tanent-O"
                ? "Add Primary Owner"
                : "Add Family Member"}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={0.5}>
              <Chip
                label={`Flat ${flat?.flat_number}`}
                size="small"
                sx={{
                  bgcolor: theme.trackSelect,
                  color: "white",
                  fontWeight: 600,
                  fontFamily: "'Roboto', sans-serif",
                  height: 24,
                }}
              />
              <Chip
                label={`Floor ${flat?.floor_number || "N/A"}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: theme.trackSelect,
                  color: theme.textAndTab,
                  fontWeight: 500,
                  fontFamily: "'Roboto', sans-serif",
                  height: 24,
                }}
              />
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.textAndTab,
            "&:hover": {
              backgroundColor: theme.lightBackground,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box p={3}>
          {ownerLoading ? (
            <Box display="flex" justifyContent="center" p={6}>
              <CircularProgress sx={{ color: theme.primary }} size={40} />
            </Box>
          ) : existingOwner && !isEditMode ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  bgcolor: `${theme.trackSelect}15`,
                  color: theme.textAndTab,
                  border: `1px solid ${theme.trackSelect}`,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${theme.trackSelect}20`,
                  "& .MuiAlert-icon": {
                    color: theme.textAndTab,
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontFamily: "'Roboto', sans-serif",
                        mb: 0.5,
                      }}
                    >
                      <Box component="span" sx={{ color: theme.primary }}>
                        ✓
                      </Box>{" "}
                      Primary Owner Exists
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={existingOwner.profile_url}
                        sx={{
                          width: 32,
                          height: 32,
                          border: `2px solid ${theme.primary}`,
                        }}
                      >
                        {existingOwner.name?.charAt(0)}
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {existingOwner.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.hintText,
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        ({existingOwner.email})
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={handleEditOwner}
                    sx={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      fontWeight: 500,
                      fontFamily: "'Roboto', sans-serif",
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: theme.darkTrackSelect,
                        backgroundColor: theme.lightBackground,
                      },
                    }}
                  >
                    Edit Owner
                  </Button>
                </Box>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  bgcolor: `${theme.success}15`,
                  color: theme.success,
                  border: `1px solid ${theme.success}40`,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${theme.success}20`,
                  "& .MuiAlert-icon": {
                    color: theme.success,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {isEditMode
                    ? "Editing primary owner details"
                    : "You're adding the primary owner for this flat."}
                </Typography>
              </Alert>
            </motion.div>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Profile Image & Role */}
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
                        <Box
                          component="span"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: theme.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          1
                        </Box>
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
                                  width: 140,
                                  height: 140,
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
                                  fontSize: 56,
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

                    {/* Role Type Selection */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 1.5,
                          color: theme.textAndTab,
                          fontWeight: 600,
                          fontFamily: "'Roboto', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: theme.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          2
                        </Box>
                        Role Type
                      </Typography>
                      <FormControl fullWidth>
                        <InputLabel
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            color: theme.hintText,
                          }}
                        >
                          Select Role
                        </InputLabel>
                        <Select
                          value={formData.role_type}
                          onChange={handleChange("role_type")}
                          label="Select Role"
                          disabled={!!existingOwner || isEditMode}
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.trackSelect,
                              borderWidth: 2,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.primary,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.primary,
                              borderWidth: 2,
                            },
                            borderRadius: 2,
                          }}
                        >
                          <MenuItem
                            value="Tanent-O"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>
                                Tanent-O (Primary Owner)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.hintText }}
                              >
                                Main resident - One per flat
                              </Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem
                            value="Tanent-M"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>
                                Tanent-M (Family Member)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.hintText }}
                              >
                                Additional resident - Multiple allowed
                              </Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      {(existingOwner || isEditMode) && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.primary,
                            mt: 1,
                            display: "block",
                            fontFamily: "'Roboto', sans-serif",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              fontSize: 16,
                            }}
                          >
                            ⓘ
                          </Box>
                          Role cannot be changed for existing owner
                        </Typography>
                      )}
                    </Box>
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
                      <Box
                        component="span"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: theme.primary,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                        }}
                      >
                        3
                      </Box>
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

                      {/* Password Field (only for new users) */}
                      {!isEditMode && (
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
                      <Grid item xs={12} sm={6}>
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

                      {/* WhatsApp Number Field */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="WhatsApp Number"
                          fullWidth
                          value={formData.whatsapp_number}
                          onChange={handleChange("whatsapp_number")}
                          error={!!errors.whatsapp_number}
                          helperText={
                            errors.whatsapp_number || "Optional - 10 digits"
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WhatsApp sx={{ color: "#25D366" }} />
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

                      {/* Info Box */}
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <Box
                            sx={{
                              p: 2.5,
                              bgcolor: theme.lightBackground,
                              borderRadius: 2,
                              border: `2px solid ${theme.trackSelect}`,
                              mt: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: theme.textAndTab,
                                fontWeight: 600,
                                fontFamily: "'Roboto', sans-serif",
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{
                                  color: theme.primary,
                                  fontSize: 18,
                                }}
                              >
                                ⓘ
                              </Box>
                              Important Information
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.hintText,
                                fontFamily: "'Roboto', sans-serif",
                                lineHeight: 1.6,
                                display: "block",
                                mb: 1,
                              }}
                            >
                              • <strong>Email and Password</strong> are required
                              for user account creation
                              <br />• Email will be used for login and
                              notifications
                              <br />• Password must be at least 6 characters
                              long
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.hintText,
                                fontFamily: "'Roboto', sans-serif",
                                lineHeight: 1.6,
                              }}
                            >
                              • <strong>Tanent-O:</strong> Primary
                              owner/resident (can only be one per flat)
                              <br />• <strong>Tanent-M:</strong> Family member
                              (additional residents, can be multiple)
                            </Typography>
                          </Box>
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

      <DialogActions
        sx={{
          p: 3,
          bgcolor: theme.lightBackground,
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
              bgcolor: `${theme.primary}08`,
              transform: "translateY(-1px)",
              boxShadow: `0 4px 12px ${theme.trackSelect}20`,
            },
            transition: "all 0.2s",
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
            bgcolor: theme.button,
            borderRadius: 2,
            px: 5,
            py: 1,
            "&:hover": {
              bgcolor: theme.darkTrackSelect,
              transform: "translateY(-1px)",
              boxShadow: `0 8px 24px ${theme.primary}40`,
            },
            "&:disabled": {
              bgcolor: `${theme.button}80`,
            },
            transition: "all 0.2s",
          }}
        >
          {loading
            ? "Processing..."
            : isEditMode
            ? "Update Owner"
            : formData.role_type === "Tanent-O"
            ? "Add Primary Owner"
            : "Add Family Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
