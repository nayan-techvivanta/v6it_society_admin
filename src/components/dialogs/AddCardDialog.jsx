import React, { useState, useEffect, useRef } from "react";
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
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Apartment,
  Tag,
  AssignmentTurnedIn,
  Business,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";

import { toast } from "react-toastify";

const AddCardDialog = ({
  open,
  onClose,
  // onSubmit,
  // societies = [],
  isEdit = false,
  cardData,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    society_id: "",
    building_id: "",
    card_serial_number: "",
    is_assigned: false,
  });

  const [societies, setSocieties] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const serialRef = useRef(null);
  const societyRef = useRef(null);
  const buildingRef = useRef(null);

  useEffect(() => {
    const fetchSocieties = async () => {
      setLoadingSocieties(true);

      const { data, error } = await supabase
        .from("societies")
        .select("id, name");

      if (error) {
        toast.error("Failed to load societies");
      } else {
        setSocieties(data || []);
      }

      setLoadingSocieties(false);
    };

    if (open) fetchSocieties();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (isEdit && cardData) {
        setFormData({
          society_id: cardData.society_id || "",
          building_id: cardData.building_id || "",
          card_serial_number: cardData.card_serial_number || "",
          is_assigned: false,
        });

        if (cardData.society_id) {
          fetchBuildings(cardData.society_id);
        }
      } else {
        setFormData({
          society_id: "",
          building_id: "",
          card_serial_number: "",
          is_assigned: false,
        });
      }

      setErrors({});
      setTouched({});

      setTimeout(focusEmptyField, 100);
    }
  }, [open, isEdit, cardData]);

  const selectedSociety = societies.find((s) => s.id === formData.society_id);

  const fetchBuildings = async (societyId) => {
    if (!societyId) return;

    try {
      setLoadingBuildings(true);

      const { data, error } = await supabase
        .from("buildings")
        .select("id, name")
        .eq("society_id", societyId)
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name");

      if (error) throw error;

      setBuildings(data || []);
    } catch (error) {
      toast.error("Failed to load buildings");
      setBuildings([]);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.society_id) {
      newErrors.society_id = "Please select a society";
    }

    if (!formData.card_serial_number.trim()) {
      newErrors.card_serial_number = "Card serial number is required";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  useEffect(() => {
    validateForm();
  }, [formData]);

  const focusEmptyField = () => {
    if (!formData.card_serial_number?.trim() && serialRef.current) {
      serialRef.current.focus();
    } else if (!formData.society_id && societyRef.current) {
      societyRef.current.focus();
    } else if (!formData.building_id && buildingRef.current) {
      buildingRef.current.focus();
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!isFormValid) {
  //     toast.error("Please fix all errors before submitting");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     let query;

  //     const payload = {
  //       society_id: formData.society_id,
  //       card_serial_number: formData.card_serial_number,
  //       building_id: formData.building_id,
  //     };

  //     if (isEdit && cardData?.id) {
  //       // 🔹 UPDATE CARD
  //       query = supabase
  //         .from("cards")
  //         .update(payload)
  //         .eq("id", cardData.id)
  //         .select()
  //         .single();
  //     } else {
  //       // 🔹 INSERT CARD
  //       query = supabase.from("cards").insert([payload]).select().single();
  //     }

  //     const { error } = await query;

  //     if (error) throw error;

  //     toast.success(
  //       isEdit ? "Card updated successfully!" : "Card created successfully!"
  //     );

  //     onClose(); // parent will refresh list
  //   } catch (error) {
  //     console.error("Save card error:", error);
  //     toast.error(error.message || "Failed to save card");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        society_id: formData.society_id,
        card_serial_number: formData.card_serial_number,
        building_id: formData.building_id,
        is_assigned: false,
      };

      let query;
      if (isEdit && cardData?.id) {
        query = supabase
          .from("cards")
          .update(payload)
          .eq("id", cardData.id)
          .select()
          .single();
      } else {
        query = supabase.from("cards").insert([payload]).select().single();
      }

      const { data, error } = await query;

      if (error) throw error;

      toast.success(
        isEdit ? "Card updated successfully!" : "Card created successfully!",
      );

      onClose();
    } catch (error) {
      console.error("Save card error:", error);
      toast.error(error.message || "Failed to save card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;

    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "society_id") {
        updated.building_id = "";
        setBuildings([]);
        if (value) fetchBuildings(value);
      }

      return updated;
    });

    setTouched((prev) => ({
      ...prev,
      [field]: true,
      ...(field === "society_id" && { building_id: false }),
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      ...(field === "society_id" && { building_id: "" }),
    }));
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
      maxWidth="sm"
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
              <Business sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700">
                {isEdit ? "Edit Card" : "Create New Card"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, fontSize: "0.875rem" }}
              >
                {isEdit ? "Update card details" : "Fill in all required fields"}
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
                Card Serial Number
              </Typography>

              <TextField
                fullWidth
                inputRef={serialRef}
                value={formData.card_serial_number}
                onChange={handleFieldChange("card_serial_number")}
                error={
                  !!errors.card_serial_number && touched.card_serial_number
                }
                helperText={
                  (touched.card_serial_number && errors.card_serial_number) ||
                  "Format: ABC-1234"
                }
                InputProps={{
                  startAdornment: (
                    <Box sx={{ color: "#A29EB6", mr: 1 }}>
                      <Tag sx={{ fontSize: 20 }} />
                    </Box>
                  ),
                  sx: {
                    borderRadius: 1.5,
                    height: 44,
                  },
                }}
                placeholder="e.g., SOC-1234"
                size="small"
              />
            </Box>
            {/* Society Selection */}
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
                Select Society
              </Typography>

              <FormControl fullWidth error={!!errors.society_id} size="small">
                <Select
                  inputRef={societyRef}
                  value={formData.society_id}
                  onChange={handleFieldChange("society_id")}
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    height: 44,
                    backgroundColor: "white",
                    border: "1px solid",
                    borderColor: errors.societyId ? "#B31B1B" : "#E0E0E0",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: errors.societyId ? "#B31B1B" : "#6F0B14",
                    },
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1.5,
                      pr: 4,
                    },
                    "&.Mui-focused": {
                      borderColor: "#6F0B14",
                      borderWidth: "1.5px",
                      boxShadow: "0 0 0 3px rgba(111, 11, 20, 0.1)",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        marginTop: 0.5,
                        boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                        maxHeight: 300,
                      },
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Typography
                          color="#A29EB6"
                          sx={{ fontStyle: "italic" }}
                        >
                          Select a society
                        </Typography>
                      );
                    }

                    const society = societies.find((s) => s.id === selected);
                    return society?.name;
                  }}
                >
                  <MenuItem value="" disabled>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      sx={{ opacity: 0.7 }}
                    >
                      <Box
                        sx={{
                          backgroundColor: "rgba(0,0,0,0.04)",
                          borderRadius: 1,
                          p: 0.75,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                        }}
                      >
                        <Business sx={{ color: "#A29EB6", fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography color="#A29EB6">Select society</Typography>
                        <Typography variant="caption" color="#A29EB6">
                          Choose from available societies
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>

                  {societies.map((society) => (
                    <MenuItem key={society.id} value={society.id}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        width="100%"
                      >
                        <Box
                          sx={{
                            backgroundColor: "rgba(111, 11, 20, 0.1)",
                            borderRadius: 1,
                            p: 0.75,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                          }}
                        >
                          <Typography
                            fontWeight={600}
                            color="#6F0B14"
                            fontSize="0.875rem"
                          >
                            {society.name.substring(0, 2).toUpperCase()}
                          </Typography>
                        </Box>

                        <Box flex={1}>
                          <Typography fontWeight={500} color="text.primary">
                            {society.name}
                          </Typography>
                        </Box>

                        {formData.societyId === society.id && (
                          <CheckCircle
                            sx={{ color: "#6F0B14", fontSize: 20 }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>

                {errors.societyId && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.75,
                      ml: 0.5,
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
                    <Typography
                      variant="caption"
                      color="#B31B1B"
                      fontWeight={500}
                      fontSize="0.75rem"
                    >
                      {errors.societyId}
                    </Typography>
                  </Box>
                )}
              </FormControl>
            </Box>
            {/* Building Selection */}
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
                Select Building
              </Typography>

              <FormControl fullWidth size="small" margin="normal">
                <InputLabel id="building-label">Select Building</InputLabel>
                <Select
                  inputRef={buildingRef}
                  labelId="building-label"
                  value={formData.building_id}
                  onChange={handleFieldChange("building_id")}
                  disabled={!formData.society_id || loadingBuildings}
                  error={!!errors.building_id}
                >
                  {loadingBuildings ? (
                    <MenuItem value="">
                      <em>Loading...</em>
                    </MenuItem>
                  ) : (
                    buildings.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.building_id && (
                  <Typography variant="caption" color="error">
                    {errors.building_id}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Serial ID */}

            {/* Selected Society Preview */}
            {selectedSociety && (
              <Box
                sx={{
                  backgroundColor: "rgba(111, 11, 20, 0.05)",
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                  border: "1px solid rgba(111, 11, 20, 0.1)",
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="#6F0B14"
                  mb={1}
                >
                  Selected Society Preview
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      backgroundColor: "rgba(111, 11, 20, 0.1)",
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
                      {selectedSociety.name.substring(0, 2).toUpperCase()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontWeight={600} color="text.primary">
                      {selectedSociety.name}
                    </Typography>
                    <Typography variant="caption" color="#A29EB6">
                      {selectedSociety.address &&
                        `${selectedSociety.address} • `}
                      {selectedSociety.city && `${selectedSociety.city}, `}
                      {selectedSociety.state || selectedSociety.region}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

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
                        ? "Update Card"
                        : "Create Card"}
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

export default AddCardDialog;
