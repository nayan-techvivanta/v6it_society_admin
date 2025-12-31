import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
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
  Autocomplete,
  Grid,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Devices as DeviceIcon,
  Tag,
  Memory,
  LocationOn,
  CalendarToday,
  Build,
  SignalCellularAlt,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const AddDeviceDialog = ({
  open,
  onClose,
  onSubmit,
  isEdit = false,
  deviceData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    deviceId: "",
    type: "",
    location: "",
    issueDate: new Date().toISOString().split("T")[0],
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Device types options
  const deviceTypes = [
    { value: "thermostat", label: "Thermostat", icon: "🌡️" },
    { value: "camera", label: "Security Camera", icon: "📹" },
    { value: "sensor", label: "Motion Sensor", icon: "📡" },
    { value: "lock", label: "Smart Lock", icon: "🔒" },
    { value: "detector", label: "Water Leak Detector", icon: "💧" },
    { value: "outlet", label: "Smart Plug", icon: "🔌" },
    { value: "light", label: "Smart Light", icon: "💡" },
    { value: "hub", label: "Smart Hub", icon: "🖥️" },
  ];

  // Status options
  const statusOptions = [
    { value: "active", label: "Active", color: "#008000" },
    { value: "inactive", label: "Inactive", color: "#A29EB6" },
  ];

  // Location options
  const locationOptions = [
    "Living Room",
    "Bedroom",
    "Kitchen",
    "Bathroom",
    "Front Door",
    "Back Door",
    "Basement",
    "Garage",
    "Office",
    "Hallway",
  ];

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEdit && deviceData) {
        setFormData({
          name: deviceData.name || "",
          deviceId: deviceData.id || "",
          type: deviceData.type?.toLowerCase() || "",
          location: deviceData.location || "",
          issueDate:
            deviceData.issueDate || new Date().toISOString().split("T")[0],
          status: deviceData.status || "active",
          description: "",
        });
      } else {
        // Generate initial device ID
        const prefix = "DEV";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const initialDeviceId = `${prefix}${randomNum}`;

        setFormData({
          name: "",
          deviceId: initialDeviceId,
          type: "",
          location: "",
          issueDate: new Date().toISOString().split("T")[0],
          status: "active",
          description: "",
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [open, deviceData, isEdit]);

  // Generate device ID from name
  const generateDeviceId = (name) => {
    if (!name.trim()) return "";

    // Create device ID: first 2 letters of each word + random 3 digits
    const words = name.split(" ");
    let prefix = "";

    if (words.length === 1) {
      prefix = words[0].substring(0, 2).toUpperCase();
    } else {
      prefix = words
        .map((word) => word.substring(0, 1))
        .join("")
        .toUpperCase();
    }

    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${prefix}${randomNum}`;
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Device name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Device name must be at least 2 characters";
    }

    if (!formData.deviceId.trim()) {
      newErrors.deviceId = "Device ID is required";
    } else if (!/^[A-Z]{2,4}\d{3,4}$/.test(formData.deviceId)) {
      newErrors.deviceId = "Device ID must be in format ABC123";
    }

    if (!formData.type) {
      newErrors.type = "Device type is required";
    }

    if (!formData.location) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const devicePayload = {
        ...formData,
        id: formData.deviceId,
        avatar: formData.name.substring(0, 2).toUpperCase(),
        lastSeen: "Just now",
      };

      onSubmit(devicePayload);
      toast.success(
        isEdit ? "Device updated successfully!" : "Device added successfully!"
      );
      onClose();
    } catch (error) {
      toast.error("Failed to save device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Generate device ID when name changes
    if (field === "name" && value.trim().length >= 2 && !isEdit) {
      const generatedId = generateDeviceId(value);
      setFormData((prev) => ({ ...prev, deviceId: generatedId }));
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
              <DeviceIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700">
                {isEdit ? "Edit Device" : "Add New Device"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, fontSize: "0.875rem" }}
              >
                {isEdit
                  ? "Update device details"
                  : "Configure your new smart device"}
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

            <Grid container spacing={3}>
              {/* Device Name */}
              <Grid item xs={12} md={6}>
                <Box>
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
                    Device Name
                  </Typography>

                  <TextField
                    fullWidth
                    value={formData.name}
                    onChange={handleFieldChange("name")}
                    error={!!errors.name && touched.name}
                    helperText={
                      (touched.name && errors.name) ||
                      "Enter a descriptive name for the device"
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Memory sx={{ color: "#A29EB6", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        height: 44,
                      },
                    }}
                    placeholder="e.g., Living Room Thermostat"
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Device ID */}
              <Grid item xs={12} md={6}>
                <Box>
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
                    Device ID
                  </Typography>

                  <TextField
                    fullWidth
                    value={formData.deviceId}
                    onChange={handleFieldChange("deviceId")}
                    error={!!errors.deviceId && touched.deviceId}
                    helperText={
                      (touched.deviceId && errors.deviceId) ||
                      "Auto-generated from device name"
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Tag sx={{ color: "#A29EB6", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        height: 44,
                      },
                    }}
                    placeholder="e.g., LR123"
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Device Type */}
              <Grid item xs={12} md={6}>
                <Box>
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
                    Device Type
                  </Typography>

                  <FormControl fullWidth error={!!errors.type} size="small">
                    <Select
                      value={formData.type}
                      onChange={handleFieldChange("type")}
                      displayEmpty
                      sx={{
                        borderRadius: 1.5,
                        height: 44,
                        backgroundColor: "white",
                        border: "1px solid",
                        borderColor: errors.type ? "#B31B1B" : "#E0E0E0",
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1.5,
                        },
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography
                              color="#A29EB6"
                              sx={{ fontStyle: "italic" }}
                            >
                              Select device type
                            </Typography>
                          );
                        }

                        const selectedType = deviceTypes.find(
                          (t) => t.value === selected
                        );
                        return (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography fontSize="1.25rem">
                              {selectedType?.icon}
                            </Typography>
                            <Typography fontWeight={500}>
                              {selectedType?.label}
                            </Typography>
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="#A29EB6">
                          Select device type
                        </Typography>
                      </MenuItem>

                      {deviceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography fontSize="1.25rem">
                              {type.icon}
                            </Typography>
                            <Box>
                              <Typography fontWeight={500}>
                                {type.label}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>

                    {errors.type && (
                      <Typography
                        variant="caption"
                        color="#B31B1B"
                        sx={{ mt: 0.5, ml: 1, display: "block" }}
                      >
                        {errors.type}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              </Grid>

              {/* Issue Date */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    component="label"
                    variant="caption"
                    fontWeight={600}
                    display="block"
                    mb={1}
                    color="#6F0B14"
                  >
                    Installation Date
                  </Typography>

                  <TextField
                    fullWidth
                    type="date"
                    value={formData.issueDate}
                    onChange={handleFieldChange("issueDate")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday
                            sx={{ color: "#A29EB6", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 1.5,
                        height: 44,
                      },
                    }}
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography
                    component="label"
                    variant="caption"
                    fontWeight={600}
                    display="block"
                    mb={1}
                    color="#6F0B14"
                  >
                    Status
                  </Typography>

                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.status}
                      onChange={handleFieldChange("status")}
                      sx={{
                        borderRadius: 1.5,
                        height: 44,
                        backgroundColor: "white",
                        border: "1px solid #E0E0E0",
                        "& .MuiSelect-select": {
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 1.5,
                        },
                      }}
                      renderValue={(selected) => {
                        const selectedStatus = statusOptions.find(
                          (s) => s.value === selected
                        );
                        return (
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: selectedStatus?.color,
                              }}
                            />
                            <Typography fontWeight={500}>
                              {selectedStatus?.label}
                            </Typography>
                          </Box>
                        );
                      }}
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor: status.color,
                              }}
                            />
                            <Typography>{status.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Preview Card */}
            </Grid>

            <DialogActions
              sx={{
                mt: 3,
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
                    disabled={isSubmitting || !isFormValid}
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
                      ? "Update Device"
                      : "Add Device"}
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

export default AddDeviceDialog;
