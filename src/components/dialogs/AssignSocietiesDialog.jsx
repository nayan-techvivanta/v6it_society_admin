import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import { Search, Close, LocationOn } from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { motion } from "framer-motion";

const AssignSocietiesDialog = ({ open, onClose, manager, onAssignSuccess }) => {
  const [assignedMap, setAssignedMap] = useState({});
  const [allSocieties, setAllSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSocieties, setSelectedSocieties] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [currentAssigned, setCurrentAssigned] = useState([]);

  useEffect(() => {
    if (open && manager) {
      fetchSocieties();
      fetchAssignedSocieties();
    }
  }, [open, manager]);

  const fetchSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from("societies")
        .select("id, name, address, city, state, country, pincode, is_active")
        .eq("is_active", true)
        .eq("is_delete", false)
        .order("name");

      if (error) throw error;

      setAllSocieties(data || []);
    } catch (err) {
      console.error("Error fetching societies:", err);
      setError("Failed to load societies");
    } finally {
      setLoading(false);
    }
  };

  //   const fetchAssignedSocieties = async () => {
  //     try {
  //       // Fetch already assigned societies
  //       const { data: assignedData, error: assignedError } = await supabase
  //         .from("pm_society")
  //         .select("society_id")
  //         .eq("pm_id", manager.id);

  //       if (assignedError) throw assignedError;

  //       const assignedIds = assignedData.map((item) => item.society_id);
  //       setCurrentAssigned(assignedIds);
  //       setSelectedSocieties(assignedIds);
  //     } catch (err) {
  //       console.error("Error fetching assigned societies:", err);
  //     }
  //   };
  const isAssignedToOtherPM = (societyId) => {
    return (
      manager?.id &&
      assignedMap[societyId] &&
      assignedMap[societyId] !== manager.id
    );
  };

  const fetchAssignedSocieties = async () => {
    try {
      const { data, error } = await supabase
        .from("pm_society")
        .select("society_id, pm_id");

      if (error) throw error;

      const map = {};
      data.forEach((item) => {
        map[item.society_id] = item.pm_id;
      });

      setAssignedMap(map);

      const mySocieties = data
        .filter((item) => item.pm_id === manager.id)
        .map((item) => item.society_id);

      setCurrentAssigned(mySocieties);
      setSelectedSocieties(mySocieties);
    } catch (err) {
      console.error("Error fetching assigned societies:", err);
    }
  };

  const handleToggleSociety = (societyId) => {
    setSelectedSocieties((prev) => {
      if (prev.includes(societyId)) {
        return prev.filter((id) => id !== societyId);
      } else {
        return [...prev, societyId];
      }
    });
  };

  const handleAssignSocieties = async () => {
    if (!manager) return;

    setSaving(true);
    setError(null);

    try {
      // Remove existing assignments
      const { error: deleteError } = await supabase
        .from("pm_society")
        .delete()
        .eq("pm_id", manager.id);

      if (deleteError) throw deleteError;

      // Insert new assignments
      if (selectedSocieties.length > 0) {
        const assignments = selectedSocieties.map((societyId) => ({
          pm_id: manager.id,
          society_id: societyId,
        }));

        const { error: insertError } = await supabase
          .from("pm_society")
          .insert(assignments);

        if (insertError) throw insertError;
      }

      onAssignSuccess?.();
      onClose();
    } catch (err) {
      console.error("Error assigning societies:", err);
      setError("Failed to assign societies. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper function to format location from address fields
  const formatLocation = (society) => {
    const parts = [];
    if (society.address) parts.push(society.address);
    if (society.city) parts.push(society.city);
    if (society.state) parts.push(society.state);
    if (society.country) parts.push(society.country);
    return parts.join(", ");
  };

  const filteredSocieties = allSocieties.filter(
    (society) =>
      society.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (society.address &&
        society.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (society.city &&
        society.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const changesMade = () => {
    const currentSorted = [...currentAssigned].sort();
    const selectedSorted = [...selectedSocieties].sort();
    return JSON.stringify(currentSorted) !== JSON.stringify(selectedSorted);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle className="font-roboto font-semibold border-b">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Assign Societies to {manager?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Search Bar */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
              <TextField
                fullWidth
                placeholder="Search societies by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  {selectedSocieties.length} societies selected
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {filteredSocieties.length} societies found
                </Typography>
              </Box>
            </Box>

            {/* Societies List */}
            <List sx={{ overflow: "auto", maxHeight: 400 }}>
              {filteredSocieties.length === 0 ? (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ p: 3, textAlign: "center" }}
                >
                  No societies found
                </Typography>
              ) : (
                filteredSocieties.map((society) => (
                  <motion.div
                    key={society.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* <ListItem
                      button
                      onClick={() => handleToggleSociety(society.id)}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    > */}
                    <ListItem
                      button={!isAssignedToOtherPM(society.id)}
                      disabled={isAssignedToOtherPM(society.id)}
                      onClick={() => {
                        if (!isAssignedToOtherPM(society.id)) {
                          handleToggleSociety(society.id);
                        }
                      }}
                      sx={{
                        opacity: isAssignedToOtherPM(society.id) ? 0.5 : 1,
                        cursor: isAssignedToOtherPM(society.id)
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Box>
                            <Typography className="font-roboto font-medium">
                              {society.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              <LocationOn
                                fontSize="small"
                                sx={{ color: "text.secondary", fontSize: 16 }}
                              />
                              <Typography className="font-roboto text-sm text-gray-600">
                                {formatLocation(society) ||
                                  "No location specified"}
                              </Typography>
                            </Box>
                          </Box>
                          <Checkbox
                            edge="end"
                            checked={selectedSocieties.includes(society.id)}
                            disabled={isAssignedToOtherPM(society.id)}
                            onChange={() => handleToggleSociety(society.id)}
                            color="primary"
                          />
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          {society.city && (
                            <Chip
                              label={society.city}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                          {society.pincode && (
                            <Chip
                              label={`Pincode: ${society.pincode}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  </motion.div>
                ))
              )}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          className="font-roboto"
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            onClick={handleAssignSocieties}
            variant="contained"
            disabled={!changesMade() || saving}
            className="font-roboto"
            sx={{ textTransform: "none" }}
          >
            {saving ? (
              <CircularProgress size={24} />
            ) : (
              `Save Changes (${selectedSocieties.length})`
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AssignSocietiesDialog;
