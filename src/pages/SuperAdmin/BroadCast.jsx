import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBulkNotification } from "../../Hooks/useBulkNotification";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Checkbox,
  ListItemText,
  Autocomplete,
} from "@mui/material";

import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Description as DescriptionIcon,
  Announcement as AnnouncementIcon,
  Business as BuildingIcon,
  Apartment as ApartmentIcon,
  Groups as GroupsIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { styled } from "@mui/material/styles";
import { supabase } from "../../api/supabaseClient";
import { uploadImage } from "../../api/uploadImage";

// Styled components for custom design
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(111, 11, 20, 0.08)",
  background: "linear-gradient(135deg, #ffffff 0%, #fef2f3 100%)",
  border: "1px solid rgba(111, 11, 20, 0.1)",
  backdropFilter: "blur(10px)",
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #6F0B14 0%, #8A0F1B 60%, #6F0B14 100%)",
  color: "#FFFFFF",
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 600,
  padding: "12px 28px",
  borderRadius: "10px",
  textTransform: "none",
  fontSize: "15px",
  letterSpacing: "0.4px",
  boxShadow: "0 6px 18px rgba(111, 11, 20, 0.25)",

  "&:hover": {
    background:
      "linear-gradient(135deg, #8A0F1B 0%, #A51423 60%, #8A0F1B 100%)",
    boxShadow: "0 10px 26px rgba(111, 11, 20, 0.35)",
    transform: "translateY(-1px)",
  },

  "&:active": {
    transform: "translateY(0)",
    boxShadow: "0 5px 14px rgba(111, 11, 20, 0.3)",
  },

  "&:focus-visible": {
    outline: "none",
    boxShadow:
      "0 0 0 3px rgba(165, 20, 35, 0.35), 0 8px 22px rgba(111, 11, 20, 0.35)",
  },

  "&:disabled": {
    background: "#E5E7EB",
    color: "#9CA3AF",
    boxShadow: "none",
    transform: "none",
    cursor: "not-allowed",
  },

  transition: "background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
}));

const FileUploadArea = styled(Paper)(({ theme, isdragging }) => ({
  border: "2px dashed",
  borderColor: isdragging === "true" ? "#6F0B14" : "#D1D5DB",
  borderRadius: "12px",
  padding: "40px 20px",
  textAlign: "center",
  cursor: "pointer",
  background: isdragging === "true" ? "rgba(111, 11, 20, 0.05)" : "transparent",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "#6F0B14",
    background: "rgba(111, 11, 20, 0.05)",
  },
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// Type definitions
const SocietyType = {
  id: "",
  name: "",
  address: "",
  buildings: [],
};

const BuildingType = {
  id: "",
  name: "",
  address: "",
  society_id: "",
};

const SelectedSocietyType = {
  id: "",
  name: "",
  sendTo: "society",
  selectedBuildings: [],
};

const Broadcast = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    scheduleForLater: false,
    scheduledDate: "",
    scheduledTime: "",
  });

  const [selectedSocieties, setSelectedSocieties] = useState([]);
  const [allSocieties, setAllSocieties] = useState([]);
  const [allBuildings, setAllBuildings] = useState({});
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loadingSocieties, setLoadingSocieties] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const profileId = Number(localStorage.getItem("profileId"));
  const fileInputRef = useRef(null);
  const {
    sendBulkNotification,
    isSending: isNotificationSending,
    progress,
    getSocietyBuildingIds,
  } = useBulkNotification();
  // Fetch societies on component mount
  useEffect(() => {
    fetchSocieties();
  }, []);

  // Fetch societies from Supabase
  const fetchSocieties = async () => {
    setLoadingSocieties(true);
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("id, name, address")
        .order("name");

      if (error) throw error;
      setAllSocieties(data || []);
    } catch (error) {
      console.error("Error fetching societies:", error);
      setSnackbar({
        open: true,
        message: "Failed to load societies. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingSocieties(false);
    }
  };

  const fetchBuildingsForSociety = async (societyId) => {
    if (!societyId) return;

    setLoadingBuildings(true);
    try {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name, description, building_type, flat_limit, society_id")
        .eq("society_id", societyId)
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name");

      if (error) throw error;

      setAllBuildings((prev) => ({
        ...prev,
        [societyId]: data || [],
      }));
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setSnackbar({
        open: true,
        message: "Failed to load buildings. Please try again.",
        severity: "error",
      });
    } finally {
      setLoadingBuildings(false);
    }
  };

  useEffect(() => {
    selectedSocieties.forEach((society) => {
      if (!allBuildings[society.id]) {
        fetchBuildingsForSociety(society.id);
      }
    });
  }, [selectedSocieties]);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSocietySelection = (event, newValue) => {
    const newSocieties = newValue
      .filter(
        (society, index, self) =>
          index === self.findIndex((s) => s.id === society.id),
      )
      .map((society) => ({
        id: society.id,
        name: society.name,
        sendTo: "society",
        selectedBuildings: [],
      }));

    setSelectedSocieties(newSocieties);
  };

  const handleSocietySendToChange = (societyId, sendTo) => {
    setSelectedSocieties((prev) =>
      prev.map((society) =>
        society.id === societyId
          ? {
              ...society,
              sendTo,
              selectedBuildings:
                sendTo === "society" ? [] : society.selectedBuildings,
            }
          : society,
      ),
    );
  };

  const handleBuildingSelection = (societyId, buildingIds) => {
    setSelectedSocieties((prev) =>
      prev.map((society) =>
        society.id === societyId
          ? { ...society, selectedBuildings: buildingIds }
          : society,
      ),
    );
  };

  const removeSociety = (societyId) => {
    setSelectedSocieties((prev) =>
      prev.filter((society) => society.id !== societyId),
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const maxSize = 10 * 1024 * 1024;
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
      ];

      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: `File ${file.name} is too large. Maximum size is 10MB.`,
          severity: "error",
        });
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `File type ${file.type} is not supported.`,
          severity: "error",
        });
        return false;
      }

      return true;
    });

    setFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    ]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon />;
    if (type === "application/pdf") return <DescriptionIcon />;
    return <AttachFileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadFileToSupabase = async (file) => {
    try {
      const result = await uploadImage(file);
      return result.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  };

  const saveBroadcastToDatabase = async (broadcastData) => {
    const { data, error } = await supabase
      .from("broadcast")
      .insert([broadcastData])
      .select();

    if (error) throw error;
    return data;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---- validations (unchanged) ----
    if (selectedSocieties.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one society",
        severity: "error",
      });
      return;
    }
    if (!profileId) {
      throw new Error("User profileId not found in localStorage");
    }
    if (!formData.title.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a title for the broadcast",
        severity: "error",
      });
      return;
    }

    if (!formData.description.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a description",
        severity: "error",
      });
      return;
    }

    const invalidSelections = selectedSocieties.filter(
      (society) =>
        society.sendTo === "building" && society.selectedBuildings.length === 0,
    );

    if (invalidSelections.length > 0) {
      setSnackbar({
        open: true,
        message: `Please select buildings for ${invalidSelections.map((s) => s.name).join(", ")}`,
        severity: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // ---- upload files ----
      let fileUrls = [];
      if (files.length > 0) {
        fileUrls = await Promise.all(
          files.map((file) => uploadFileToSupabase(file.file)),
        );
      }
      const imageUrl = fileUrls.length > 0 ? fileUrls[0] : null;

      for (const society of selectedSocieties) {
        let buildingIds = [];

        if (society.sendTo === "society") {
          buildingIds = await getSocietyBuildingIds(society.id);
        } else if (society.sendTo === "building") {
          buildingIds = society.selectedBuildings;
        }

        if (buildingIds.length > 0) {
          await sendBulkNotification({
            buildingIds,
            title: formData.title.trim(),
            body: formData.description.trim(),
            imageUrl,
            notificationType: "Super Admin",
            data: { screen: "broadcast" },
            societyName: society.name,
            society_id: society.id,

            building_id:
              society.sendTo === "building" &&
              society.selectedBuildings.length === 1
                ? society.selectedBuildings[0]
                : null,
          });
        }
      }

      // Save broadcast record (unchanged)
      const broadcastPromises = selectedSocieties.map((society) => {
        if (society.sendTo === "society") {
          return saveBroadcastToDatabase({
            title: formData.title,
            message: formData.description,
            socity_id: String(society.id),
            building_id: null,
            document: imageUrl,
            user_id: profileId,
            created_at: new Date().toISOString(),
          });
        } else {
          return Promise.all(
            society.selectedBuildings.map((buildingId) =>
              saveBroadcastToDatabase({
                title: formData.title,
                message: formData.description,
                socity_id: String(society.id),
                building_id: String(buildingId),
                document: imageUrl,
                user_id: profileId,
                created_at: new Date().toISOString(),
              }),
            ),
          );
        }
      });

      await Promise.all(broadcastPromises.flat());

      setSnackbar({
        open: true,
        message: "Broadcast & notifications sent successfully!",
        severity: "success",
      });

      // ---- reset ----
      setFormData({
        title: "",
        description: "",
        category: "general",
        scheduleForLater: false,
        scheduledDate: "",
        scheduledTime: "",
      });
      setSelectedSocieties([]);
      setFiles([]);
    } catch (error) {
      console.error("Broadcast Error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to send broadcast",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Calculate total destinations
  const getTotalDestinations = () => {
    return selectedSocieties.reduce((total, society) => {
      if (society.sendTo === "society") return total + 1;
      return total + society.selectedBuildings.length;
    }, 0);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-roboto"
    >
      <div className="max-w-6xl mx-auto">
        {isNotificationSending && (
          <div className="fixed top-20 right-4 bg-white/95 backdrop-blur-sm p-4 shadow-xl rounded-lg z-50 border max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <CircularProgress size={18} />
              <Typography
                variant="caption"
                fontWeight={600}
                className="text-primary"
              >
                Broadcasting to {getTotalDestinations()} destinations...
              </Typography>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-primary to-red-600 h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Typography
            variant="h4"
            className="text-primary"
            sx={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700 }}
          >
            <AnnouncementIcon className="mr-3" />
            Create Broadcast
          </Typography>
          <Typography
            variant="subtitle1"
            className="mt-2 text-hintText"
            sx={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Send important announcements, notifications, and updates to multiple
            societies and buildings
          </Typography>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 space-y-6"
            >
              <StyledCard>
                <CardContent className="p-6 space-y-6">
                  {/* Society Selection - Multiple */}
                  <motion.div variants={itemVariants}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        options={allSocieties}
                        getOptionLabel={(option) => option.name}
                        value={selectedSocieties
                          .map((s) => allSocieties.find((as) => as.id === s.id))
                          .filter(Boolean)}
                        onChange={handleSocietySelection}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Societies *"
                            placeholder="Select one or more societies..."
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "rgba(111, 11, 20, 0.2)",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#6F0B14",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: "#6F0B14",
                                    borderWidth: "2px",
                                  },
                              },
                              "& .MuiInputLabel-root": {
                                fontFamily: "'Roboto', sans-serif",
                                color: "#6F0B14",
                              },
                            }}
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <div>
                              <Typography
                                sx={{
                                  fontFamily: "'Roboto', sans-serif",
                                  fontWeight: 500,
                                }}
                              >
                                {option.name}
                              </Typography>
                              {option.address && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: "'Roboto', sans-serif",
                                    color: "text.secondary",
                                  }}
                                >
                                  {option.address}
                                </Typography>
                              )}
                            </div>
                          </li>
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option.id}
                              label={option.name}
                              size="small"
                              deleteIcon={<CloseIcon />}
                              sx={{
                                backgroundColor: "rgba(111, 11, 20, 0.1)",
                                color: "#6F0B14",
                                fontFamily: "'Roboto', sans-serif",
                                fontWeight: 500,
                                margin: "2px",
                              }}
                            />
                          ))
                        }
                        loading={loadingSocieties}
                        disabled={loadingSocieties}
                      />
                    </FormControl>
                  </motion.div>

                  {/* Selected Societies Configuration */}
                  <AnimatePresence>
                    {selectedSocieties.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        variants={itemVariants}
                        className="space-y-4"
                      >
                        <Typography
                          variant="subtitle1"
                          className="font-semibold text-primary"
                          sx={{ fontFamily: "'Roboto', sans-serif" }}
                        >
                          Configure Broadcast Destinations
                        </Typography>

                        {selectedSocieties.map((society) => (
                          <div
                            key={society.id}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <Typography
                                  sx={{
                                    fontFamily: "'Roboto', sans-serif",
                                    fontWeight: 600,
                                  }}
                                >
                                  {society.name}
                                </Typography>
                              </div>
                              <IconButton
                                size="small"
                                onClick={() => removeSociety(society.id)}
                                className="text-reject hover:bg-red-50"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </div>

                            <div className="space-y-3">
                              {/* Send To Selection */}
                              <FormControl fullWidth size="small">
                                <InputLabel
                                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                                >
                                  Send To
                                </InputLabel>
                                <Select
                                  value={society.sendTo}
                                  onChange={(e) =>
                                    handleSocietySendToChange(
                                      society.id,
                                      e.target.value,
                                    )
                                  }
                                  label="Send To"
                                  sx={{ fontFamily: "'Roboto', sans-serif" }}
                                >
                                  <MenuItem
                                    value="society"
                                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                                  >
                                    Entire Society
                                  </MenuItem>
                                  <MenuItem
                                    value="building"
                                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                                    disabled={
                                      !allBuildings[society.id] ||
                                      allBuildings[society.id]?.length === 0
                                    }
                                  >
                                    Specific Buildings
                                  </MenuItem>
                                </Select>
                              </FormControl>

                              {/* Building Selection (if sendTo is building) */}
                              {society.sendTo === "building" &&
                                allBuildings[society.id] && (
                                  <FormControl fullWidth size="small">
                                    <InputLabel
                                      sx={{
                                        fontFamily: "'Roboto', sans-serif",
                                      }}
                                    >
                                      Select Buildings *
                                    </InputLabel>
                                    <Select
                                      multiple
                                      value={society.selectedBuildings}
                                      onChange={(e) =>
                                        handleBuildingSelection(
                                          society.id,
                                          e.target.value,
                                        )
                                      }
                                      label="Select Buildings *"
                                      // renderValue={(selected) => (
                                      //   <div className="flex flex-wrap gap-1">
                                      //     {selected.map((buildingId) => {
                                      //       const building = allBuildings[
                                      //         society.id
                                      //       ]?.find((b) => b.id === buildingId);
                                      //       return building ? (
                                      //         <Chip
                                      //           key={buildingId}
                                      //           label={building.name}
                                      //           size="small"
                                      //           sx={{
                                      //             backgroundColor:
                                      //               "rgba(111, 11, 20, 0.1)",
                                      //             color: "#6F0B14",
                                      //             fontFamily:
                                      //               "'Roboto', sans-serif",
                                      //           }}
                                      //         />
                                      //       ) : null;
                                      //     })}
                                      //   </div>
                                      // )}
                                      // In the renderValue for building selection, update:
                                      renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-1">
                                          {selected.map((buildingId) => {
                                            const building = allBuildings[
                                              society.id
                                            ]?.find((b) => b.id === buildingId);
                                            return building ? (
                                              <Chip
                                                key={buildingId}
                                                label={`${building.name}${
                                                  building.building_type
                                                    ? ` (${building.building_type})`
                                                    : ""
                                                }`}
                                                size="small"
                                                sx={{
                                                  backgroundColor:
                                                    "rgba(111, 11, 20, 0.1)",
                                                  color: "#6F0B14",
                                                  fontFamily:
                                                    "'Roboto', sans-serif",
                                                }}
                                              />
                                            ) : null;
                                          })}
                                        </div>
                                      )}
                                      sx={{
                                        fontFamily: "'Roboto', sans-serif",
                                      }}
                                    >
                                      {/* {allBuildings[society.id]?.map(
                                        (building) => (
                                          <MenuItem
                                            key={building.id}
                                            value={building.id}
                                          >
                                            <Checkbox
                                              checked={society.selectedBuildings.includes(
                                                building.id
                                              )}
                                            />
                                            <ListItemText
                                              primary={building.name}
                                              secondary={building.address}
                                              sx={{
                                                fontFamily:
                                                  "'Roboto', sans-serif",
                                              }}
                                            />
                                          </MenuItem>
                                        )
                                      )} */}
                                      {allBuildings[society.id]?.map(
                                        (building) => (
                                          <MenuItem
                                            key={building.id}
                                            value={building.id}
                                          >
                                            <Checkbox
                                              checked={society.selectedBuildings.includes(
                                                building.id,
                                              )}
                                            />
                                            <ListItemText
                                              primary={building.name}
                                              secondary={
                                                <React.Fragment>
                                                  <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                  >
                                                    {building.building_type ||
                                                      "Standard Building"}
                                                  </Typography>
                                                  {building.description &&
                                                    ` - ${building.description}`}
                                                  {building.flat_limit &&
                                                    ` (Max ${building.flat_limit} flats)`}
                                                </React.Fragment>
                                              }
                                              sx={{
                                                fontFamily:
                                                  "'Roboto', sans-serif",
                                              }}
                                            />
                                          </MenuItem>
                                        ),
                                      )}
                                    </Select>
                                  </FormControl>
                                )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Title */}
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Broadcast Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      variant="outlined"
                      required
                      placeholder="Enter announcement title..."
                      InputProps={{
                        sx: {
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          fontFamily: "'Roboto', sans-serif",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(111, 11, 20, 0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6F0B14",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6F0B14",
                            borderWidth: "2px",
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: {
                          fontFamily: "'Roboto', sans-serif",
                          color: "#6F0B14",
                        },
                      }}
                    />
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      variant="outlined"
                      required
                      multiline
                      rows={6}
                      placeholder="Write your announcement details here..."
                      InputProps={{
                        sx: {
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          fontFamily: "'Roboto', sans-serif",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(111, 11, 20, 0.2)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6F0B14",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#6F0B14",
                            borderWidth: "2px",
                          },
                        },
                      }}
                      InputLabelProps={{
                        sx: {
                          fontFamily: "'Roboto', sans-serif",
                          color: "#6F0B14",
                        },
                      }}
                    />
                  </motion.div>
                </CardContent>
              </StyledCard>

              {/* File Upload Section */}
              <motion.div variants={itemVariants}>
                <StyledCard>
                  <CardContent className="p-6">
                    <Typography
                      variant="h6"
                      className="mb-4 font-semibold text-primary"
                      sx={{ fontFamily: "'Roboto', sans-serif" }}
                    >
                      Attachments (Optional)
                    </Typography>

                    <FileUploadArea
                      isdragging={isDragging.toString()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <CloudUploadIcon className="text-4xl text-primary mb-4" />
                      <Typography
                        variant="body1"
                        className="mb-2 text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {isDragging
                          ? "Drop files here"
                          : "Drag & drop files or click to browse"}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Supports images, PDF, DOC (Max 10MB per file)
                      </Typography>
                      <VisuallyHiddenInput
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                      />
                    </FileUploadArea>

                    {/* File List */}
                    <AnimatePresence>
                      {files.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 space-y-3"
                        >
                          <Typography
                            variant="subtitle2"
                            className="font-medium text-primary"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            Selected Files ({files.length})
                          </Typography>
                          {files.map((file) => (
                            <motion.div
                              key={file.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center justify-between p-3 bg-lightBackground rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="text-primary">
                                  {getFileIcon(file.type)}
                                </div>
                                <div>
                                  <Typography
                                    variant="body2"
                                    className="font-medium"
                                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                                  >
                                    {file.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    className="text-hintText"
                                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                                  >
                                    {formatFileSize(file.size)}
                                  </Typography>
                                </div>
                              </div>
                              <IconButton
                                size="small"
                                onClick={() => removeFile(file.id)}
                                className="text-reject hover:bg-red-50"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </motion.div>

            {/* Right Column - Preview & Send */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Preview Card */}
              <StyledCard>
                <CardContent className="p-6">
                  <Typography
                    variant="h6"
                    className="mb-4 font-semibold text-primary"
                    sx={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    Preview
                  </Typography>

                  <div className="space-y-4">
                    <div>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Selected Societies
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {selectedSocieties.length === 0
                          ? "No societies selected"
                          : `${selectedSocieties.length} societ${
                              selectedSocieties.length !== 1 ? "ies" : "y"
                            } selected`}
                      </Typography>
                    </div>

                    <Divider className="bg-lightBackground" />

                    <div>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Title
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {formData.title || "No title entered"}
                      </Typography>
                    </div>

                    <Divider className="bg-lightBackground" />

                    <div>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Description Preview
                      </Typography>
                      <Typography
                        variant="body2"
                        className="mt-1 line-clamp-4 text-black"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {formData.description || "No description entered"}
                      </Typography>
                    </div>

                    <Divider className="bg-lightBackground" />

                    <div>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Total Destinations
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-medium text-primary"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        {getTotalDestinations()} destination
                        {getTotalDestinations() !== 1 ? "s" : ""}
                      </Typography>
                    </div>

                    <Divider className="bg-lightBackground" />

                    <div>
                      <Typography
                        variant="caption"
                        className="text-hintText"
                        sx={{ fontFamily: "'Roboto', sans-serif" }}
                      >
                        Configuration Summary
                      </Typography>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {selectedSocieties.map((society) => (
                          <div key={society.id} className="text-sm">
                            <Typography
                              sx={{
                                fontFamily: "'Roboto', sans-serif",
                                fontWeight: 500,
                              }}
                            >
                              {society.name}:
                            </Typography>
                            {society.sendTo === "society" ? (
                              <Chip
                                label="Entire Society"
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(111, 11, 20, 0.1)",
                                  color: "#6F0B14",
                                  fontFamily: "'Roboto', sans-serif",
                                  marginTop: "2px",
                                }}
                              />
                            ) : (
                              <div className="mt-1">
                                {society.selectedBuildings.map((buildingId) => {
                                  const building = allBuildings[
                                    society.id
                                  ]?.find((b) => b.id === buildingId);
                                  return building ? (
                                    <Chip
                                      key={buildingId}
                                      label={building.name}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          "rgba(111, 11, 20, 0.1)",
                                        color: "#6F0B14",
                                        fontFamily: "'Roboto', sans-serif",
                                        margin: "2px",
                                      }}
                                    />
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {files.length > 0 && (
                      <>
                        <Divider className="bg-lightBackground" />
                        <div>
                          <Typography
                            variant="caption"
                            className="text-hintText"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            Attachments
                          </Typography>
                          <Typography
                            variant="body2"
                            className="mt-1 text-primary"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                            attached
                          </Typography>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </StyledCard>

              {/* Send Button */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GradientButton
                  fullWidth
                  type="submit"
                  disabled={loading || selectedSocieties.length === 0}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendIcon />
                    )
                  }
                  size="large"
                >
                  {loading
                    ? "Sending..."
                    : formData.scheduleForLater
                      ? "Schedule Broadcast"
                      : `Send to ${getTotalDestinations()} destination${
                          getTotalDestinations() !== 1 ? "s" : ""
                        }`}
                </GradientButton>
              </motion.div>
            </motion.div>
          </div>
        </form>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontFamily: "'Roboto', sans-serif",
            "&.MuiAlert-filledSuccess": {
              backgroundColor: "#008000",
            },
            "&.MuiAlert-filledError": {
              backgroundColor: "#B31B1B",
            },
            "&.MuiAlert-filledWarning": {
              backgroundColor: "#DBA400",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default Broadcast;
