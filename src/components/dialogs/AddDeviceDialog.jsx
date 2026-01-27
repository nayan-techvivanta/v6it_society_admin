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
  Grid,
  Autocomplete,
  Chip,
} from "@mui/material";
import { BsDoorOpenFill } from "react-icons/bs";
import {
  Close,
  CheckCircle,
  Devices as DeviceIcon,
  Tag,
  Memory,
  CalendarToday,
  Business,
  Apartment,
  QrCode,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { supabase } from "../../api/supabaseClient";

const AddDeviceDialog = ({
  open,
  onClose,
  onSubmit,
  isEdit = false,
  deviceData,
}) => {
  const [formData, setFormData] = useState({
    device_serial_number: "",
    society_id: "",
    building_id: "",
    flat_id: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // New state for dropdowns
  const [societies, setSocieties] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [flats, setFlats] = useState([]);
  const [filteredFlats, setFilteredFlats] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(false);

  // Status options
  const statusOptions = [
    { value: "active", label: "Active", color: "#008000" },
    { value: "inactive", label: "Inactive", color: "#A29EB6" },
    { value: "warning", label: "Warning", color: "#DBA400" },
    { value: "offline", label: "Offline", color: "#ff0000" },
  ];

  // Fetch societies on mount
  useEffect(() => {
    if (open) {
      fetchSocieties();
    }
  }, [open]);

  useEffect(() => {
    if (formData.society_id) {
      fetchBuildings(formData.society_id);
    } else {
      setBuildings([]);
      setFilteredBuildings([]);
    }
  }, [formData.society_id]);

  useEffect(() => {
    if (open) {
      if (isEdit && deviceData) {
        setFormData({
          device_serial_number: deviceData.device_serial_number || "",
          society_id: Number(deviceData.society_id) || "",
          building_id: Number(deviceData.building_id) || "",
          flat_id: Number(deviceData.flat_id) || "",
          issue_date:
            deviceData.issue_date || new Date().toISOString().split("T")[0],
          status: deviceData.status || "active",
        });

        if (deviceData.society_id) {
          fetchBuildings(Number(deviceData.society_id));
        }

        if (deviceData.building_id) {
          fetchFlats(Number(deviceData.building_id));
        }
      } else {
        setFormData({
          device_serial_number: "",
          society_id: "",
          building_id: "",
          flat_id: "",
          issue_date: new Date().toISOString().split("T")[0],
          status: "active",
        });
      }
    }
  }, [open, isEdit, deviceData]);

  const fetchSocieties = async () => {
    try {
      setLoadingSocieties(true);
      const { data, error } = await supabase
        .from("societies")
        .select("id, name, address")
        .order("name");

      if (error) throw error;
      setSocieties(data || []);
    } catch (error) {
      console.error("Error fetching societies:", error);
      toast.error("Failed to load societies");
      setSocieties([]);
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchBuildings = async (societyId) => {
    try {
      setLoadingBuildings(true);

      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, flat_limit, building_type")
        .eq("society_id", societyId)
        .eq("is_delete", false)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      setBuildings(data || []);
      setFilteredBuildings(data || []);
    } catch (error) {
      console.error("Fetch buildings error:", error);
      toast.error("Failed to load buildings");
      setBuildings([]);
      setFilteredBuildings([]);
    } finally {
      setLoadingBuildings(false);
    }
  };
  const fetchFlats = async (buildingId) => {
    try {
      setLoadingFlats(true);

      const { data, error } = await supabase
        .from("flats")
        .select("id, flat_number, floor_number, bhk_type")
        .eq("building_id", buildingId)
        .eq("is_delete", false)
        .eq("is_active", true)
        .order("flat_number");

      if (error) throw error;

      setFlats(data || []);
      setFilteredFlats(data || []);
    } catch (error) {
      console.error("Fetch flats error:", error);
      toast.error("Failed to load flats");
      setFlats([]);
      setFilteredFlats([]);
    } finally {
      setLoadingFlats(false);
    }
  };

  // Search buildings
  const handleBuildingSearch = (searchValue) => {
    if (!searchValue.trim()) {
      setFilteredBuildings(buildings);
      return;
    }

    const filtered = buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        building.address?.toLowerCase().includes(searchValue.toLowerCase()),
    );
    setFilteredBuildings(filtered);
  };
  const handleFlatSearch = (value) => {
    if (!value.trim()) {
      setFilteredFlats(flats);
      return;
    }

    const filtered = flats.filter(
      (flat) =>
        flat.flat_number.toLowerCase().includes(value.toLowerCase()) ||
        String(flat.floor_number).includes(value),
    );

    setFilteredFlats(filtered);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.device_serial_number.trim()) {
      newErrors.device_serial_number = "Device serial number is required";
    } else if (formData.device_serial_number.trim().length < 3) {
      newErrors.device_serial_number =
        "Serial number must be at least 3 characters";
    }

    if (!formData.society_id) {
      newErrors.society_id = "Please select a society";
    }

    if (!formData.building_id) {
      newErrors.building_id = "Please select a building";
    }

    if (!formData.issue_date) {
      newErrors.issue_date = "Issue date is required";
    }
    if (!formData.flat_id) {
      newErrors.flat_id = "Please select a flat";
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
      const devicePayload = {
        device_serial_number: formData.device_serial_number,
        society_id: Number(formData.society_id),
        building_id: Number(formData.building_id),
        flat_id: formData.flat_id ? Number(formData.flat_id) : null,
        issue_date: formData.issue_date,
        status: formData.status,
      };
      console.log("FINAL PAYLOAD 👉", devicePayload);

      await onSubmit(devicePayload);

      toast.success(
        isEdit
          ? "Device updated successfully ✅"
          : "Device added successfully ✅",
      );

      onClose();
    } catch (error) {
      console.error("Error in device submission:", error);

      toast.error(
        error?.message || `Failed to ${isEdit ? "update" : "add"} device`,
      );
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
  };

  const handleSocietyChange = async (e) => {
    const societyId = Number(e.target.value);

    setFormData((prev) => ({
      ...prev,
      society_id: societyId,
      building_id: "",
      flat_id: "",
    }));

    setBuildings([]);
    setFlats([]);

    if (societyId) {
      await fetchBuildings(societyId);
    }
  };

  // const handleBuildingChange = (e) => {
  //   const buildingId = e.target.value;
  //   setFormData((prev) => ({ ...prev, building_id: buildingId }));
  //   setTouched((prev) => ({ ...prev, building_id: true }));

  //   if (errors.building_id) {
  //     setErrors((prev) => ({ ...prev, building_id: "" }));
  //   }
  // };
  const handleBuildingChange = async (e) => {
    const buildingId = Number(e.target.value);

    setFormData((prev) => ({
      ...prev,
      building_id: buildingId,
      flat_id: "",
    }));

    setFlats([]);
    setFilteredFlats([]);

    if (buildingId) {
      await fetchFlats(buildingId);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get selected society name
  const getSelectedSocietyName = () => {
    if (!formData.society_id) return "";
    const society = societies.find((s) => s.id === formData.society_id);
    return society ? society.name : "";
  };

  // Get selected building name
  const getSelectedBuildingName = () => {
    if (!formData.building_id) return "";
    const building = buildings.find((b) => b.id === formData.building_id);
    return building ? building.name : "";
  };
  const getSelectedFlatName = () => {
    if (!formData.flat_id) return "";
    const flat = flats.find((f) => f.id === Number(formData.flat_id));
    return flat ? `Flat ${flat.flat_number} (Floor ${flat.floor_number})` : "";
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
            0.9,
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
                  : "Add a new device to your building"}
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
            <Grid container spacing={3}>
              {/* Device Serial Number */}
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
                    Device Serial Number
                  </Typography>

                  <TextField
                    fullWidth
                    value={formData.device_serial_number}
                    onChange={handleFieldChange("device_serial_number")}
                    error={
                      !!errors.device_serial_number &&
                      touched.device_serial_number
                    }
                    helperText={
                      (touched.device_serial_number &&
                        errors.device_serial_number) ||
                      "Enter unique device serial number"
                    }
                    placeholder="Enter device serial number"
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Society Selection */}
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
                    Society
                  </Typography>

                  <FormControl
                    fullWidth
                    error={!!errors.society_id && touched.society_id}
                    size="small"
                  >
                    <Select
                      value={formData.society_id}
                      onChange={handleSocietyChange}
                      displayEmpty
                      disabled={loadingSocieties}
                      startAdornment={
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <Business sx={{ color: "#A29EB6", fontSize: 20 }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 1.5,
                        height: 44,
                        backgroundColor: "white",
                        border: "1px solid",
                        borderColor: errors.society_id ? "#B31B1B" : "#E0E0E0",
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
                              {loadingSocieties
                                ? "Loading societies..."
                                : "Select a society"}
                            </Typography>
                          );
                        }

                        const selectedSociety = societies.find(
                          (s) => s.id === selected,
                        );
                        return (
                          <Box>
                            <Typography fontWeight={500}>
                              {selectedSociety?.name}
                            </Typography>
                            {selectedSociety?.address && (
                              <Typography variant="caption" color="#A29EB6">
                                {selectedSociety.address}
                              </Typography>
                            )}
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="#A29EB6">
                          {loadingSocieties ? "Loading..." : "Select a society"}
                        </Typography>
                      </MenuItem>

                      {societies.map((society) => (
                        <MenuItem key={society.id} value={society.id}>
                          <Box sx={{ width: "100%" }}>
                            <Typography fontWeight={500}>
                              {society.name}
                            </Typography>
                            {society.address && (
                              <Typography
                                variant="caption"
                                color="#A29EB6"
                                display="block"
                              >
                                {society.address}
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
                        sx={{ mt: 0.5, ml: 1, display: "block" }}
                      >
                        {errors.society_id}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              </Grid>

              {/* Building Selection */}
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
                    Building
                  </Typography>

                  <FormControl
                    fullWidth
                    error={!!errors.building_id && touched.building_id}
                    size="small"
                  >
                    <Select
                      value={formData.building_id}
                      onChange={handleBuildingChange}
                      displayEmpty
                      disabled={!formData.society_id || loadingBuildings}
                      startAdornment={
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <Apartment sx={{ color: "#A29EB6", fontSize: 20 }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 1.5,
                        height: 44,
                        backgroundColor: "white",
                        border: "1px solid",
                        borderColor: errors.building_id ? "#B31B1B" : "#E0E0E0",
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
                              {!formData.society_id
                                ? "Select a society first"
                                : loadingBuildings
                                  ? "Loading buildings..."
                                  : "Select a building"}
                            </Typography>
                          );
                        }

                        const selectedBuilding = buildings.find(
                          (b) => b.id === selected,
                        );
                        return (
                          <Box>
                            <Typography fontWeight={500}>
                              {selectedBuilding?.name}
                            </Typography>
                            {selectedBuilding?.floors && (
                              <Typography variant="caption" color="#A29EB6">
                                {selectedBuilding.floors} floors
                              </Typography>
                            )}
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value="" disabled>
                        <Typography color="#A29EB6">
                          {!formData.society_id
                            ? "Select a society first"
                            : loadingBuildings
                              ? "Loading..."
                              : "Select a building"}
                        </Typography>
                      </MenuItem>

                      {filteredBuildings.map((building) => (
                        <MenuItem key={building.id} value={building.id}>
                          <Box sx={{ width: "100%" }}>
                            <Typography fontWeight={500}>
                              {building.name}
                            </Typography>
                            <Box display="flex" gap={2} mt={0.5}>
                              {building.floors && (
                                <Chip
                                  size="small"
                                  label={`${building.floors} floors`}
                                  sx={{ height: 20, fontSize: "0.7rem" }}
                                />
                              )}
                              {building.address && (
                                <Typography variant="caption" color="#A29EB6">
                                  {building.address}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>

                    {errors.building_id && (
                      <Typography
                        variant="caption"
                        color="#B31B1B"
                        sx={{ mt: 0.5, ml: 1, display: "block" }}
                      >
                        {errors.building_id}
                      </Typography>
                    )}

                    {formData.society_id && buildings.length > 10 && (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search buildings..."
                        onChange={(e) => handleBuildingSearch(e.target.value)}
                        sx={{ mt: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography color="#A29EB6">🔍</Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </FormControl>
                </Box>
              </Grid>
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
                    Flat
                  </Typography>

                  <FormControl
                    fullWidth
                    error={!!errors.flat_id && touched.flat_id}
                    size="small"
                  >
                    <Select
                      value={formData.flat_id}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          flat_id: Number(e.target.value),
                        }))
                      }
                      displayEmpty
                      disabled={!formData.building_id || loadingFlats}
                      sx={{
                        borderRadius: 1.5,
                        height: 44,
                        backgroundColor: "white",
                        border: "1px solid",
                        borderColor: errors.flat_id ? "#B31B1B" : "#E0E0E0",
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <Typography
                              color="#A29EB6"
                              sx={{ fontStyle: "italic" }}
                            >
                              {!formData.building_id
                                ? "Select building first"
                                : loadingFlats
                                  ? "Loading flats..."
                                  : "Select a flat"}
                            </Typography>
                          );
                        }

                        const flat = flats.find(
                          (f) => f.id === Number(selected),
                        );
                        return flat
                          ? `Flat ${flat.flat_number} (Floor ${flat.floor_number})`
                          : "";
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select a flat
                      </MenuItem>

                      {filteredFlats.map((flat) => (
                        <MenuItem key={flat.id} value={flat.id}>
                          Flat {flat.flat_number} • Floor {flat.floor_number} •{" "}
                          {flat.bhk_type}
                        </MenuItem>
                      ))}
                    </Select>

                    {errors.flat_id && (
                      <Typography
                        variant="caption"
                        color="#B31B1B"
                        sx={{ mt: 0.5, ml: 1 }}
                      >
                        {errors.flat_id}
                      </Typography>
                    )}

                    {flats.length > 10 && (
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search flats..."
                        sx={{ mt: 1 }}
                        onChange={(e) => handleFlatSearch(e.target.value)}
                      />
                    )}
                  </FormControl>
                </Box>
              </Grid>
            </Grid>

            {/* Selected Info Preview */}
            {(formData.society_id ||
              formData.building_id ||
              formData.flat_id) && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: alpha("#6F0B14", 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha("#6F0B14", 0.1)}`,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="#6F0B14"
                  mb={1}
                >
                  Selected Information:
                </Typography>
                <Grid container spacing={1}>
                  {formData.society_id && (
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" sx={{ color: "#6F0B14" }} />
                        <Typography variant="body2">
                          <strong>Society:</strong> {getSelectedSocietyName()}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {formData.building_id && (
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Apartment fontSize="small" sx={{ color: "#6F0B14" }} />
                        <Typography variant="body2">
                          <strong>Building:</strong> {getSelectedBuildingName()}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {formData.flat_id && (
                    <Grid item xs={12} md={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <BsDoorOpenFill
                          fontSize="small"
                          sx={{ color: "#6F0B14" }}
                        />
                        <Typography variant="body2">
                          <strong>Flat:</strong> {getSelectedFlatName()}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

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
