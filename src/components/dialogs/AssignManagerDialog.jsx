import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  alpha,
} from "@mui/material";
import { Close, CheckCircle, People } from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import { toast } from "react-toastify";

export default function AssignManagerDialog({
  open,
  onClose,
  society,
  onSuccess,
}) {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // useEffect(() => {
  //   if (!open) return;

  //   const fetchManagers = async () => {
  //     setLoading(true);

  //     const { data, error } = await supabase
  //       .from("users")
  //       .select("id, name")
  //       .eq("role_type", "Manager");

  //     if (error) {
  //       toast.error("Failed to load managers");
  //     } else {
  //       setManagers(data || []);
  //     }

  //     setLoading(false);
  //   };

  //   fetchManagers();
  // }, [open]);
  useEffect(() => {
    if (!open) return;

    const fetchManagers = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("role_type", "Manager");

      if (error) {
        toast.error("Failed to load managers");
      } else {
        setManagers(data || []);

        if (society?.user_id) {
          setSelectedManager(society.user_id);
        }
      }

      setLoading(false);
    };

    fetchManagers();
  }, [open, society]);

  const handleAssign = async () => {
    if (!selectedManager) {
      toast.error("Please select a manager");
      return;
    }

    // Get user ID from localStorage for updated_by
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("User not authenticated. Please login again.");
      return;
    }

    setAssigning(true);

    const { error } = await supabase
      .from("societies")
      .update({
        user_id: selectedManager,
        updated_by: userId,
      })
      .eq("id", society.id);

    if (error) {
      toast.error("Failed to assign manager");
    } else {
      toast.success("Manager assigned successfully");
      onSuccess();
      onClose();
    }

    setAssigning(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        },
      }}
    >
      {/* Header with theme styling */}
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
              <People sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700">
                Assign Property Manager
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, fontSize: "0.875rem" }}
              >
                {society?.name ? `For: ${society.name}` : "Select a manager"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={assigning}
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

      <DialogContent sx={{ p: 3, mt: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress sx={{ color: "#6F0B14" }} />
          </Box>
        ) : (
          <FormControl fullWidth>
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
              Select Manager
            </Typography>

            <Select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 1.5,
                backgroundColor: "white",
                border: "1px solid #E0E0E0",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#6F0B14",
                },
                "&.Mui-focused": {
                  borderColor: "#6F0B14",
                  borderWidth: "1.5px",
                  boxShadow: "0 0 0 3px rgba(111, 11, 20, 0.1)",
                },
                "& .MuiSelect-select": {
                  py: 1.5,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    marginTop: 0.5,
                    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                    maxHeight: 300,
                    "& .MuiMenuItem-root": {
                      py: 1.5,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "rgba(111, 11, 20, 0.05)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "rgba(111, 11, 20, 0.1)",
                        "&:hover": {
                          backgroundColor: "rgba(111, 11, 20, 0.15)",
                        },
                      },
                    },
                  },
                },
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography color="#A29EB6" sx={{ fontStyle: "italic" }}>
                      Choose a manager
                    </Typography>
                  );
                }

                const selectedManagerObj = managers.find(
                  (m) => m.id === selected
                );
                return (
                  <Typography fontWeight={500}>
                    {selectedManagerObj?.name || "Unknown Manager"}
                  </Typography>
                );
              }}
            >
              <MenuItem value="" disabled>
                <Typography color="#A29EB6">Select a manager</Typography>
              </MenuItem>

              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  <Typography>{manager.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      {/* Footer with theme buttons */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          backgroundColor: alpha("#6F0B14", 0.03),
          borderTop: `1px solid ${alpha("#6F0B14", 0.1)}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={assigning}
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
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedManager || assigning}
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
            assigning ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <CheckCircle />
            )
          }
        >
          {assigning ? "Assigning..." : "Assign"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
