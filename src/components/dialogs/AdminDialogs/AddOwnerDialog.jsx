import React, { useState, useRef } from "react";
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
} from "@mui/icons-material";

export default function AddOwnerDialog({ open, onClose, flat }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [existingOwner, setExistingOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
  React.useEffect(() => {
    if (open && flat?.id) {
      checkExistingOwner();
      resetForm();
    }
  }, [open, flat?.id]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      whatsapp_number: "",
      profile_url: "",
      role_type: existingOwner ? "Tanent-M" : "Tanent-O",
    });
    setErrors({});
  };

  const checkExistingOwner = async () => {
    setOwnerLoading(true);
    try {
      const { data, error } = await supabase
        .from("flat_users")
        .select(
          `
          *,
          users (
            id,
            name,
            role_type
          )
        `
        )
        .eq("flat_id", flat.id)
        .eq("is_owner", true)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.users?.role_type === "Tanent-O") {
        setExistingOwner(data.users);
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("User not authenticated");
      }

      const { data: currentUser, error } = await supabase
        .from("users")
        .select("id, registered_user_id")
        .eq("registered_user_id", session.user.id)
        .single();

      if (userError) throw userError;

      // Create new user
      const newUserData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        number: formData.phone,
        whatsapp_number: formData.whatsapp_number || null,
        profile_url: formData.profile_url || null,
        registered_user_id: crypto.randomUUID(),
        role_type: formData.role_type,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert(newUserData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Map user to flat
      const flatUserData = {
        flat_id: flat.id,
        user_id: newUser.id,
        is_owner: formData.role_type === "Tanent-O",
        added_by: currentUser.id,
        added_at: new Date().toISOString(),
      };

      const { error: mapError } = await supabase
        .from("flat_users")
        .insert(flatUserData);

      if (mapError) throw mapError;

      // Update flat occupancy status
      if (formData.role_type === "Tanent-O") {
        const { error: updateError } = await supabase
          .from("flats")
          .update({
            occupancy_status: "Occupied",
            updated_at: new Date().toISOString(),
          })
          .eq("id", flat.id);

        if (updateError) throw updateError;
      }

      toast.success(
        formData.role_type === "Tanent-O"
          ? "Primary owner added successfully!"
          : "Family member added successfully!"
      );

      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
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
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.lightBackground,
          borderBottom: `1px solid ${theme.trackSelect}`,
          py: 2,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              bgcolor: theme.primary,
              color: "white",
              p: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {formData.role_type === "Tanent-O" ? (
              <Person sx={{ fontSize: 24 }} />
            ) : (
              <FamilyRestroom sx={{ fontSize: 24 }} />
            )}
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.textAndTab,
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {formData.role_type === "Tanent-O"
                ? "Add Primary Owner"
                : "Add Family Member"}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={0.5}>
              <Typography
                variant="body2"
                sx={{
                  color: theme.hintText,
                  fontFamily: "'Roboto', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Badge sx={{ fontSize: 14 }} />
                Flat No: {flat?.flat_number}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.hintText,
                  fontFamily: "'Roboto', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Floor: {flat?.floor_number || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box p={3}>
          {ownerLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress sx={{ color: theme.primary }} />
            </Box>
          ) : existingOwner ? (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                bgcolor: `${theme.trackSelect}15`,
                color: theme.textAndTab,
                border: `1px solid ${theme.trackSelect}`,
                borderRadius: 1,
                "& .MuiAlert-icon": {
                  color: theme.textAndTab,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                <strong>Existing Owner:</strong> {existingOwner.name}
                <br />
                <span style={{ color: theme.hintText }}>
                  You're adding a family member to this flat.
                </span>
              </Typography>
            </Alert>
          ) : (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                bgcolor: `${theme.success}15`,
                color: theme.success,
                border: `1px solid ${theme.success}30`,
                borderRadius: 1,
                "& .MuiAlert-icon": {
                  color: theme.success,
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontFamily: "'Roboto', sans-serif" }}
              >
                You're adding the <strong>primary owner</strong> for this flat.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Column - Profile Image & Role */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  border: `1px solid ${theme.trackSelect}`,
                  borderRadius: 2,
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Profile Image Upload */}
                  <Box mb={3}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 1.5,
                        color: theme.textAndTab,
                        fontWeight: 600,
                        fontFamily: "'Roboto', sans-serif",
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
                        transition: "all 0.3s",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          borderColor: theme.primary,
                          backgroundColor: theme.lightBackground,
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
                        <Box position="relative">
                          <Avatar
                            src={formData.profile_url}
                            sx={{
                              width: 120,
                              height: 120,
                              mx: "auto",
                              mb: 2,
                              border: `3px solid ${theme.primary}30`,
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
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage();
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box>
                          <CloudUpload
                            sx={{
                              fontSize: 48,
                              color: theme.hintText,
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
                              <Box display="flex" alignItems="center" gap={1}>
                                <CircularProgress
                                  size={16}
                                  sx={{ color: theme.primary }}
                                />
                                Uploading...
                              </Box>
                            ) : (
                              <>
                                Drag & drop or click to upload
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
                      )}
                    </Box>
                  </Box>

                  {/* Role Type Selection */}
                  <Box>
                    <FormControl fullWidth>
                      <InputLabel
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          color: theme.hintText,
                        }}
                      >
                        Role Type
                      </InputLabel>
                      <Select
                        value={formData.role_type}
                        onChange={handleChange("role_type")}
                        label="Role Type"
                        disabled={!!existingOwner}
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.trackSelect,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.primary,
                          },
                        }}
                      >
                        <MenuItem
                          value="Tanent-O"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          Tanent-O (Primary Owner)
                        </MenuItem>
                        <MenuItem
                          value="Tanent-M"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          Tanent-M (Family Member)
                        </MenuItem>
                      </Select>
                    </FormControl>

                    {existingOwner && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.hintText,
                          mt: 0.5,
                          display: "block",
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        Primary owner already exists
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={7}>
              <Card
                sx={{
                  border: `1px solid ${theme.trackSelect}`,
                  borderRadius: 2,
                  overflow: "hidden",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 3,
                      color: theme.textAndTab,
                      fontWeight: 600,
                      fontFamily: "'Roboto', sans-serif",
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
                              <Badge sx={{ color: theme.textAndTab }} />
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
                            },
                            "&:hover fieldset": {
                              borderColor: theme.primary,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: theme.primary,
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Email Field */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Email Address"
                        fullWidth
                        type="email"
                        value={formData.email}
                        onChange={handleChange("email")}
                        error={!!errors.email}
                        helperText={errors.email || "Optional"}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: theme.textAndTab }} />
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
                            },
                            "&:hover fieldset": {
                              borderColor: theme.primary,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: theme.primary,
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Grid>

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
                              <Phone sx={{ color: theme.textAndTab }} />
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
                            },
                            "&:hover fieldset": {
                              borderColor: theme.primary,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: theme.primary,
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* WhatsApp Number Field */}
                    <Grid item xs={12}>
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
                              <WhatsApp sx={{ color: theme.textAndTab }} />
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
                            },
                            "&:hover fieldset": {
                              borderColor: theme.primary,
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: theme.primary,
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Grid>

                    {/* Info Box */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: theme.lightBackground,
                          borderRadius: 1.5,
                          border: `1px solid ${theme.trackSelect}`,
                          mt: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.textAndTab,
                            fontWeight: 600,
                            fontFamily: "'Roboto', sans-serif",
                            mb: 0.5,
                          }}
                        >
                          Role Types Information
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.hintText,
                            fontFamily: "'Roboto', sans-serif",
                            lineHeight: 1.5,
                          }}
                        >
                          •{" "}
                          <strong style={{ color: theme.textAndTab }}>
                            Tanent-O:
                          </strong>{" "}
                          Primary owner/resident (can only be one per flat)
                          <br />•{" "}
                          <strong style={{ color: theme.textAndTab }}>
                            Tanent-M:
                          </strong>{" "}
                          Family member (additional residents, can be multiple)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          bgcolor: theme.lightBackground,
          borderTop: `1px solid ${theme.trackSelect}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            fontFamily: "'Roboto', sans-serif",
            textTransform: "none",
            fontWeight: 500,
            borderColor: theme.trackSelect,
            color: theme.textAndTab,
            borderRadius: 1,
            px: 3,
            "&:hover": {
              borderColor: theme.primary,
              bgcolor: `${theme.primary}08`,
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
            fontWeight: 500,
            bgcolor: theme.button,
            borderRadius: 1,
            px: 4,
            "&:hover": {
              bgcolor: theme.darkTrackSelect,
            },
            "&:disabled": {
              bgcolor: `${theme.button}80`,
            },
          }}
        >
          {loading
            ? "Processing..."
            : formData.role_type === "Tanent-O"
            ? "Add Primary Owner"
            : "Add Family Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
