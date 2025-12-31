import React, { useState, useEffect, useCallback } from "react";
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
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  FormHelperText,
  Paper,
  Card,
  CardContent,
  alpha,
} from "@mui/material";
import {
  Close,
  Business,
  Home,
  Group,
  Security,
  LocationOn,
  Public,
  Map,
  Apartment,
  Person,
  Lock,
  CheckCircle,
  Edit,
  Add,
  Domain,
  MeetingRoom,
  CalendarToday,
  Description,
  Phone,
  Email,
  CorporateFare,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { styled } from "@mui/material/styles";

// Custom styled components using your theme colors
const SectionCard = styled(Card)(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  overflow: "visible",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    success: "#008000",
    pending: "#DBA400",
    reschedule: "#E86100",
    reject: "#B31B1B",
  };

  return {
    backgroundColor: alpha(
      statusColors[status] || theme.palette.primary.main,
      0.1
    ),
    color: statusColors[status] || theme.palette.primary.main,
    fontWeight: 600,
    fontSize: "0.75rem",
    border: `1px solid ${alpha(
      statusColors[status] || theme.palette.primary.main,
      0.3
    )}`,
    borderRadius: 8,
  };
});

const buildingTypes = [
  {
    value: "commercial",
    label: "Commercial Building",
    icon: <Business />,
    color: "#6F0B14",
  },
  {
    value: "residential",
    label: "Residential Building",
    icon: <Home />,
    color: "#8B0000",
  },
  {
    value: "mixed",
    label: "Commercial + Residential",
    icon: <Apartment />,
    color: "#A52A2A",
  },
];

const occupancyLevels = [
  { label: "Low (1-50)", value: "low", color: "#008000" },
  { label: "Medium (51-200)", value: "medium", color: "#DBA400" },
  { label: "High (201-500)", value: "high", color: "#E86100" },
  { label: "Very High (500+)", value: "very-high", color: "#B31B1B" },
];

const AddBuildingDialog = ({
  open,
  onClose,
  onSubmit,
  building,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    type: "",
    name: "",
    numUsers: "",
    numSecurity: "",
    businessName: "",
    password: "",
    confirmPassword: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    occupancyLevel: "",
    description: "",
    floors: "",
    yearBuilt: new Date().getFullYear(),
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (open) {
      if (isEdit && building) {
        setFormData({
          id: building.id || "",
          type: building.type || "",
          name: building.name || "",
          numUsers: building.numUsers || "",
          numSecurity: building.numSecurity || "",
          businessName: building.businessName || "",
          password: building.password || "",
          confirmPassword: building.password || "",
          address: building.address || "",
          country: building.country || "",
          state: building.state || "",
          city: building.city || "",
          postalCode: building.postalCode || "",
          occupancyLevel: building.occupancyLevel || "",
          description: building.description || "",
          floors: building.floors || "",
          yearBuilt: building.yearBuilt || new Date().getFullYear(),
          contactPerson: building.contactPerson || "",
          contactEmail: building.contactEmail || "",
          contactPhone: building.contactPhone || "",
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [open, building, isEdit]);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.id.trim()) newErrors.id = "Building ID is required";
    if (!formData.type) newErrors.type = "Building type is required";
    if (!formData.name.trim()) newErrors.name = "Building name is required";
    if (!formData.numUsers || formData.numUsers < 0)
      newErrors.numUsers = "Number of users must be 0 or more";
    if (!formData.numSecurity || formData.numSecurity < 0)
      newErrors.numSecurity = "Number of security personnel must be 0 or more";
    if (!formData.occupancyLevel)
      newErrors.occupancyLevel = "Occupancy level is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.contactPerson.trim())
      newErrors.contactPerson = "Contact person is required";
    if (!formData.contactEmail.trim())
      newErrors.contactEmail = "Contact email is required";
    if (!formData.contactPhone.trim())
      newErrors.contactPhone = "Contact phone is required";

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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onSubmit(formData);
      toast.success(
        isEdit
          ? "Building updated successfully!"
          : "Building added successfully!"
      );
      onClose();
    } catch (error) {
      toast.error("Failed to save building");
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
      setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    []
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
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          maxHeight: "90vh",
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
          position: "sticky",
          top: 0,
          zIndex: 1,
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
              {isEdit ? (
                <Edit sx={{ fontSize: 20 }} />
              ) : (
                <Add sx={{ fontSize: 20 }} />
              )}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700">
                {isEdit ? "Edit Building" : "Add New Building"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, fontSize: "0.875rem" }}
              >
                {isEdit
                  ? "Update building details"
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
        {/* Error Alert */}
        {Object.values(errors).some(Boolean) && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                mb: 2,
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
          </Box>
        )}

        <Box sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information Section */}
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <Business sx={{ color: "#6F0B14" }} />
                      <Typography variant="h6" fontWeight="600" color="#6F0B14">
                        Basic Information
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Building ID *"
                          value={formData.id}
                          onChange={handleFieldChange("id")}
                          error={!!errors.id && touched.id}
                          helperText={touched.id && errors.id}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Domain
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="BLDG-001"
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl
                          fullWidth
                          error={!!errors.type}
                          size="small"
                        >
                          {/* Custom label styling */}

                          <Select
                            value={formData.type}
                            onChange={handleFieldChange("type")}
                            displayEmpty
                            sx={{
                              borderRadius: 1.5,
                              height: 40,
                              backgroundColor: "white",
                              borderColor: errors.type
                                ? "error.main"
                                : "divider",
                              "&:hover": {
                                borderColor: errors.type
                                  ? "error.main"
                                  : "primary.main",
                              },
                              "& .MuiSelect-select": {
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                py: 1.25,
                                minHeight: "auto",
                              },
                              "&.Mui-focused": {
                                borderColor: "#6F0B14",
                                boxShadow: "0 0 0 2px rgba(111, 11, 20, 0.1)",
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  borderRadius: 1.5,
                                  marginTop: 0.5,
                                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                                  "& .MuiMenuItem-root": {
                                    py: 1.25,
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(111, 11, 20, 0.08)",
                                    },
                                    "&.Mui-selected": {
                                      backgroundColor:
                                        "rgba(111, 11, 20, 0.12)",
                                      "&:hover": {
                                        backgroundColor:
                                          "rgba(111, 11, 20, 0.16)",
                                      },
                                    },
                                  },
                                },
                              },
                            }}
                            renderValue={(selected) => {
                              if (!selected) {
                                return (
                                  <Typography
                                    color="text.secondary"
                                    sx={{ opacity: 0.7 }}
                                  >
                                    Select building type
                                  </Typography>
                                );
                              }

                              const selectedType = buildingTypes.find(
                                (type) => type.value === selected
                              );

                              return (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1.5}
                                >
                                  <Box
                                    sx={{
                                      color: "#6F0B14",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 24,
                                      height: 24,
                                    }}
                                  >
                                    {selectedType?.icon}
                                  </Box>
                                  <Typography
                                    fontWeight={500}
                                    color="text.primary"
                                  >
                                    {selectedType?.label}
                                  </Typography>
                                </Box>
                              );
                            }}
                          >
                            <MenuItem value="" disabled>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                                sx={{ opacity: 0.7 }}
                              >
                                <Business
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                                <Typography color="text.secondary">
                                  Select building type
                                </Typography>
                              </Box>
                            </MenuItem>

                            {buildingTypes.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1.5}
                                >
                                  <Box
                                    sx={{
                                      color: "#6F0B14",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 24,
                                      height: 24,
                                    }}
                                  >
                                    {type.icon}
                                  </Box>
                                  <Box>
                                    <Typography
                                      fontWeight={500}
                                      color="text.primary"
                                    >
                                      {type.label}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {type.value === "commercial" &&
                                        "Office spaces, malls, shops"}
                                      {type.value === "residential" &&
                                        "Apartments, houses, condos"}
                                      {type.value === "mixed" &&
                                        "Combined commercial & residential"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>

                          {errors.type && (
                            <FormHelperText
                              sx={{
                                marginLeft: 0,
                                color: "#B31B1B",
                                fontSize: "0.75rem",
                                mt: 0.5,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="#B31B1B"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                              </svg>
                              {errors.type}
                            </FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Building Name *"
                          value={formData.name}
                          onChange={handleFieldChange("name")}
                          error={!!errors.name && touched.name}
                          helperText={touched.name && errors.name}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="Corporate Headquarters"
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Total Floors"
                          type="number"
                          value={formData.floors}
                          onChange={handleFieldChange("floors")}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MeetingRoom
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Year Built"
                          type="number"
                          value={formData.yearBuilt}
                          onChange={handleFieldChange("yearBuilt")}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </SectionCard>
              </Grid>

              {/* Occupancy & Business Section */}
              <Grid item xs={12} md={6}>
                <SectionCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <Group sx={{ color: "#6F0B14" }} />
                      <Typography variant="h6" fontWeight="600" color="#6F0B14">
                        Occupancy & Business
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Number of Users *"
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          value={formData.numUsers}
                          onChange={handleFieldChange("numUsers")}
                          error={!!errors.numUsers && touched.numUsers}
                          helperText={touched.numUsers && errors.numUsers}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Security Personnel *"
                          type="number"
                          inputProps={{ min: 0, step: 1 }}
                          value={formData.numSecurity}
                          onChange={handleFieldChange("numSecurity")}
                          error={!!errors.numSecurity && touched.numSecurity}
                          helperText={touched.numSecurity && errors.numSecurity}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Security
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Business Name *"
                          value={formData.businessName}
                          onChange={handleFieldChange("businessName")}
                          error={!!errors.businessName && touched.businessName}
                          helperText={
                            touched.businessName && errors.businessName
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CorporateFare
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="Legal business name"
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Password *"
                          type="password"
                          value={formData.password}
                          onChange={handleFieldChange("password")}
                          error={!!errors.password && touched.password}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Lock
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Confirm Password *"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleFieldChange("confirmPassword")}
                          error={
                            !!errors.confirmPassword && touched.confirmPassword
                          }
                          helperText={
                            touched.confirmPassword && errors.confirmPassword
                          }
                          InputProps={{
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </SectionCard>
              </Grid>

              {/* Location Information Section */}
              <Grid item xs={12}>
                <SectionCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <LocationOn sx={{ color: "#6F0B14" }} />
                      <Typography variant="h6" fontWeight="600" color="#6F0B14">
                        Location Information
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Full Address *"
                          value={formData.address}
                          onChange={handleFieldChange("address")}
                          error={!!errors.address && touched.address}
                          helperText={touched.address && errors.address}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="Street address, building number, etc."
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Country *"
                          value={formData.country}
                          onChange={handleFieldChange("country")}
                          error={!!errors.country && touched.country}
                          helperText={touched.country && errors.country}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Public
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="State/Province *"
                          value={formData.state}
                          onChange={handleFieldChange("state")}
                          error={!!errors.state && touched.state}
                          helperText={touched.state && errors.state}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Map
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="City *"
                          value={formData.city}
                          onChange={handleFieldChange("city")}
                          error={!!errors.city && touched.city}
                          helperText={touched.city && errors.city}
                          sx={{ borderRadius: 1.5 }}
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Postal Code"
                          value={formData.postalCode}
                          onChange={handleFieldChange("postalCode")}
                          sx={{ borderRadius: 1.5 }}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </SectionCard>
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12}>
                <SectionCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={3}>
                      <Person sx={{ color: "#6F0B14" }} />
                      <Typography variant="h6" fontWeight="600" color="#6F0B14">
                        Contact Information
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Contact Person *"
                          value={formData.contactPerson}
                          onChange={handleFieldChange("contactPerson")}
                          error={
                            !!errors.contactPerson && touched.contactPerson
                          }
                          helperText={
                            touched.contactPerson && errors.contactPerson
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="John Doe"
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Contact Email *"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleFieldChange("contactEmail")}
                          error={!!errors.contactEmail && touched.contactEmail}
                          helperText={
                            touched.contactEmail && errors.contactEmail
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="john@example.com"
                          size="small"
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Contact Phone *"
                          value={formData.contactPhone}
                          onChange={handleFieldChange("contactPhone")}
                          error={!!errors.contactPhone && touched.contactPhone}
                          helperText={
                            touched.contactPhone && errors.contactPhone
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone
                                  sx={{ color: "text.secondary", fontSize: 20 }}
                                />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 1.5 },
                          }}
                          placeholder="+1 (555) 123-4567"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </SectionCard>
              </Grid>
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
                  <Typography variant="caption" color="text.secondary">
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
                      ? "Update Building"
                      : "Create Building"}
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
