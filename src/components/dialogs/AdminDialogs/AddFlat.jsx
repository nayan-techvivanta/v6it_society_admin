import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormHelperText,
} from "@mui/material";
import { supabase } from "../../../api/supabaseClient";
// import toast from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import HomeIcon from "@mui/icons-material/Home";

const bhkOptions = [
  { value: "1BHK", label: "1BHK" },
  { value: "2BHK", label: "2BHK" },
  { value: "3BHK", label: "3BHK" },
  { value: "4BHK", label: "4BHK" },
  { value: "Studio", label: "Studio" },
  { value: "Penthouse", label: "Penthouse" },
];

const statusOptions = [
  { value: "Vacant", label: "Vacant", color: "#93BD57" },
  { value: "Occupied", label: "Occupied", color: "#F96E5B" },
  { value: "Blocked", label: "Blocked", color: "#DBA400" },
];

export default function AddFlatDialog({ open, onClose, building, societyId }) {
  const [formData, setFormData] = useState({
    flat_number: "",
    floor_number: "",
    bhk_type: "",
    area_sqft: "",
    occupancy_status: "Vacant",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [buildingName, setBuildingName] = useState("");

  useEffect(() => {
    if (building?.name) {
      setBuildingName(building.name);
    }
    if (!open) {
      // Reset form on close
      setFormData({
        flat_number: "",
        floor_number: "",
        bhk_type: "",
        area_sqft: "",
        occupancy_status: "Vacant",
      });
      setErrors({});
    }
  }, [open, building]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.flat_number.trim())
      newErrors.flat_number = "Flat number is required";
    if (!formData.floor_number || formData.floor_number < 0)
      newErrors.floor_number = "Valid floor number is required";
    if (!formData.bhk_type) newErrors.bhk_type = "BHK type is required";
    if (!formData.area_sqft || formData.area_sqft <= 0)
      newErrors.area_sqft = "Valid area (sqft) is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!validateForm()) return;

  //     setLoading(true);
  //     try {
  //       const { data, error } = await supabase
  //         .from("flats") // Assume 'flats' table in Supabase
  //         .insert([
  //           {
  //             building_id: building?.id,
  //             society_id: societyId,
  //             flat_number: formData.flat_number.trim(),
  //             floor_number: parseInt(formData.floor_number),
  //             bhk_type: formData.bhk_type,
  //             area_sqft: parseFloat(formData.area_sqft),
  //             occupancy_status: formData.occupancy_status,
  //             is_active: true,
  //             created_at: new Date().toISOString(),
  //           },
  //         ]);

  //       if (error) {
  //         console.error("Error adding flat:", error);
  //         // toast.error(`Failed to add flat: ${error.message}`);
  //       } else {
  //         toast.success("Flat added successfully!");
  //         onClose();
  //       }
  //     } catch (err) {
  //       console.error("Error:", err);
  //       //   toast.error("Something went wrong!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ✅ STEP 1: Check if flat already exists
      const { data: existingFlat, error: checkError } = await supabase
        .from("flats")
        .select("id, flat_number")
        .eq("building_id", building?.id)
        .eq("flat_number", formData.flat_number.trim())
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing flat:", checkError);
        toast.error("Error checking flat details");
        return;
      }

      if (existingFlat) {
        toast.error(
          `Flat ${formData.flat_number} already exists in this building!`
        );
        return;
      }

      // ✅ STEP 2: Insert new flat
      const { data, error } = await supabase
        .from("flats")
        .insert([
          {
            building_id: building?.id,
            society_id: societyId,
            flat_number: formData.flat_number.trim(),
            floor_number: parseInt(formData.floor_number),
            bhk_type: formData.bhk_type,
            area_sqft: parseFloat(formData.area_sqft),
            occupancy_status: formData.occupancy_status,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select(); // Return inserted data

      if (error) {
        console.error("Error adding flat:", error);

        // Specific duplicate error handling
        if (error.code === "23505") {
          toast.error(
            `Flat ${formData.flat_number} already exists! Please use a different flat number.`
          );
        } else {
          toast.error(`Failed to add flat: ${error.message}`);
        }
      } else {
        toast.success(`Flat ${formData.flat_number} added successfully!`);
        onClose();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong while adding flat!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <HomeIcon sx={{ color: "#6F0B14", fontSize: "1.5rem" }} />
                <Typography
                  variant="h6"
                  className="font-roboto font-semibold text-primary"
                >
                  Add New Flat - {buildingName}
                </Typography>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1, pb: 2 }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Flat Number"
                    name="flat_number"
                    value={formData.flat_number}
                    onChange={handleChange}
                    error={!!errors.flat_number}
                    helperText={errors.flat_number}
                    sx={{ mb: 2 }}
                    inputProps={{ maxLength: 10 }}
                  />

                  <TextField
                    fullWidth
                    label="Floor Number"
                    name="floor_number"
                    type="number"
                    value={formData.floor_number}
                    onChange={handleChange}
                    error={!!errors.floor_number}
                    helperText={errors.floor_number || "e.g., Ground=0, 1st=1"}
                    sx={{ mb: 2 }}
                    inputProps={{ min: 0, max: 50 }}
                  />

                  <FormControl
                    fullWidth
                    error={!!errors.bhk_type}
                    sx={{ mb: 2 }}
                  >
                    <InputLabel>BHK Type</InputLabel>
                    <Select
                      name="bhk_type"
                      value={formData.bhk_type}
                      onChange={handleChange}
                      label="BHK Type"
                    >
                      {bhkOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.bhk_type && (
                      <FormHelperText>{errors.bhk_type}</FormHelperText>
                    )}
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Area (sqft)"
                    name="area_sqft"
                    type="number"
                    value={formData.area_sqft}
                    onChange={handleChange}
                    error={!!errors.area_sqft}
                    helperText={errors.area_sqft || "e.g., 1200"}
                    sx={{ mb: 2 }}
                    inputProps={{ min: 100, step: 0.01 }}
                  />

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Occupancy Status</InputLabel>
                    <Select
                      name="occupancy_status"
                      value={formData.occupancy_status}
                      onChange={handleChange}
                      label="Occupancy Status"
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                bgcolor: status.color,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              }}
                            />
                            {status.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {errors.general && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {errors.general}
                    </Alert>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={onClose}
                disabled={loading}
                sx={{ fontWeight: 500 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                variant="contained"
                sx={{
                  backgroundColor: "#6F0B14",
                  fontWeight: 600,
                  px: 4,
                  "&:hover": { backgroundColor: "#5A0A11" },
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Add Flat"
                )}
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
