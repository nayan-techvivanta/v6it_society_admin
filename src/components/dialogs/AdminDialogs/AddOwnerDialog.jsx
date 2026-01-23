import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Typography,
  Box,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Card,
  CardContent,
  Chip,
  Autocomplete,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import { supabase } from "../../../api/supabaseClient";
import { toast } from "react-toastify";
import { uploadImage } from "../../../api/uploadImage";
import {
  CloudUpload,
  Delete,
  Person,
  FamilyRestroom,
  WhatsApp,
  Phone,
  Email,
  Badge,
  Visibility,
  VisibilityOff,
  Key,
  Close,
  Edit,
  Search,
  CheckCircle,
  PersonAdd,
} from "@mui/icons-material";
import { createUser } from "../../../api/createUser";
import { motion } from "framer-motion";

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function AddOwnerDialog({ open, onClose, flat }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const [existingOwner, setExistingOwner] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    whatsapp_number: "",
    profile_url: "",
    role_type: "Tanent-O",
  });

  const [errors, setErrors] = useState({});

  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Theme colors
  const theme = {
    primary: "#6F0B14",
    textAndTab: "#6F0B14",
    hintText: "#A29EB6",
    button: "#6F0B14",
    lightBackground: "rgba(111, 11, 20, 0.09)",
    trackSelect: "rgba(111, 11, 20, 0.44)",
    darkTrackSelect: "rgba(111, 11, 20, 0.61)",
    success: "#008000",
    reject: "#B31B1B",
  };

  useEffect(() => {
    if (open && flat?.id) {
      checkExistingOwner();
      resetForm();
    }
  }, [open, flat?.id]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      whatsapp_number: "",
      profile_url: null,
      role_type: "Tanent-O",
    });
    setErrors({});
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowPassword(false);
    setIsEditMode(false);
  };

  // const checkExistingOwner = async () => {
  //   setOwnerLoading(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from("users")
  //       .select(
  //         "id, name, email, number, whatsapp_number, profile_url, role_type",
  //       )
  //       .eq("flat_id", flat.id)
  //       .eq("role_type", "Tanent-O")
  //       .eq("is_delete", false)
  //       .limit(1);

  //     if (error) {
  //       console.error("Error checking owner:", error);
  //       return;
  //     }

  //     if (data && data.length > 0) {
  //       setExistingOwner(data[0]);
  //       setFormData((prev) => ({
  //         ...prev,
  //         role_type: "Tanent-M",
  //       }));
  //     } else {
  //       setExistingOwner(null);
  //       setFormData((prev) => ({
  //         ...prev,
  //         role_type: "Tanent-O",
  //       }));
  //     }
  //   } catch (error) {
  //     console.error("Error checking existing owner:", error);
  //   } finally {
  //     setOwnerLoading(false);
  //   }
  // };
  const checkExistingOwner = async () => {
    setOwnerLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_flats")
        .select(`
        user_id,
        users (
          id,
          name,
          email,
          number,
          whatsapp_number,
          profile_url,
          role_type,
          is_delete
        )
      `)
        .eq("flat_id", flat.id)
        .eq("users.role_type", "Tanent-O")
        .eq("users.is_delete", false)
        .limit(1);

      if (error) {
        console.error("❌ Error checking owner:", error);
        return;
      }

      if (data && data.length > 0 && data[0].users) {
        console.log("✅ Existing Tenant-O found:", data[0].users);

        setExistingOwner(data[0].users);

        // Force new user to be Tanent-M
        setFormData((prev) => ({
          ...prev,
          role_type: "Tanent-M",
        }));
      } else {
        console.log("ℹ️ No Tenant-O found");

        setExistingOwner(null);

        setFormData((prev) => ({
          ...prev,
          role_type: "Tanent-O",
        }));
      }
    } catch (error) {
      console.error("❌ Error checking existing owner:", error);
    } finally {
      setOwnerLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!isEditMode && !selectedUser && !formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (!isEditMode && !selectedUser && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // if (!formData.phone.trim()) {
    //   newErrors.phone = "Phone number is required";
    // } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
    //   newErrors.phone = "Enter a valid 10-digit phone number";
    // }

    if (
      formData.whatsapp_number &&
      !/^[0-9]{10}$/.test(formData.whatsapp_number.replace(/\D/g, ""))
    ) {
      newErrors.whatsapp_number = "Enter a valid 10-digit WhatsApp number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    // Format phone numbers to only accept digits
    if (field === "phone" || field === "whatsapp_number") {
      const digits = value.replace(/\D/g, "");
      const formatted = digits.slice(0, 10);
      setFormData({ ...formData, [field]: formatted });

      // Clear error for this field when user types
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    } else if (field === "role_type") {
      // Reset form when role type changes to Tanent-M
      if (value === "Tanent-M" && selectedUser) {
        setSelectedUser(null);
        resetForm();
        setFormData((prev) => ({ ...prev, role_type: value }));
      } else {
        setFormData({ ...formData, [field]: value });
      }
    } else {
      setFormData({ ...formData, [field]: value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleImageUpload(files[0]);
    }
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        profile_url: result.url,
      }));
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_url: "",
    }));
  };


  useEffect(() => {
    const fetchUsers = async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .in("role_type", ["Tanent-O", "Tanent-M"])
          .or(
            `name.ilike.%${debouncedSearchQuery}%,email.ilike.%${debouncedSearchQuery}%,number.ilike.%${debouncedSearchQuery}%`,
          )
          .limit(20);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchQuery]);

  const handleUserSelect = (event, newValue) => {
    setSelectedUser(newValue);
    if (newValue) {
      setFormData({
        name: newValue.name || "",
        email: newValue.email || "",
        password: "",
        phone: newValue.number || "",
        whatsapp_number: newValue.whatsapp_number || "",
        profile_url: newValue.profile_url ?? null,

        role_type: formData.role_type,
      });
      setErrors({});
    } else {
      resetForm();
    }
  };

  const updateMemberUser = async ({ registedUserId }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) throw new Error("Admin not authenticated");

    const payload = {
      flat_id: flat.id,
      building_id: flat.building_id,
      society_id: flat.society_id,
      profile_url:
        formData.profile_url && formData.profile_url.trim() !== ""
          ? formData.profile_url
          : null,

      created_by: user.id,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    console.log("🧾 User update payload:", payload);

    const { error } = await supabase
      .from("users")
      .update(payload)
      .eq("registed_user_id", registedUserId);

    if (error) throw error;
  };

  const handleEditOwner = () => {
    if (existingOwner) {
      setIsEditMode(true);
      setSelectedUser(existingOwner);
      setFormData({
        name: existingOwner.name,
        email: existingOwner.email,
        password: "",
        phone: existingOwner.number,
        whatsapp_number: existingOwner.whatsapp_number || "",
        profile_url: existingOwner.profile_url || "",
        role_type: existingOwner.role_type,
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (isEditMode) {
      await handleUpdateUser(existingOwner.id);
    } else {
      await handleAddUser();
    }
  };


  const handleAddUser = async () => {
    try {
      console.group("🚀 handleAddUser START");
      setLoading(true);

      // ===============================
      // 1️⃣ Flat validation
      // ===============================
      console.log("🏠 Flat data:", flat);

      if (!flat?.id || !flat?.building_id || !flat?.society_id) {
        throw new Error("Flat data missing");
      }

      // ===============================
      // 2️⃣ Admin auth check
      // ===============================
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      console.log("🔐 Admin auth user:", adminUser);

      if (!adminUser?.id) {
        throw new Error("Admin not authenticated");
      }

      let appUserId; // BIGINT (users.id)

      // ===============================
      // 3️⃣ Existing user selected
      // ===============================
      if (selectedUser) {
        console.log("👤 Existing user selected:", selectedUser);

        appUserId = selectedUser.id; // BIGINT
        console.log("✅ Using existing appUserId:", appUserId);
      } else {
        // ===============================
        // 4️⃣ Create NEW auth user
        // ===============================

        const apiResult = await createUser({
          name: formData.name?.trim(),
          email: formData.email?.trim(),
          password: formData.password || "",
          contact: formData.phone,
          whatsapp: formData.whatsapp_number || formData.phone,
          role_type: formData.role_type,
        });


        const authUserId = apiResult?.user_id; // UUID

        if (!authUserId) {
          throw new Error("Auth user ID not returned from createUser API");
        }

        // ===============================
        // 5️⃣ Check if user already exists
        // ===============================
        const { data: existingUser, error: existingUserError } = await supabase
          .from("users")
          .select("id")
          .eq("registed_user_id", authUserId)
          .maybeSingle();

        if (existingUserError) {
          console.error("❌ Existing user check error:", existingUserError);
          throw existingUserError;
        }


        if (existingUser) {
          console.log("♻️ App user exists, updating profile");

          const updatePayload = {
            name: formData.name?.trim(),
            email: formData.email?.trim(),
            number: formData.phone,
            whatsapp_number: formData.whatsapp_number || formData.phone,
            profile_url:
              formData.profile_url && formData.profile_url.trim() !== ""
                ? formData.profile_url
                : null,
            created_by: adminUser.id,
            updated_at: new Date().toISOString(),
          };

          await supabase
            .from("users")
            .update(updatePayload)
            .eq("id", existingUser.id);

          appUserId = existingUser.id;
        } else {
          // ===============================
          // 6️⃣ Insert into users table
          // ===============================
          const userInsertPayload = {
            registed_user_id: authUserId, // UUID
            name: formData.name?.trim(),
            email: formData.email?.trim(),
            number: formData.phone,
            whatsapp_number: formData.whatsapp_number || formData.phone,
            role_type: formData.role_type,
            society_id: flat.society_id,
            profile_url:
              formData.profile_url && formData.profile_url.trim() !== ""
                ? formData.profile_url
                : null,
            created_by: adminUser.id, // UUID
          };

          console.log("📥 Inserting into users table:", userInsertPayload);

          const { data: appUser, error: userError } = await supabase
            .from("users")
            .insert(userInsertPayload)
            .select()
            .single();

          if (userError) {
            console.error("❌ users insert error:", userError);
            throw userError;
          }

          console.log("✅ User inserted into users table:", appUser);
          appUserId = appUser.id; // BIGINT
        }
      }

      // ===============================
      // 7️⃣ Insert into user_flats
      // ===============================
      const userFlatsPayload = {
        user_id: appUserId, // BIGINT
        society_id: flat.society_id,
        building_id: flat.building_id,
        flat_id: flat.id,
      };

      console.log("📥 Inserting into user_flats:", userFlatsPayload);

      const { error: userFlatError } = await supabase
        .from("user_flats")
        .insert(userFlatsPayload);

      if (userFlatError) {
        console.error("❌ user_flats insert error:", userFlatError);
        throw userFlatError;
      }

      console.log("✅ user_flats insert successful");

      // ===============================
      // 8️⃣ Success UI
      // ===============================
      toast.success(
        formData.role_type === "Tanent-O"
          ? "Primary owner assigned successfully"
          : "Family member assigned successfully"
      );

      resetForm();
      onClose();

      console.groupEnd();
    } catch (error) {
      console.groupEnd();
      console.error("❌ Add user error:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateUser = async (userId) => {
    try {
      setLoading(true);

      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      if (!adminUser?.id) throw new Error("Admin not authenticated");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        number: formData.phone,
        whatsapp_number: formData.whatsapp_number || formData.phone,
        profile_url: formData.profile_url || null,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("users")
        .update(payload)
        .eq("id", userId);

      if (error) throw error;

      toast.success("User updated successfully");
      await checkExistingOwner();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          minHeight: "600px",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.lightBackground,
          borderBottom: `2px solid ${theme.trackSelect}`,
          py: 2.5,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Box
              sx={{
                bgcolor: theme.primary,
                color: "white",
                p: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${theme.primary}40`,
              }}
            >
              {isEditMode ? (
                <Edit sx={{ fontSize: 28 }} />
              ) : formData.role_type === "Tanent-O" ? (
                <Person sx={{ fontSize: 28 }} />
              ) : (
                <FamilyRestroom sx={{ fontSize: 28 }} />
              )}
            </Box>
          </motion.div>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.textAndTab,
                fontFamily: "'Roboto', sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              {isEditMode
                ? "Edit Owner Details"
                : formData.role_type === "Tanent-O"
                  ? "Add Primary Owner"
                  : "Add Family Member"}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={0.5}>
              <Chip
                label={`Flat ${flat?.flat_number}`}
                size="small"
                sx={{
                  bgcolor: theme.trackSelect,
                  color: "white",
                  fontWeight: 600,
                  fontFamily: "'Roboto', sans-serif",
                  height: 24,
                }}
              />
              <Chip
                label={`Floor ${flat?.floor_number || "N/A"}`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: theme.trackSelect,
                  color: theme.textAndTab,
                  fontWeight: 500,
                  fontFamily: "'Roboto', sans-serif",
                  height: 24,
                }}
              />
              {selectedUser && (
                <Chip
                  label="Existing User Selected"
                  size="small"
                  color="success"
                  icon={<CheckCircle sx={{ fontSize: 14 }} />}
                  sx={{
                    fontWeight: 500,
                    fontFamily: "'Roboto', sans-serif",
                    height: 24,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.textAndTab,
            "&:hover": {
              backgroundColor: theme.lightBackground,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box p={3}>
          {ownerLoading ? (
            <Box display="flex" justifyContent="center" p={6}>
              <CircularProgress sx={{ color: theme.primary }} size={40} />
            </Box>
          ) : existingOwner && !isEditMode ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  bgcolor: `${theme.trackSelect}15`,
                  color: theme.textAndTab,
                  border: `1px solid ${theme.trackSelect}`,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    color: theme.textAndTab,
                  },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontFamily: "'Roboto', sans-serif",
                        mb: 0.5,
                      }}
                    >
                      <Box component="span" sx={{ color: theme.primary }}>
                        ✓
                      </Box>{" "}
                      Primary Owner Exists
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={existingOwner.profile_url}
                        sx={{
                          width: 32,
                          height: 32,
                          border: `2px solid ${theme.primary}`,
                        }}
                      >
                        {existingOwner.name?.charAt(0)}
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {existingOwner.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.hintText,
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        ({existingOwner.email})
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Edit />}
                    onClick={handleEditOwner}
                    sx={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      fontWeight: 500,
                      fontFamily: "'Roboto', sans-serif",
                      textTransform: "none",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: theme.darkTrackSelect,
                        backgroundColor: theme.lightBackground,
                      },
                    }}
                  >
                    Edit Owner
                  </Button>
                </Box>
              </Alert>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  bgcolor: `${theme.primary}08`,
                  color: theme.textAndTab,
                  border: `1px solid ${theme.primary}40`,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    color: theme.primary,
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {isEditMode
                    ? "Editing primary owner details"
                    : formData.role_type === "Tanent-O"
                      ? "Select an existing user or create a new one for Primary Owner"
                      : "Add a new family member for this flat"}
                </Typography>
              </Alert>
            </motion.div>
          )}

          <Grid container spacing={3}>
            {/* Left Column - User Selection & Role */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <Stack spacing={3}>
                  {/* User Selection (Only for Tanent-O) */}
                  {!isEditMode && formData.role_type === "Tanent-O" && (
                    <Card
                      sx={{
                        border: `2px solid ${theme.trackSelect}`,
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: `0 4px 20px ${theme.trackSelect}15`,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            mb: 2,
                            color: theme.textAndTab,
                            fontWeight: 600,
                            fontFamily: "'Roboto', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              bgcolor: theme.primary,
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                            }}
                          >
                            1
                          </Box>
                          Select User
                        </Typography>

                        {selectedUser ? (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                border: `2px solid ${theme.success}40`,
                                borderRadius: 2,
                                bgcolor: `${theme.success}08`,
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  src={selectedUser.profile_url}
                                  sx={{ width: 48, height: 48 }}
                                >
                                  {selectedUser.name?.charAt(0)}
                                </Avatar>
                                <Box flex={1}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                  >
                                    {selectedUser.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {selectedUser.number} • {selectedUser.email}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={handleClearSelection}
                                  sx={{
                                    color: theme.reject,
                                    "&:hover": {
                                      backgroundColor: `${theme.reject}15`,
                                    },
                                  }}
                                >
                                  <Close />
                                </IconButton>
                              </Box>
                              <Button
                                fullWidth
                                variant="outlined"
                                size="small"
                                onClick={handleClearSelection}
                                sx={{
                                  mt: 2,
                                  borderColor: theme.trackSelect,
                                  color: theme.textAndTab,
                                  textTransform: "none",
                                }}
                              >
                                Select Different User
                              </Button>
                            </Paper>
                          </motion.div>
                        ) : (
                          // <Autocomplete
                          //   options={searchResults}
                          //   loading={searchLoading}
                          //   getOptionLabel={(option) =>
                          //     `${option.name} (${option.number})`
                          //   }
                          //   onInputChange={(e, query) => setSearchQuery(query)}
                          //   onChange={handleUserSelect}
                          //   renderOption={(props, option) => (
                          //     <li {...props} style={{ padding: "10px 16px" }}>
                          //       <Box display="flex" alignItems="center" gap={2}>
                          //         <Avatar
                          //           src={option.profile_url}
                          //           sx={{ width: 36, height: 36 }}
                          //         >
                          //           {option.name?.charAt(0)}
                          //         </Avatar>
                          //         <Box>
                          //           <Typography
                          //             variant="body2"
                          //             fontWeight={500}
                          //           >
                          //             {option.name}
                          //           </Typography>
                          //           <Typography
                          //             variant="caption"
                          //             color="text.secondary"
                          //           >
                          //             {option.email} • {option.number}
                          //           </Typography>
                          //         </Box>
                          //       </Box>
                          //     </li>
                          //   )}
                          //   renderInput={(params) => (
                          //     <TextField
                          //       {...params}
                          //       placeholder="Search existing users..."
                          //       variant="outlined"
                          //       size="small"
                          //       InputProps={{
                          //         ...params.InputProps,
                          //         startAdornment: (
                          //           <InputAdornment position="start">
                          //             <Search sx={{ color: theme.hintText }} />
                          //           </InputAdornment>
                          //         ),
                          //       }}
                          //       sx={{
                          //         "& .MuiOutlinedInput-root": {
                          //           borderRadius: 2,
                          //           backgroundColor: theme.lightBackground,
                          //         },
                          //       }}
                          //     />
                          //   )}
                          //   noOptionsText={
                          //     <Box sx={{ p: 2, textAlign: "center" }}>
                          //       <Typography
                          //         variant="body2"
                          //         color="text.secondary"
                          //       >
                          //         {searchQuery.length < 2
                          //           ? "Type at least 2 characters"
                          //           : "No users found"}
                          //       </Typography>
                          //     </Box>
                          //   }
                          // />
                          <Autocomplete
                            options={searchResults}
                            loading={searchLoading}
                            /* 🔹 Avoid MUI warning + stable key */
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            /* 🔹 Safe label (number optional) */
                            getOptionLabel={(option) =>
                              option?.name
                                ? `${option.name}${option.number ? ` (${option.number})` : ""}`
                                : ""
                            }
                            /* 🔹 Search input */
                            onInputChange={(e, query) => setSearchQuery(query)}
                            /* 🔹 Selected user */
                            onChange={handleUserSelect}
                            /* 🔹 Custom option UI */
                            renderOption={(props, option) => (
                              <li
                                {...props}
                                key={option.id}
                                style={{ padding: "10px 16px" }}
                              >
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar
                                    src={option.profile_url || ""}
                                    sx={{ width: 36, height: 36 }}
                                  >
                                    {option.name?.charAt(0)?.toUpperCase() ||
                                      "U"}
                                  </Avatar>

                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                      noWrap
                                    >
                                      {option.name || "Unnamed User"}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      noWrap
                                    >
                                      {option.email || "No email"}
                                      {option.number
                                        ? ` • ${option.number}`
                                        : ""}
                                    </Typography>
                                  </Box>
                                </Box>
                              </li>
                            )}
                            /* 🔹 Input field */
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Search existing users..."
                                variant="outlined"
                                size="small"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Search sx={{ color: theme.hintText }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                    backgroundColor: theme.lightBackground,
                                  },
                                }}
                              />
                            )}
                            /* 🔹 No data text */
                            noOptionsText={
                              <Box sx={{ p: 2, textAlign: "center" }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {searchQuery.length < 2
                                    ? "Type at least 2 characters"
                                    : "No users found"}
                                </Typography>
                              </Box>
                            }
                          />
                        )}

                        <Typography
                          variant="caption"
                          sx={{
                            mt: 2,
                            display: "block",
                            color: theme.hintText,
                            fontFamily: "'Roboto', sans-serif",
                          }}
                        >
                          Search for existing users in the society or create a
                          new user below
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {/* Role Selection */}
                  <Card
                    sx={{
                      border: `2px solid ${theme.trackSelect}`,
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: `0 4px 20px ${theme.trackSelect}15`,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 2,
                          color: theme.textAndTab,
                          fontWeight: 600,
                          fontFamily: "'Roboto', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: theme.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          {formData.role_type === "Tanent-O" && !selectedUser
                            ? 2
                            : 1}
                        </Box>
                        Role Type
                      </Typography>

                      <FormControl fullWidth>
                        <InputLabel
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            color: theme.hintText,
                          }}
                        >
                          Select Role
                        </InputLabel>
                        <Select
                          value={formData.role_type}
                          onChange={handleChange("role_type")}
                          label="Select Role"
                          disabled={!!existingOwner || isEditMode}
                          sx={{
                            fontFamily: "'Roboto', sans-serif",
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.trackSelect,
                              borderWidth: 2,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.primary,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: theme.primary,
                              borderWidth: 2,
                            },
                            borderRadius: 2,
                          }}
                        >
                          <MenuItem
                            value="Tanent-O"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>
                                Tanent-O (Primary Owner)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.hintText }}
                              >
                                Main resident - One per flat
                              </Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem
                            value="Tanent-M"
                            sx={{ fontFamily: "'Roboto', sans-serif" }}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 500 }}>
                                Tanent-M (Family Member)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.hintText }}
                              >
                                Additional resident - Multiple allowed
                              </Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>

                      <Alert
                        severity="info"
                        sx={{
                          mt: 2,
                          py: 0.5,
                          bgcolor: `${theme.primary}08`,
                          "& .MuiAlert-icon": { fontSize: 16 },
                        }}
                      >
                        <Typography variant="caption">
                          {formData.role_type === "Tanent-O"
                            ? "Primary owner can be an existing user or new user"
                            : "Family members must be created as new users"}
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Profile Image */}
                  <Card
                    sx={{
                      border: `2px solid ${theme.trackSelect}`,
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: `0 4px 20px ${theme.trackSelect}15`,
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          mb: 2,
                          color: theme.textAndTab,
                          fontWeight: 600,
                          fontFamily: "'Roboto', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: theme.primary,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                          }}
                        >
                          {formData.role_type === "Tanent-O" && !selectedUser
                            ? 3
                            : 2}
                        </Box>
                        Profile Image
                      </Typography>

                      <Box
                        sx={{
                          border: `2px dashed ${dragging ? theme.primary : theme.trackSelect
                            }`,
                          borderRadius: 2,
                          p: 3,
                          textAlign: "center",
                          backgroundColor: dragging
                            ? theme.lightBackground
                            : "transparent",
                          cursor: "pointer",
                          position: "relative",
                          "&:hover": {
                            borderColor: theme.primary,
                            backgroundColor: theme.lightBackground,
                          },
                        }}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileInput}
                          accept="image/*"
                          style={{ display: "none" }}
                        />

                        {formData.profile_url ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Box position="relative" display="inline-block">
                              <Avatar
                                src={formData.profile_url}
                                sx={{
                                  width: 100,
                                  height: 100,
                                  border: `3px solid ${theme.primary}30`,
                                }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  backgroundColor: theme.reject,
                                  color: "white",
                                  "&:hover": {
                                    backgroundColor: theme.reject,
                                  },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage();
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </motion.div>
                        ) : (
                          <Box>
                            <CloudUpload
                              sx={{
                                fontSize: 40,
                                color: theme.hintText,
                                mb: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.hintText,
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              {uploadingImage ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <CircularProgress
                                    size={20}
                                    sx={{ color: theme.primary }}
                                  />
                                  Uploading...
                                </Box>
                              ) : (
                                "Click or drag to upload"
                              )}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Stack>
              </motion.div>
            </Grid>

            {/* Right Column - Form Fields */}
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card
                  sx={{
                    border: `2px solid ${theme.trackSelect}`,
                    borderRadius: 3,
                    overflow: "hidden",
                    height: "100%",
                    boxShadow: `0 4px 20px ${theme.trackSelect}15`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 3,
                        color: theme.textAndTab,
                        fontWeight: 600,
                        fontFamily: "'Roboto', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: theme.primary,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                        }}
                      >
                        {formData.role_type === "Tanent-O" && !selectedUser
                          ? 4
                          : 2}
                      </Box>
                      Personal Information
                    </Typography>

                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <TextField
                          label="Full Name"
                          fullWidth
                          value={formData.name}
                          onChange={handleChange("name")}
                          error={!!errors.name}
                          helperText={errors.name}
                          required
                          disabled={!!selectedUser}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Badge sx={{ color: theme.primary }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Email Address"
                          fullWidth
                          type="email"
                          value={formData.email}
                          onChange={handleChange("email")}
                          error={!!errors.email}
                          helperText={errors.email}
                          required
                          disabled={!!selectedUser}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: theme.primary }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                      </Grid>

                      {/* Password Field (only for new users) */}
                      {!isEditMode && !selectedUser && (
                        <Grid item xs={12}>
                          <TextField
                            label="Password"
                            fullWidth
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange("password")}
                            error={!!errors.password}
                            helperText={
                              errors.password || "Minimum 6 characters"
                            }
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Key sx={{ color: theme.primary }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                    size="small"
                                    sx={{ color: theme.primary }}
                                  >
                                    {showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "& fieldset": {
                                  borderColor: theme.trackSelect,
                                  borderWidth: 2,
                                },
                              },
                            }}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          fullWidth
                          value={formData.phone}
                          onChange={handleChange("phone")}
                          error={!!errors.phone}
                          helperText={errors.phone || "10 digits"}
                          required
                          disabled={!!selectedUser}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone sx={{ color: theme.primary }} />
                              </InputAdornment>
                            ),
                            inputProps: { maxLength: 10 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="WhatsApp Number"
                          fullWidth
                          value={formData.whatsapp_number}
                          onChange={handleChange("whatsapp_number")}
                          error={!!errors.whatsapp_number}
                          helperText={
                            errors.whatsapp_number || "Optional - 10 digits"
                          }
                          disabled={!!selectedUser}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WhatsApp sx={{ color: "#25D366" }} />
                              </InputAdornment>
                            ),
                            inputProps: { maxLength: 10 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              "& fieldset": {
                                borderColor: theme.trackSelect,
                                borderWidth: 2,
                              },
                            },
                          }}
                        />
                      </Grid>

                      {/* Status Display */}
                      <Grid item xs={12}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2.5,
                              bgcolor: theme.lightBackground,
                              borderRadius: 2,
                              borderColor: theme.trackSelect,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: theme.textAndTab,
                                fontWeight: 600,
                                mb: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                component="span"
                                sx={{ color: theme.primary, fontSize: 18 }}
                              >
                                ⓘ
                              </Box>
                              Current Status
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Chip
                                label={
                                  formData.role_type === "Tanent-O"
                                    ? "Primary Owner"
                                    : "Family Member"
                                }
                                size="small"
                                sx={{
                                  bgcolor:
                                    formData.role_type === "Tanent-O"
                                      ? `${theme.primary}15`
                                      : `${theme.trackSelect}15`,
                                  color:
                                    formData.role_type === "Tanent-O"
                                      ? theme.primary
                                      : theme.textAndTab,
                                  fontWeight: 500,
                                }}
                              />
                              {selectedUser ? (
                                <Chip
                                  label="Using Existing User"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  icon={<Person sx={{ fontSize: 14 }} />}
                                />
                              ) : (
                                <Chip
                                  label="Creating New User"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  icon={<PersonAdd sx={{ fontSize: 14 }} />}
                                />
                              )}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.hintText,
                                display: "block",
                                mt: 1.5,
                                lineHeight: 1.6,
                              }}
                            >
                              {formData.role_type === "Tanent-O"
                                ? "Primary owner has full access and management rights for this flat."
                                : "Family members have limited access and are linked to the primary owner."}
                            </Typography>
                          </Paper>
                        </motion.div>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          bgcolor: theme.lightBackground,
          borderTop: `2px solid ${theme.trackSelect}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          startIcon={<Close />}
          sx={{
            fontFamily: "'Roboto', sans-serif",
            textTransform: "none",
            fontWeight: 600,
            borderColor: theme.trackSelect,
            color: theme.textAndTab,
            borderRadius: 2,
            px: 4,
            py: 1,
            "&:hover": {
              borderColor: theme.primary,
              bgcolor: `${theme.primary}08`,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || uploadingImage}
          startIcon={
            loading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : null
          }
          sx={{
            fontFamily: "'Roboto', sans-serif",
            textTransform: "none",
            fontWeight: 600,
            bgcolor: theme.button,
            borderRadius: 2,
            px: 5,
            py: 1,
            "&:hover": {
              bgcolor: theme.darkTrackSelect,
            },
          }}
        >
          {loading
            ? "Processing..."
            : isEditMode
              ? "Update Owner"
              : formData.role_type === "Tanent-O"
                ? selectedUser
                  ? "Assign as Owner"
                  : "Create New Owner"
                : "Add Family Member"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
