import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  alpha,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Business,
  LocationOn,
  PinDrop,
  Public,
  Map,
  Person,
  Phone,
  Email,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { toast } from "react-toastify";

const AddSocietyDialog = ({
  open,
  onClose,
  onSubmit,
  society,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEdit && society) {
        setFormData({
          name: society.name || "",
          address: society.address || "",
          city: society.city || "",
          state: society.state || "",
          country: society.country || "",
          pincode: society.pincode || "",
        });
      } else {
        setFormData({
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [open, society, isEdit]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Society name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();

  //     if (!validateForm()) {
  //       toast.error("Please fix all errors before submitting");
  //       return;
  //     }

  //     setIsSubmitting(true);
  //     try {
  //       let result;

  //       if (isEdit) {
  //         result = await supabase
  //           .from("societies")
  //           .update(formData)
  //           .eq("id", society.id);
  //       } else {
  //         result = await supabase.from("societies").insert([formData]).select();
  //       }

  //       if (result.error) throw result.error;

  //       onSubmit(formData);
  //       toast.success(
  //         isEdit ? "Society updated successfully!" : "Society added successfully!"
  //       );
  //       onClose();
  //     } catch (error) {
  //       console.error("Error saving society:", error);
  //       toast.error("Failed to save society");
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast.error("User not authenticated. Please login again.");
        setIsSubmitting(false);
        return;
      }

      const societyData = {
        ...formData,
        created_by: isEdit ? society.created_by : userId,
        updated_by: userId,
      };

      let result;

      if (isEdit) {
        result = await supabase
          .from("societies")
          .update(societyData)
          .eq("id", society.id);
      } else {
        result = await supabase
          .from("societies")
          .insert([societyData])
          .select();
      }

      if (result.error) throw result.error;

      onSubmit(societyData);
      toast.success(
        isEdit ? "Society updated successfully!" : "Society added successfully!"
      );
      onClose();
    } catch (error) {
      console.error("Error saving society:", error);
      toast.error("Failed to save society");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, #6F0B14 0%, ${alpha(
            "#6F0B14",
            0.9
          )} 100%)`,
          color: "white",
          py: 2.5,
          px: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Business sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700">
                {isEdit ? "Edit Society" : "Add New Society"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, fontSize: "0.875rem" }}
              >
                {isEdit
                  ? "Update society details"
                  : "Fill in all required fields"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              color: "white",
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Error Alert */}
            {Object.values(errors).some(Boolean) && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  mb: 3,
                  backgroundColor: alpha("#B31B1B", 0.1),
                  color: "#B31B1B",
                  border: `1px solid ${alpha("#B31B1B", 0.2)}`,
                  "& .MuiAlert-icon": { color: "#B31B1B" },
                }}
              >
                <Typography variant="body2" fontWeight="600">
                  Please fix all errors before submitting
                </Typography>
              </Alert>
            )}

            {/* Society Name */}
            <Box sx={{ mb: 3 }}>
              <Typography
                component="label"
                variant="caption"
                fontWeight={600}
                display="block"
                mb={1}
                color="#6F0B14"
                sx={{
                  "&::after": {
                    content: '"*"',
                    color: "#B31B1B",
                    marginLeft: 0.5,
                  },
                }}
              >
                Society Name
              </Typography>

              <TextField
                fullWidth
                value={formData.name}
                onChange={handleFieldChange("name")}
                error={!!errors.name && touched.name}
                helperText={touched.name && errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "#A29EB6", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 1.5,
                    height: 44,
                  },
                }}
                placeholder="Enter society name"
                size="small"
              />
            </Box>

            {/* Address */}
            <Box sx={{ mb: 3 }}>
              <Typography
                component="label"
                variant="caption"
                fontWeight={600}
                display="block"
                mb={1}
                color="#6F0B14"
                sx={{
                  "&::after": {
                    content: '"*"',
                    color: "#B31B1B",
                    marginLeft: 0.5,
                  },
                }}
              >
                Address
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={2}
                value={formData.address}
                onChange={handleFieldChange("address")}
                error={!!errors.address && touched.address}
                helperText={touched.address && errors.address}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn
                        sx={{ color: "#A29EB6", fontSize: 20, mt: 1 }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 1.5,
                  },
                }}
                placeholder="Full address"
                size="small"
              />
            </Box>

            {/* City & State */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Box flex={1}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight={600}
                  display="block"
                  mb={1}
                  color="#6F0B14"
                  sx={{
                    "&::after": {
                      content: '"*"',
                      color: "#B31B1B",
                      marginLeft: 0.5,
                    },
                  }}
                >
                  City
                </Typography>

                <TextField
                  fullWidth
                  value={formData.city}
                  onChange={handleFieldChange("city")}
                  error={!!errors.city && touched.city}
                  helperText={touched.city && errors.city}
                  sx={{ borderRadius: 1.5 }}
                  placeholder="City"
                  size="small"
                />
              </Box>

              <Box flex={1}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight={600}
                  display="block"
                  mb={1}
                  color="#6F0B14"
                  sx={{
                    "&::after": {
                      content: '"*"',
                      color: "#B31B1B",
                      marginLeft: 0.5,
                    },
                  }}
                >
                  State
                </Typography>

                <TextField
                  fullWidth
                  value={formData.state}
                  onChange={handleFieldChange("state")}
                  error={!!errors.state && touched.state}
                  helperText={touched.state && errors.state}
                  sx={{ borderRadius: 1.5 }}
                  placeholder="State"
                  size="small"
                />
              </Box>
            </Box>

            {/* Country & Pincode */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Box flex={1}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight={600}
                  display="block"
                  mb={1}
                  color="#6F0B14"
                  sx={{
                    "&::after": {
                      content: '"*"',
                      color: "#B31B1B",
                      marginLeft: 0.5,
                    },
                  }}
                >
                  Country
                </Typography>

                <TextField
                  fullWidth
                  value={formData.country}
                  onChange={handleFieldChange("country")}
                  error={!!errors.country && touched.country}
                  helperText={touched.country && errors.country}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Public sx={{ color: "#A29EB6", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1.5,
                      height: 44,
                    },
                  }}
                  placeholder="Country"
                  size="small"
                />
              </Box>

              <Box flex={1}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight={600}
                  display="block"
                  mb={1}
                  color="#6F0B14"
                  sx={{
                    "&::after": {
                      content: '"*"',
                      color: "#B31B1B",
                      marginLeft: 0.5,
                    },
                  }}
                >
                  Pincode
                </Typography>

                <TextField
                  fullWidth
                  value={formData.pincode}
                  onChange={handleFieldChange("pincode")}
                  error={!!errors.pincode && touched.pincode}
                  helperText={touched.pincode && errors.pincode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PinDrop sx={{ color: "#A29EB6", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 1.5,
                      height: 44,
                    },
                  }}
                  placeholder="Pincode"
                  size="small"
                />
              </Box>
            </Box>

            {/* Dialog Actions */}
            <DialogActions
              sx={{
                mt: 2,
                px: 0,
                pb: 0,
                borderTop: `1px solid ${alpha("#6F0B14", 0.1)}`,
                pt: 2,
              }}
            >
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="#A29EB6">
                    * Required fields
                  </Typography>
                </Box>

                <Box display="flex" gap={2}>
                  <Button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      px: 3,
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
                    disabled={isSubmitting}
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      px: 4,
                      py: 1,
                      fontWeight: 600,
                      backgroundColor: "#6F0B14",
                      "&:hover": {
                        backgroundColor: alpha("#6F0B14", 0.9),
                        boxShadow: `0 4px 12px ${alpha("#6F0B14", 0.3)}`,
                      },
                      "&.Mui-disabled": {
                        backgroundColor: alpha("#6F0B14", 0.3),
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
                      ? "Update Society"
                      : "Add Society"}
                  </Button>
                </Box>
              </Box>
            </DialogActions>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddSocietyDialog;
