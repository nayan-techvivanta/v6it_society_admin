import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  alpha,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  PersonAdd,
  Person,
  Email,
  Phone,
  Lock,
  Apartment,
  LocationCity,
  WhatsApp,
  Security,
  Assignment,
  ContactPhone,
} from "@mui/icons-material";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { createUser } from "../../../api/createUser";
const UserDialog = ({
  open,
  onClose,
  onSubmit,
  isEdit = false,
  userData,
  roleTypes,
  statusOptions,
  buildings = [],
  societies = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    role_type: "Admin",
    status: "active",
    building_id: "",
    society_id: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (open) {
      if (isEdit && userData) {
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          contact: userData.phone || "",
          role_type: userData.role_type || "Admin",
          status: userData.status || "active",
          building_id: userData.building_id || "",
          society_id: userData.society_id || "",
          whatsapp: userData.whatsapp_number || "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setFormData({
          name: "",
          email: "",
          contact: "",
          role_type: "Admin",
          status: "active",
          building_id: "",
          society_id: "",
          whatsapp: "",
          password: "",
          confirmPassword: "",
        });
      }
      setErrors({});
    }
  }, [open, userData, isEdit]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Phone number is required";
    }

    if (!isEdit && !formData.password) {
      newErrors.password = "Password is required for new Admins";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isEdit && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createUserViaAPI = async (data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-v1`,
        {
          email: data.email,
          password: data.password,
          number: data.contact,
          name: data.name,
          role_type: "Admin",
          whatsapp_number: data.whatsapp || data.contact,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Failed to create user");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     if (isEdit) {
  //       const userPayload = {
  //         name: formData.name.trim(),
  //         email: formData.email.trim(),
  //         phone: formData.contact.trim(),
  //         role_type: "Admin",
  //         status: formData.status,
  //         building_id: formData.building_id || null,
  //         society_id: formData.society_id || null,
  //         whatsapp_number: formData.whatsapp || formData.contact,
  //       };

  //       await onSubmit(userPayload);
  //     } else {
  //       const apiPayload = {
  //         name: formData.name.trim(),
  //         email: formData.email.trim(),
  //         contact: formData.contact.trim(),
  //         password: formData.password,
  //         whatsapp: formData.whatsapp || formData.contact,
  //       };

  //       const result = await createUserViaAPI(apiPayload);

  //       if ((formData.building_id || formData.society_id) && result.user_id) {
  //         const updateData = {
  //           building_id: formData.building_id || null,
  //           society_id: formData.society_id || null,
  //           whatsapp_number: formData.whatsapp || formData.contact,
  //         };

  //         await onSubmit({
  //           ...updateData,
  //           id: result.user_id,
  //           name: formData.name.trim(),
  //           email: formData.email.trim(),
  //           phone: formData.contact.trim(),
  //           role_type: "Admin",
  //           status: formData.status,
  //         });
  //       }
  //     }

  //     onClose();
  //   } catch (error) {
  //     console.error("Error in Admin submission:", error);
  //     setErrors({
  //       submit: error.message || "Failed to process Admin request",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEdit) {
        // For editing existing Admin
        const userPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.contact.trim(),
          role_type: "Admin",
          status: formData.status || "active",
          building_id: formData.building_id || null,
          society_id: formData.society_id || null,
          whatsapp_number: formData.whatsapp || formData.contact,
        };

        await onSubmit(userPayload); // your parent handler
      } else {
        // For creating new Admin
        const apiPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.contact.trim(),
          password: formData.password,
          role_type: "Admin",
          whatsapp: formData.whatsapp || formData.contact,
          building_id: formData.building_id || null,
          society_id: formData.society_id || null,
        };

        const result = await createUser(apiPayload); // ✅ use helper with token

        // If building/society info needs to be saved separately
        if ((formData.building_id || formData.society_id) && result.user_id) {
          await onSubmit({
            id: result.user_id,
            name: apiPayload.name,
            email: apiPayload.email,
            phone: apiPayload.contact,
            role_type: "Admin",
            status: "active",
            building_id: apiPayload.building_id,
            society_id: apiPayload.society_id,
            whatsapp_number: apiPayload.whatsapp,
          });
        }
      }

      onClose();
    } catch (error) {
      console.error("Error in Admin submission:", error);
      setErrors({
        submit: error.message || "Failed to process Admin request",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "password" && errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }

    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }));
    }
  };
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(111, 11, 20, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, #6F0B14 0%, ${alpha(
            "#6F0B14",
            0.8
          )} 100%)`,
          color: "white",
          py: 3,
          px: 4,
          position: "relative",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2.5}>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              <PersonAdd sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="800">
                {isEdit ? "Edit Admin Profile" : "Create New Admin"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.5, fontSize: "0.9rem" }}
              >
                {isEdit
                  ? "Update admin information and assignments"
                  : "Add a new administrator to the system"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.15)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.25)",
                transform: "rotate(90deg)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Error Alert */}
        {errors.submit && (
          <Alert
            severity="error"
            sx={{
              mx: 4,
              mt: 3,
              borderRadius: 2,
              border: `1px solid ${alpha("#B31B1B", 0.2)}`,
              backgroundColor: alpha("#B31B1B", 0.08),
            }}
          >
            <Typography variant="body2" fontWeight="600">
              {errors.submit}
            </Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 4 }}>
            {/* Section 1: Basic Information */}
            <Card
              sx={{
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${alpha("#6F0B14", 0.1)}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box
                    sx={{
                      backgroundColor: alpha("#6F0B14", 0.1),
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ContactPhone sx={{ color: "#6F0B14", fontSize: 22 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="700" color="#6F0B14">
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      value={formData.name}
                      onChange={handleChange("name")}
                      error={!!errors.name}
                      helperText={errors.name || "Enter admin's full name"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: "#6F0B14" }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          height: 48,

                          "&.MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#6F0B14",
                              borderWidth: "2px",
                            },
                          },
                        },
                      }}
                      placeholder="Enter Your name"
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      error={!!errors.email}
                      helperText={errors.email || "Admin's email for login"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: "#6F0B14" }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          height: 48,

                          "&.MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#6F0B14",
                              borderWidth: "2px",
                            },
                          },
                        },
                      }}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Phone Number"
                      value={formData.contact}
                      onChange={handleChange("contact")}
                      error={!!errors.contact}
                      helperText={errors.contact || "Primary contact number"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: "#6F0B14" }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          height: 48,

                          "&.MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#6F0B14",
                              borderWidth: "2px",
                            },
                          },
                        },
                      }}
                      required
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="WhatsApp Number"
                      value={formData.whatsapp}
                      onChange={handleChange("whatsapp")}
                      helperText="Optional - for WhatsApp communication"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WhatsApp sx={{ color: "#25D366" }} />
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          height: 48,

                          "&.MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderColor: "#6F0B14",
                              borderWidth: "2px",
                            },
                          },
                        },
                      }}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Section 2: Security Settings (Only for new Admins) */}
            {!isEdit && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  border: `1px solid ${alpha("#1976d2", 0.1)}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        backgroundColor: alpha("#6F0B14", 0.1),
                        borderRadius: 2,
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Security sx={{ color: "#6F0B14", fontSize: 22 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700" color="#6F0B14">
                      Security Settings
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Enter Password"
                        type={showPassword.password ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange("password")}
                        error={!!errors.password}
                        helperText={
                          errors.password ||
                          "Set a strong password (min 6 chars)"
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: "#6F0B14" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  togglePasswordVisibility("password")
                                }
                                edge="end"
                                size="small"
                              >
                                {showPassword.password ? (
                                  <AiOutlineEyeInvisible size={20} />
                                ) : (
                                  <AiOutlineEye size={20} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: 2,
                            height: 48,

                            "&.MuiOutlinedInput-root": {
                              "&.Mui-focused fieldset": {
                                borderColor: "#6F0B14",
                                borderWidth: "2px",
                              },
                            },
                          },
                        }}
                        required
                        variant="outlined"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Confirm Password"
                        type={
                          showPassword.confirmPassword ? "text" : "password"
                        }
                        value={formData.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        error={!!errors.confirmPassword}
                        helperText={
                          errors.confirmPassword || "Re-enter the password"
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: "#6F0B14" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  togglePasswordVisibility("confirmPassword")
                                }
                                edge="end"
                                size="small"
                              >
                                {showPassword.confirmPassword ? (
                                  <AiOutlineEyeInvisible size={20} />
                                ) : (
                                  <AiOutlineEye size={20} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: 2,
                            height: 48,

                            "&.MuiOutlinedInput-root": {
                              "&.Mui-focused fieldset": {
                                borderColor: "#6F0B14",
                                borderWidth: "2px",
                              },
                            },
                          },
                        }}
                        required
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Hidden fields */}
            <input type="hidden" name="role_type" value="Admin" />
          </Box>

          {/* Dialog Actions */}
          <Divider sx={{ borderColor: alpha("#6F0B14", 0.1) }} />
          <DialogActions
            sx={{
              p: 3,
              backgroundColor: alpha("#6F0B14", 0.02),
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#6F0B14",
                    }}
                  />
                  Fields marked with * are required
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  onClick={onClose}
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                    color: "#6F0B14",
                    border: `1px solid ${alpha("#6F0B14", 0.3)}`,
                    backgroundColor: alpha("#6F0B14", 0.05),
                    "&:hover": {
                      backgroundColor: alpha("#6F0B14", 0.1),
                      borderColor: alpha("#6F0B14", 0.5),
                    },
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 5,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    background: `linear-gradient(135deg, #6F0B14 0%, ${alpha(
                      "#6F0B14",
                      0.9
                    )} 100%)`,
                    boxShadow: "0 4px 14px rgba(111, 11, 20, 0.3)",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${alpha(
                        "#6F0B14",
                        0.9
                      )} 0%, #6F0B14 100%)`,
                      boxShadow: "0 6px 20px rgba(111, 11, 20, 0.4)",
                    },
                    "&.Mui-disabled": {
                      background: alpha("#6F0B14", 0.3),
                      color: alpha("#000000", 0.26),
                    },
                  }}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <CheckCircle />
                    )
                  }
                >
                  {isSubmitting
                    ? "Processing..."
                    : isEdit
                    ? "Update Admin"
                    : "Create Admin"}
                </Button>
              </Box>
            </Box>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
