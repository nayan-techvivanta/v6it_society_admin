import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  alpha,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { supabase } from "../../api/supabaseClient";
import {
  Close,
  Business,
  Description,
  CheckCircle,
  Edit,
  Add,
  Domain,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const AddBuildingDialog = ({
  open,
  onClose,
  building,
  isEdit = false,
  societies = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    society_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (isEdit && building) {
      setFormData({
        name: building.name || "",
        // description: building.description || "",
        description:
          building.description || building.building_description || "",

        society_id: String(building.society_id || ""),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        society_id: "",
      });
    }
  }, [isEdit, building]);

  // Get selected society
  // const selectedSociety = societies.find((s) => s.id === formData.society_id);
  const selectedSociety = societies.find(
    (s) => String(s.id) === String(formData.society_id)
  );

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Building name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Building name must be at least 3 characters";
    }

    if (!formData.society_id) {
      newErrors.society_id = "Please select a society";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        society_id: formData.society_id,
      };

      if (isEdit && building?.id) {
        const { error } = await supabase
          .from("buildings")
          .update(payload)
          .eq("id", building.id);

        if (error) throw error;
        toast.success("Building updated successfully!");
      } else {
        const { error } = await supabase.from("buildings").insert([payload]);

        if (error) throw error;
        toast.success("Building added successfully!");
      }

      onClose(); // 🔥 parent list refresh karega
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save building");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Clear error when user types
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleClose = () => {
    if (!isSubmitting) {
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
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, #6F0B14 0%, ${alpha(
            "#6F0B14",
            0.9
          )} 100%)`,
          color: "white",
          py: 2,
          px: 3,
          position: "relative",
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 2,
                p: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
              }}
            >
              {isEdit ? (
                <Edit sx={{ fontSize: 22 }} />
              ) : (
                <Add sx={{ fontSize: 22 }} />
              )}
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{ letterSpacing: -0.5 }}
              >
                {isEdit ? "Edit Building" : "Add New Building"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, display: "block", mt: 0.5 }}
              >
                {isEdit
                  ? "Update the building information"
                  : "Add a new building to the system"}
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
              },
              transition: "all 0.2s ease",
              padding: 1,
            }}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Error Alert */}
          {Object.values(errors).some(Boolean) && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                mb: 3,
                backgroundColor: alpha("#B31B1B", 0.08),
                color: "#B31B1B",
                border: `1px solid ${alpha("#B31B1B", 0.2)}`,
                "& .MuiAlert-icon": { color: "#B31B1B" },
                py: 1,
              }}
              icon={false}
            >
              <Typography variant="body2" fontWeight="600">
                Please fix the errors below before submitting
              </Typography>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Society Selection */}
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  fontWeight="600"
                  display="block"
                  mb={1}
                  color="text.primary"
                  sx={{
                    "&::after": {
                      content: '"*"',
                      color: "#B31B1B",
                      marginLeft: 0.5,
                    },
                  }}
                >
                  Select Society
                </Typography>
                <FormControl fullWidth error={!!errors.society_id}>
                  <Select
                    value={formData.society_id}
                    onChange={handleFieldChange("society_id")}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      height: 44,
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.society_id ? "#B31B1B" : "#E0E0E0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.society_id ? "#B31B1B" : "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: 2,
                      },
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1.5,
                      },
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Domain sx={{ color: "#A29EB6", fontSize: 20 }} />
                            <Typography color="#A29EB6">
                              Select a society
                            </Typography>
                          </Box>
                        );
                      }

                      const society = societies.find(
                        (s) => String(s.id) === String(selected)
                      );

                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Domain sx={{ color: "#6F0B14", fontSize: 20 }} />
                          <Typography>
                            {society?.name || "Unknown Society"}
                          </Typography>
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="">
                      <Typography color="#A29EB6">Select a society</Typography>
                    </MenuItem>
                    {societies.map((society) => (
                      <MenuItem key={society.id} value={society.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Domain sx={{ color: "#6F0B14", fontSize: 20 }} />
                          <Typography>{society.name}</Typography>
                          {society.city && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: "auto" }}
                            >
                              {society.city}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.society_id && (
                    <Typography
                      variant="caption"
                      color="#B31B1B"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.society_id}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Building Name */}
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  fontWeight="600"
                  display="block"
                  mb={1}
                  color="text.primary"
                  sx={{
                    "&::after": {
                      content: '"*"',
                      color: "#B31B1B",
                      marginLeft: 0.5,
                    },
                  }}
                >
                  Building Name
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={handleFieldChange("name")}
                  error={!!errors.name && touched.name}
                  helperText={touched.name && errors.name}
                  placeholder="Enter building name"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ color: "#A29EB6", mr: 1 }}>
                        <Business sx={{ fontSize: 20 }} />
                      </Box>
                    ),
                    sx: {
                      borderRadius: 2,
                      height: 44,
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.name ? "#B31B1B" : "#E0E0E0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: errors.name ? "#B31B1B" : "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                {!errors.name && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Enter a unique name for the building
                  </Typography>
                )}
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  fontWeight="600"
                  display="block"
                  mb={1}
                  color="text.primary"
                >
                  Description (Optional)
                </Typography>
                <TextField
                  fullWidth
                  value={formData.description}
                  onChange={handleFieldChange("description")}
                  placeholder="Enter building description"
                  multiline
                  rows={3}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          color: "#A29EB6",
                          mr: 1,
                          mt: 1,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Description sx={{ fontSize: 20 }} />
                      </Box>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#E0E0E0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  Add any additional notes or details about the building
                </Typography>
              </Grid>

              {/* Selected Society Preview */}
              {selectedSociety && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      backgroundColor: alpha("#6F0B14", 0.05),
                      borderRadius: 2,
                      p: 2,
                      border: `1px solid ${alpha("#6F0B14", 0.1)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="600"
                      color="#6F0B14"
                      mb={1}
                      display="block"
                    >
                      Selected Society
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          backgroundColor: alpha("#6F0B14", 0.1),
                          borderRadius: 1,
                          p: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Typography
                          fontWeight={700}
                          color="#6F0B14"
                          fontSize="1rem"
                        >
                          {selectedSociety.name?.substring(0, 2).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography fontWeight={600} color="text.primary">
                          {selectedSociety.name}
                        </Typography>
                        {selectedSociety.city && selectedSociety.state && (
                          <Typography variant="caption" color="text.secondary">
                            {selectedSociety.city}, {selectedSociety.state}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Action Buttons */}
            <DialogActions
              sx={{
                mt: 4,
                px: 0,
                pb: 0,
                borderTop: `1px solid ${alpha("#6F0B14", 0.1)}`,
                pt: 2,
              }}
            >
              <Box display="flex" justifyContent="space-between" width="100%">
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                  >
                    * Required fields
                  </Typography>
                </Box>

                <Box display="flex" gap={1.5}>
                  <Button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3.5,
                      py: 1,
                      fontWeight: 600,
                      color: "#6F0B14",
                      border: `1.5px solid ${alpha("#6F0B14", 0.3)}`,
                      backgroundColor: alpha("#6F0B14", 0.05),
                      "&:hover": {
                        backgroundColor: alpha("#6F0B14", 0.1),
                        borderColor: alpha("#6F0B14", 0.5),
                      },
                      fontSize: "0.875rem",
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 4,
                      py: 1,
                      fontWeight: 600,
                      backgroundColor: "#6F0B14",
                      "&:hover": {
                        backgroundColor: "#5A0911",
                        boxShadow: `0 6px 16px ${alpha("#6F0B14", 0.3)}`,
                      },
                      "&.Mui-disabled": {
                        backgroundColor: alpha("#6F0B14", 0.3),
                        color: alpha("#000000", 0.26),
                      },
                      fontSize: "0.875rem",
                      minWidth: 120,
                    }}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <CheckCircle sx={{ fontSize: 18 }} />
                      )
                    }
                  >
                    {isSubmitting
                      ? "Processing..."
                      : isEdit
                      ? "Update"
                      : "Create"}
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

export default AddBuildingDialog;
