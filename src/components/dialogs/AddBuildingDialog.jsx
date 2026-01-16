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
  Chip,
  InputAdornment,
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
  Home,
  BusinessCenter,
  FamilyRestroom,
  MeetingRoom,
} from "@mui/icons-material";
import { toast } from "react-toastify";

// Building Type Options
const BUILDING_TYPES = [
  {
    value: "residential",
    label: "Residential",
    icon: <Home fontSize="small" />,
    color: "#1976d2",
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: <BusinessCenter fontSize="small" />,
    color: "#ed6c02",
  },
  {
    value: "mixed",
    label: "Mixed Use",
    icon: <FamilyRestroom fontSize="small" />,
    color: "#2e7d32",
  },
  {
    value: "other",
    label: "Other",
    icon: <Business fontSize="small" />,
    color: "#9c27b0",
  },
];

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
    building_type: "residential",
    flat_limit: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false); // Add this state

  useEffect(() => {
    if (isEdit && building) {
      setFormData({
        name: building.name || "",
        description: building.description || "",
        society_id: String(building.society_id || ""),
        building_type: building.building_type || "residential",
        flat_limit: building.flat_limit || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        society_id: "",
        building_type: "residential",
        flat_limit: "",
      });
    }
    setSubmitAttempted(false);
    setTouched({});
  }, [isEdit, building, open]);

  const selectedSociety = societies.find(
    (s) => String(s.id) === String(formData.society_id)
  );
  const selectedBuildingType = BUILDING_TYPES.find(
    (type) => type.value === formData.building_type
  );

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Building name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "name must be at least 3 characters";
    }

    if (!formData.society_id) {
      newErrors.society_id = "Please select a society";
    }

    // Flat limit validation
    if (!formData.flat_limit) {
      newErrors.flat_limit = "Flat limit is required";
    } else if (parseInt(formData.flat_limit) <= 0) {
      newErrors.flat_limit = "Flat limit must be greater than 0";
    } else if (parseInt(formData.flat_limit) > 1000) {
      newErrors.flat_limit = "Flat limit cannot exceed 1000";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitAttempted(true); // Mark that submit was attempted

    // Check if any field has been touched (for edit mode)
    const hasInteracted = Object.keys(touched).length > 0;
    const shouldShowErrors = submitAttempted || hasInteracted;

    if (!isFormValid && shouldShowErrors) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    // If no interaction yet and form is invalid, mark all required fields as touched
    if (!isFormValid && !shouldShowErrors) {
      const requiredFields = ["name", "society_id", "flat_limit"];
      const newTouched = {};
      requiredFields.forEach((field) => {
        newTouched[field] = true;
      });
      setTouched(newTouched);
      setSubmitAttempted(true);
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isFormValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        society_id: formData.society_id,
        building_type: formData.building_type,
        flat_limit: parseInt(formData.flat_limit),
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

      onClose();
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

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleNumberInput = (field) => (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubmitAttempted(false); // Reset submit attempt on close
      onClose();
    }
  };

  // Check if we should show the error alert
  const showErrorAlert = submitAttempted && Object.values(errors).some(Boolean);

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
          {/* Error Alert - Only show when submit was attempted AND there are errors */}
          {showErrorAlert && (
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
                <FormControl
                  fullWidth
                  error={
                    !!errors.society_id &&
                    (touched.society_id || submitAttempted)
                  }
                >
                  <Select
                    value={formData.society_id}
                    onChange={handleFieldChange("society_id")}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      height: 44,
                      backgroundColor: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor:
                          (touched.society_id || submitAttempted) &&
                          errors.society_id
                            ? "#B31B1B"
                            : "#E0E0E0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor:
                          (touched.society_id || submitAttempted) &&
                          errors.society_id
                            ? "#B31B1B"
                            : "#6F0B14",
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
                  {(touched.society_id || submitAttempted) &&
                    errors.society_id && (
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
                  error={!!errors.name && (touched.name || submitAttempted)}
                  helperText={(touched.name || submitAttempted) && errors.name}
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
                        borderColor:
                          (touched.name || submitAttempted) && errors.name
                            ? "#B31B1B"
                            : "#E0E0E0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor:
                          (touched.name || submitAttempted) && errors.name
                            ? "#B31B1B"
                            : "#6F0B14",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#6F0B14",
                        borderWidth: 2,
                      },
                    },
                  }}
                />
                {/* {!errors.name && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    Enter a unique name for the building
                  </Typography>
                )} */}
              </Grid>

              {/* Building Type */}
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
                  Building Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={formData.building_type}
                    onChange={handleFieldChange("building_type")}
                    sx={{
                      borderRadius: 2,
                      height: 44,
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
                      "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1.5,
                      },
                    }}
                    renderValue={(selected) => {
                      const type = BUILDING_TYPES.find(
                        (t) => t.value === selected
                      );
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ color: type?.color }}>{type?.icon}</Box>
                          <Typography>{type?.label}</Typography>
                        </Box>
                      );
                    }}
                  >
                    {BUILDING_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          width="100%"
                        >
                          <Box sx={{ color: type.color }}>{type.icon}</Box>
                          <Box flex={1}>
                            <Typography fontWeight={600}>
                              {type.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Flat Limit */}
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box
                    sx={{
                      backgroundColor: alpha("#6F0B14", 0.05),
                      borderRadius: 2,
                      p: 3,
                      border: `1px solid ${alpha("#6F0B14", 0.1)}`,
                      width: "100%",
                      maxWidth: 600,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="#6F0B14"
                      mb={2}
                      display="block"
                      textAlign="center"
                    >
                      Flat/Unit Configuration
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
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
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            Total Flat/Unit Limit
                          </Typography>
                          <TextField
                            value={formData.flat_limit}
                            onChange={handleNumberInput("flat_limit")}
                            error={
                              !!errors.flat_limit &&
                              (touched.flat_limit || submitAttempted)
                            }
                            helperText={
                              (touched.flat_limit || submitAttempted) &&
                              errors.flat_limit
                            }
                            placeholder="e.g., 100"
                            variant="outlined"
                            size="small"
                            sx={{
                              width: "100%",
                              maxWidth: 400,
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MeetingRoom
                                    sx={{
                                      color:
                                        (touched.flat_limit ||
                                          submitAttempted) &&
                                        errors.flat_limit
                                          ? "#B31B1B"
                                          : "#6F0B14",
                                      fontSize: 20,
                                    }}
                                  />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Typography
                                    variant="caption"
                                    color={
                                      (touched.flat_limit || submitAttempted) &&
                                      errors.flat_limit
                                        ? "#B31B1B"
                                        : "text.secondary"
                                    }
                                  >
                                    flats/units
                                  </Typography>
                                </InputAdornment>
                              ),
                              inputProps: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                min: 1,
                                max: 1000,
                              },
                              sx: {
                                borderRadius: 2,
                                height: 44,
                                backgroundColor: "white",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor:
                                    (touched.flat_limit || submitAttempted) &&
                                    errors.flat_limit
                                      ? "#B31B1B"
                                      : "#E0E0E0",
                                  borderWidth: 1,
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor:
                                    (touched.flat_limit || submitAttempted) &&
                                    errors.flat_limit
                                      ? "#B31B1B"
                                      : "#6F0B14",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#6F0B14",
                                    borderWidth: 2,
                                  },
                              },
                            }}
                          />
                          {!errors.flat_limit && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                display: "block",
                                textAlign: "center",
                                maxWidth: 400,
                                width: "100%",
                              }}
                            >
                              Maximum number of flats/units allowed in this
                              building
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Building Type Summary */}
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: `1px dashed ${alpha("#6F0B14", 0.1)}`,
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        <strong>Building Type:</strong>{" "}
                        {selectedBuildingType?.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          maxWidth: 500,
                          margin: "0 auto",
                        }}
                      >
                        {selectedBuildingType?.description}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  sx={{
                    backgroundColor: alpha("#6F0B14", 0.05),
                    borderRadius: 2,
                    p: 3,
                    border: `1px solid ${alpha("#6F0B14", 0.1)}`,
                    width: "100%",
                    maxWidth: 600,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    color="#6F0B14"
                    mb={2}
                    display="block"
                    sx={{
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    Description (Optional)
                  </Typography>
                  <TextField
                    value={formData.description}
                    onChange={handleFieldChange("description")}
                    placeholder="Enter building description"
                    multiline
                    rows={3}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: "100%",
                      maxWidth: 600,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Description
                            sx={{
                              color: "#6F0B14",
                              fontSize: 20,
                              mt: 0.5,
                            }}
                          />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#E0E0E0",
                          borderWidth: 1,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#6F0B14",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#6F0B14",
                          borderWidth: 2,
                        },
                        "& .MuiInputBase-inputMultiline": {
                          paddingTop: 1.5,
                          paddingBottom: 1.5,
                        },
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: "block",
                      textAlign: "center",
                      maxWidth: 600,
                      width: "100%",
                    }}
                  >
                    Add any additional notes or details about the building
                  </Typography>
                </Box>
              </Grid>
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
                    disabled={isSubmitting}
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
