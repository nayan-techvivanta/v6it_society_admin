import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Alert,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import {
  Close,
  Person,
  Email,
  Phone,
  Lock,
  LocationOn,
  CalendarToday,
  Key,
  WhatsApp,
} from "@mui/icons-material";
import {
  FaUserTie,
  FaBuilding,
  FaCity,
  FaGlobeAmericas,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

// Styled Components
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    transition: "all 0.3s ease",
    backgroundColor: "#f8fafc",

    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #f8fafc inset",
      WebkitTextFillColor: "#0f172a",
      borderRadius: "12px",
      transition: "background-color 9999s ease-in-out 0s",
    },

    "& textarea:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #f8fafc inset",
      WebkitTextFillColor: "#0f172a",
    },

    "&:hover": {
      backgroundColor: "#f1f5f9",
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      boxShadow: "0 0 0 3px rgba(139, 0, 0, 0.1)",
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: "12px",
  backgroundColor: "#f8fafc",

  "& .MuiSelect-select:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 1000px #f8fafc inset",
    WebkitTextFillColor: "#0f172a",
  },

  "&:hover": {
    backgroundColor: "#f1f5f9",
  },
  "&.Mui-focused": {
    backgroundColor: "#ffffff",
    boxShadow: "0 0 0 3px rgba(139, 0, 0, 0.1)",
  },
}));

const countries = ["USA", "India", "Canada", "UK", "Australia"];
const states = [
  "NY",
  "CA",
  "IL",
  "FL",
  "WA",
  "Gujarat",
  "Maharashtra",
  "Delhi",
];

const AddManagerDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  manager = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    registerDate: new Date().toISOString().split("T")[0],
    id: "",
    name: "",
    email: "",
    address: "",
    contact: "",
    whatsapp: "",
    password: "",
    secretKey: "",
    country: "",
    state: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // useEffect(() => {
  //   if (!open) {
  //     setFormData({
  //       registerDate: new Date().toISOString().split("T")[0],
  //       id: "",
  //       name: "",
  //       email: "",
  //       address: "",
  //       contact: "",
  //       whatsapp: "",
  //       password: "",
  //       secretKey: "",
  //       country: "",
  //       state: "",
  //       city: "",
  //     });
  //     setErrors({});
  //     setSubmitError("");
  //   }
  // }, [open]);
  useEffect(() => {
    if (!open) {
      // Dialog band hone par reset
      setFormData({
        registerDate: new Date().toISOString().split("T")[0],
        id: "",
        name: "",
        email: "",
        address: "",
        contact: "",
        whatsapp: "",
        password: "",
        secretKey: "",
        country: "",
        state: "",
        city: "",
      });
      setErrors({});
      setSubmitError("");
      return;
    }

    // EDIT MODE - Existing manager data populate karo
    if (isEdit && manager) {
      setFormData({
        id: manager.id?.toString() || "", // ✅ Safe
        name: manager.name || "",
        email: manager.email || "",
        registerDate:
          manager.registerDate || new Date().toISOString().split("T")[0],
        city: manager.address?.city || "",
        state: manager.address?.state || "",
        country: manager.address?.country || "",
        contact: manager.address?.contact || "",
        whatsapp: manager.address?.whatsapp || "",
        address: manager.address || "",
        password: "",
        secretKey: "",
      });
    }
  }, [open, manager, isEdit]);

  const validateForm = () => {
    const newErrors = {};
    // if (!formData.id) newErrors.id = "ID is required";
    if (!isEdit && !formData.id) newErrors.id = "ID is required";

    // if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.contact.trim())
      newErrors.contact = "Contact number is required";
    else if (!/^\+?\d{10,15}$/.test(formData.contact.replace(/\s/g, "")))
      newErrors.contact = "Invalid contact number";
    // if (!formData.password.trim()) newErrors.password = "Password is required";
    // else if (formData.password.length < 6)
    //   newErrors.password = "Password must be at least 6 characters";
    if (!isEdit) {
      if (!formData.password.trim())
        newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.city.trim()) newErrors.city = "City is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = (e) => {

  //   e.preventDefault();
  //   if (!validateForm()) return;
  //   const newManager = {
  //     id: parseInt(formData.id),
  //     registerDate: formData.registerDate,
  //     name: formData.name.trim(),
  //     email: formData.email.trim(),
  //     assignedBuildings: Math.floor(Math.random() * 10) + 1,
  //     status: "pending",
  //     address: {
  //       city: formData.city.trim(),
  //       state: formData.state,
  //       country: formData.country,
  //       contact: formData.contact.trim(),
  //       whatsapp: formData.whatsapp.trim() || formData.contact.trim(),
  //     },
  //     avatar: formData.name.trim().substring(0, 2).toUpperCase(),
  //   };
  //   onSubmit(newManager);
  // };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const managerData = {
      id: parseInt(formData.id),
      registerDate: formData.registerDate,
      name: formData.name.trim(),
      email: formData.email.trim(),
      assignedBuildings: isEdit
        ? manager.assignedBuildings
        : Math.floor(Math.random() * 10) + 1,
      status: isEdit ? manager.status : "pending",
      address: {
        city: formData.city.trim(),
        state: formData.state,
        country: formData.country,
        contact: formData.contact.trim(),
        whatsapp: formData.whatsapp.trim() || formData.contact.trim(),
      },
      avatar: formData.name.trim().substring(0, 2).toUpperCase(),
    };
    onSubmit(managerData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
          borderRadius: "20px",
          overflow: "hidden",
          background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
        },
      }}
    >
      {/* Header with Gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #8b0000 0%, #a00000 100%)",
          padding: "24px 32px",
          color: "white",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaUserTie size={24} />
            </Box>
            <Box>
              {/* <Typography
                variant="h5"
                sx={{ fontWeight: "bold", fontFamily: "'Roboto', sans-serif" }}
              >
                Add New Manager
              </Typography>
              <Typography
                sx={{
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                Complete the form below to register a new property manager
              </Typography> */}
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", fontFamily: "'Roboto', sans-serif" }}
              >
                {isEdit ? "Edit Manager" : "Add New Manager"}
              </Typography>
              <Typography
                sx={{
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                {isEdit
                  ? "Update manager details below"
                  : "Complete the form below to register a new property manager"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: "white",
              background: "rgba(255, 255, 255, 0.1)",
              "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ padding: "32px" }}>
          {submitError && (
            <Alert
              severity="error"
              sx={{
                borderRadius: "12px",
                marginBottom: "24px",
                fontFamily: "'Roboto', sans-serif",
              }}
            >
              {submitError}
            </Alert>
          )}

          {/* Two Column Layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { md: "1fr 1fr" },
              gap: "24px",
            }}
          >
            {/* Left Column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <FaUserTie
                  style={{
                    marginRight: "8px",
                    display: "inline-block",
                    color: "#8b0000",
                  }}
                />
                Personal Information
              </Typography>

              <StyledTextField
                fullWidth
                placeholder="Manager ID"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                error={!!errors.id}
                helperText={errors.id}
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                placeholder="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                placeholder="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
                fullWidth
                placeholder="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <StyledTextField
                fullWidth
                placeholder="Secret Key"
                name="secretKey"
                value={formData.secretKey}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Right Column */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                <FaMapMarkerAlt
                  style={{
                    marginRight: "8px",
                    display: "inline-block",
                    color: "#8b0000",
                  }}
                />
                Location & Security
              </Typography>

              <StyledTextField
                fullWidth
                placeholder="Registration Date"
                name="registerDate"
                type="date"
                value={formData.registerDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                placeholder="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn sx={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                fullWidth
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={!!errors.city}
                helperText={errors.city}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaCity style={{ color: "#8b0000" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <FormControl fullWidth>
                  <StyledSelect
                    name="country"
                    value={formData.country || ""}
                    onChange={handleInputChange}
                    displayEmpty
                    startAdornment={
                      <InputAdornment position="start">
                        <FaGlobeAmericas
                          style={{ color: "#8b0000", marginRight: "8px" }}
                        />
                      </InputAdornment>
                    }
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <span className="text-gray-400">Select Country</span>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      Select Country
                    </MenuItem>

                    {countries.map((country) => (
                      <MenuItem key={country} value={country}>
                        {country}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel shrink={false}>
                    {!formData.state && "State"}
                  </InputLabel>

                  <StyledSelect
                    name="state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    displayEmpty
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <span className="text-gray-400">State</span>
                      )
                    }
                  >
                    <MenuItem value="" disabled>
                      State
                    </MenuItem>

                    {states.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <StyledTextField
                  placeholder="Contact Number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  error={!!errors.contact}
                  helperText={errors.contact}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: "#8b0000" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  placeholder="WhatsApp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WhatsApp sx={{ color: "#8b0000" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Info Box */}
          <Paper
            elevation={0}
            sx={{
              marginTop: "24px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#f0f7ff",
              borderLeft: "4px solid #8b0000",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <FaBuilding style={{ color: "#8b0000", fontSize: "20px" }} />
              <Typography
                variant="body2"
                sx={{ fontFamily: "'Roboto', sans-serif", color: "#475569" }}
              >
                <strong>Note:</strong> The manager will be assigned buildings
                automatically. You can modify assignments later from the
                manager's profile.
              </Typography>
            </Box>
          </Paper>
        </DialogContent>

        <Divider />

        {/* Footer Actions */}
        <DialogActions
          sx={{ padding: "24px 32px", backgroundColor: "#f8fafc" }}
        >
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{
              padding: "10px 28px",
              borderRadius: "10px",
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 500,
              borderColor: "#cbd5e1",
              color: "#475569",
              "&:hover": {
                borderColor: "#94a3b8",
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            Cancel
          </Button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 36px",
              background: "linear-gradient(135deg, #8b0000 0%, #a00000 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "bold",
              fontSize: "0.9375rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(139, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <FaUserTie />
            {loading
              ? isEdit
                ? "Updating..."
                : "Adding Manager..."
              : isEdit
              ? "Update Manager"
              : "Add Manager"}
          </motion.button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddManagerDialog;
