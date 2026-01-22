import React, { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { uploadImage } from "../api/uploadImage";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Avatar,
  IconButton,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LockResetIcon from "@mui/icons-material/LockReset";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";
import InputAdornment from "@mui/material/InputAdornment";

import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

// Match project theme from tailwind.config.js
const themeColors = {
  primary: "#6F0B14",
  secondary: "#6F0B14", // using primary as textAndTab
  hint: "#A29EB6",
  lightBg: "rgba(111, 11, 20, 0.09)",
  trackSelect: "rgba(111, 11, 20, 0.44)",
  white: "#FFFFFF",
  error: "#B31B1B",
  success: "#008000",
};

const VisuallyHiddenInput = styled("input", {
  shouldForwardProp: (prop) =>
    prop !== "is_active" && prop !== "is_delete" && !prop.startsWith("aria-"),
})({
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


const InputField = ({ icon, label, name, value, isEditing, onChange, profileValue, type = "text" }) => (
  <Box className="space-y-2">
    <Box className="flex items-center gap-2 mb-1">
      {React.cloneElement(icon, { sx: { color: themeColors.hint, fontSize: 18 } })}
      <Typography variant="caption" className="font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </Typography>
    </Box>
    {isEditing ? (
      <TextField
        fullWidth
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        variant="outlined"
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white",
            "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
            "&:hover fieldset": { borderColor: themeColors.primary },
            "&.Mui-focused fieldset": { borderColor: themeColors.primary, borderWidth: 1.5 },
          },
        }}
      />
    ) : (
      <Paper elevation={0} className="p-3.5 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
        <Typography className="font-medium text-gray-800 break-all">
          {profileValue || <span className="text-gray-400 italic">Not provided</span>}
        </Typography>
      </Paper>
    )}
  </Box>
);

const ReadOnlyField = ({ icon, label, value, bg = "bg-white" }) => (
  <Box className="space-y-2">
    <Box className="flex items-center gap-2 mb-1">
      {React.cloneElement(icon, { sx: { color: themeColors.hint, fontSize: 18 } })}
      <Typography variant="caption" className="font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </Typography>
    </Box>
    <Paper elevation={0} className={`p-3.5 border border-gray-200 rounded-lg ${bg}`}>
      <Typography className="font-medium text-gray-800">
        {value}
      </Typography>
    </Paper>
  </Box>
);

export default function CommonProfile() {
  const [profile, setProfile] = useState(null);
  const [editableProfile, setEditableProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId) {
        toast.error("User not found. Please login again.");
        return;
      }

      // Fetch user data from users table using registed_user_id
      const { data: userData, error } = await supabase
        .from("users")
        .select(
          `
          *,
          society:society_id (name),
          building:building_id (name),
          flat:flat_id (flat_number)
        `,
        )
        .eq("registed_user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        // Fallback to local storage if user not found in users table
        const email = localStorage.getItem("email");
        const name = localStorage.getItem("name");
        const profileId = localStorage.getItem("profileId");
        const role = localStorage.getItem("role");
        const societyId = localStorage.getItem("societyId");

        if (email && role && userId) {
          const fallbackProfile = {
            email,
            name,
            profileId,
            role: role_type || role,
            userId,
            registed_user_id: userId,
            society_id: societyId,
            profile_url: null,
            number: null,
            whatsapp_number: null,
            building_id: null,
            flat_id: null,
            move_in_date: null,
            move_out_date: null,
            is_active: true,
            is_delete: false,
          };
          setProfile(fallbackProfile);
          setEditableProfile(fallbackProfile);
          setImagePreview(fallbackProfile.profile_url || "");
        }
        return;
      }

      if (userData) {
        // Format dates if they exist
        const formattedUserData = {
          ...userData,
          move_in_date: userData.move_in_date
            ? new Date(userData.move_in_date).toLocaleDateString()
            : null,
          move_out_date: userData.move_out_date
            ? new Date(userData.move_out_date).toLocaleDateString()
            : null,
          society_name: userData.society?.name,
          building_name: userData.building?.name,
          flat_number: userData.flat?.flat_number,
        };

        setProfile(formattedUserData);
        setEditableProfile(formattedUserData);

        if (userData.profile_url) {
          setImagePreview(userData.profile_url);
          localStorage.setItem("profileImage", userData.profile_url);
          window.dispatchEvent(new Event("profileImageUpdated"));
        }

        // Normalize role before saving (SAME AS LOGIN)
        let role = (userData.role_type || "").toLowerCase();
        if (role === "super") role = "superadmin";
        if (role === "manager") role = "propertymanager";

        // Update local storage with fresh data
        localStorage.setItem("email", userData.email || "");
        localStorage.setItem("name", userData.name || "");
        localStorage.setItem("profileId", userData.id || "");
        localStorage.setItem("role", role);
        localStorage.setItem("societyId", userData.society_id || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !profile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);

      const result = await uploadImage(selectedFile);

      // Update profile_url in users table
      const { error: updateError } = await supabase
        .from("users")
        .update({
          profile_url: result.url,
          updated_at: new Date().toISOString(),
        })
        .eq("registed_user_id", profile.registed_user_id || profile.userId);

      if (updateError) throw updateError;

      // Update local state
      const updatedProfile = {
        ...profile,
        profile_url: result.url,
      };
      setProfile(updatedProfile);
      setEditableProfile(updatedProfile);
      localStorage.setItem("profileImage", result.url);
      window.dispatchEvent(new Event("profileImageUpdated"));

      setSelectedFile(null);
      toast.success("Profile image updated successfully!");

      fetchProfile(); // Refresh data
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Prepare data for update (only updatable fields)
      const updateData = {
        name: editableProfile.name,
        email: editableProfile.email,
        number: editableProfile.number,
        whatsapp_number: editableProfile.whatsapp_number,
        updated_at: new Date().toISOString(),
      };

      // Update in users table
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("registed_user_id", profile.registed_user_id || profile.userId);

      if (updateError) throw updateError;

      // Update local state and localStorage
      const updatedProfile = { ...profile, ...updateData };
      setProfile(updatedProfile);

      localStorage.setItem("email", updateData.email || "");
      localStorage.setItem("name", updateData.name || "");

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
    setShowPassword({
      newPassword: false,
      confirmPassword: false,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = passwordData;

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);

      const registedUserId = profile.registed_user_id || profile.userId;

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Session expired. Please login again.");
      }

      const res = await fetch(
        "https://zxoflhvhnepjkdihuyqe.supabase.co/functions/v1/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            registed_user_id: registedUserId,
            new_password: newPassword,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to change password",
        );
      }

      toast.success("Password changed successfully. Please login again.");

      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
          localStorage.clear();
          window.location.href = "/login";
        } catch (logoutError) {
          console.error("Logout error:", logoutError);
          window.location.href = "/login";
        }
      }, 2000);
    } catch (err) {
      console.error("Password change error:", err);
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center min-h-[80vh]">
        <CircularProgress size={60} thickness={4} sx={{ color: themeColors.primary }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box className="flex justify-center items-center min-h-[80vh] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full shadow-xl rounded-2xl overflow-hidden">
            <Box className="h-2" sx={{ background: `linear-gradient(to right, ${themeColors.primary}, #4A040A)` }} />
            <CardContent className="p-8 text-center space-y-6">
              <Typography variant="h5" className="font-bold text-gray-800">
                Session Expired
              </Typography>
              <Typography color="textSecondary">
                We couldn't load your profile. Please log in again to continue.
              </Typography>
              <Button
                variant="contained"
                href="/login"
                fullWidth
                size="large"
                sx={{
                  bgcolor: themeColors.primary,
                  "&:hover": { bgcolor: themeColors.secondary },
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "1rem"
                }}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-roboto"
    >
      {/* HEADER SECTION */}
      <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Box className="flex items-center gap-4">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: themeColors.lightBg,
              color: themeColors.primary,
              "&:hover": { bgcolor: "rgba(111, 11, 20, 0.15)" },
              transition: "all 0.2s"
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" className="font-bold text-gray-900">
              Profile Settings
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mt-1">
              Manage your personal information and account security
            </Typography>
          </Box>
        </Box>

        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            sx={{
              color: themeColors.primary,
              borderColor: themeColors.primary,
              borderWidth: 2,
              borderRadius: "10px",
              padding: "8px 24px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderWidth: 2,
                borderColor: "#5A0910",
                bgcolor: themeColors.lightBg
              }
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <Box className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditableProfile(profile);
              }}
              sx={{
                color: themeColors.hint,
                textTransform: "none",
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
              sx={{
                bgcolor: themeColors.primary,
                borderRadius: "10px",
                padding: "8px 32px",
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(111, 11, 20, 0.39)",
                "&:hover": {
                  bgcolor: themeColors.secondary,
                  boxShadow: "0 6px 20px 0 rgba(111, 11, 20, 0.23)"
                }
              }}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN - Avatar & Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Box className="space-y-6">
            {/* Profile Card */}
            <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-visible">
              <Box className="h-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-2xl relative">
                <Box className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <Box className="relative group">
                    <Avatar
                      src={imagePreview}
                      sx={{
                        width: 128,
                        height: 128,
                        border: `4px solid ${themeColors.white}`,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        fontSize: "3rem",
                        bgcolor: themeColors.primary
                      }}
                    >
                      {profile.name?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <IconButton
                      component="label"
                      className="absolute bottom-0 right-0 shadow-lg transform translate-x-1/4 translate-y-1/4 transition-transform hover:scale-110"
                      sx={{
                        bgcolor: themeColors.primary,
                        color: "white",
                        "&:hover": { bgcolor: themeColors.secondary },
                        width: 42,
                        height: 42
                      }}
                    >
                      <EditIcon fontSize="small" />
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
              <CardContent className="pt-20 pb-8 px-6 text-center">
                <Typography variant="h5" className="font-bold text-gray-900 mb-1">
                  {profile.name || "User"}
                </Typography>
                <Typography variant="body2" className="text-gray-500 mb-6 font-medium bg-gray-100 py-1 px-3 rounded-full inline-block uppercase tracking-wider text-xs">
                  {profile.role_type || profile.role || "Role"}
                </Typography>

                <Box className="space-y-3 mt-4">
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4"
                    >
                      <Typography variant="caption" className="block text-gray-600 mb-3 truncate">
                        Selected: {selectedFile.name}
                      </Typography>
                      <Box className="flex gap-2">
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleImageUpload}
                          disabled={uploadingImage}
                          size="small"
                          sx={{
                            bgcolor: themeColors.primary,
                            textTransform: "none",
                            "&:hover": { bgcolor: themeColors.secondary }
                          }}
                        >
                          {uploadingImage ? "Uploading..." : "Confirm Upload"}
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => {
                            setSelectedFile(null);
                            setImagePreview(profile.profile_url || "");
                          }}
                          size="small"
                          sx={{
                            color: themeColors.primary,
                            borderColor: themeColors.primary,
                            textTransform: "none"
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </motion.div>
                  )}

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<LockResetIcon />}
                    onClick={handleOpenDialog}
                    sx={{
                      color: themeColors.primary,
                      borderColor: "rgba(111, 11, 20, 0.3)",
                      borderRadius: "10px",
                      py: 1.5,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: themeColors.primary,
                        bgcolor: themeColors.lightBg
                      }
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Society Info Card (If applicable) */}
            {(profile.society_name || profile.building_name) && (
              <Card className="rounded-2xl shadow-sm border border-gray-100 p-2">
                <CardContent className="p-4 space-y-4">
                  <Typography variant="subtitle1" className="font-bold mb-4 flex items-center gap-2">
                    <BusinessIcon sx={{ color: themeColors.primary }} />
                    Residence Details
                  </Typography>

                  {profile.society_name && (
                    <Box className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <ApartmentIcon sx={{ color: themeColors.hint, fontSize: 22, mt: 0.3 }} />
                      <Box>
                        <Typography variant="caption" className="text-gray-500 font-medium uppercase tracking-wide">
                          Society
                        </Typography>
                        <Typography variant="body2" className="font-semibold text-gray-800">
                          {profile.society_name}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box className="grid grid-cols-2 gap-3">
                    {profile.building_name && (
                      <Box className="p-3 rounded-lg bg-gray-50">
                        <Typography variant="caption" className="text-gray-500 font-medium block mb-1">Building</Typography>
                        <Typography variant="body2" className="font-bold text-gray-800">{profile.building_name}</Typography>
                      </Box>
                    )}
                    {profile.flat_number && (
                      <Box className="p-3 rounded-lg bg-gray-50">
                        <Typography variant="caption" className="text-gray-500 font-medium block mb-1">Flat No</Typography>
                        <Typography variant="body2" className="font-bold text-gray-800">{profile.flat_number}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>

        {/* RIGHT COLUMN - Personal & Contact Info */}
        <Grid item xs={12} lg={8}>
          <Card className="rounded-2xl shadow-sm border border-gray-100 h-full">
            <CardContent className="p-6 md:p-8">
              <Box className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <Box className="p-2 rounded-lg bg-red-50">
                  <PersonIcon sx={{ color: themeColors.primary }} />
                </Box>
                <Typography variant="h6" className="font-bold text-gray-900">
                  Personal Information
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <InputField
                    icon={<PersonIcon />}
                    label="Full Name"
                    name="name"
                    value={editableProfile?.name || ""}
                    isEditing={isEditing}
                    onChange={handleProfileChange}
                    profileValue={profile.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputField
                    icon={<EmailIcon />}
                    label="Email Address"
                    name="email"
                    value={editableProfile?.email || ""}
                    isEditing={isEditing}
                    onChange={handleProfileChange}
                    profileValue={profile.email}
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputField
                    icon={<PhoneIcon />}
                    label="Phone Number"
                    name="number"
                    value={editableProfile?.number || ""}
                    isEditing={isEditing}
                    onChange={handleProfileChange}
                    profileValue={profile.number}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputField
                    icon={<WhatsAppIcon />}
                    label="WhatsApp Number"
                    name="whatsapp_number"
                    value={editableProfile?.whatsapp_number || ""}
                    isEditing={isEditing}
                    onChange={handleProfileChange}
                    profileValue={profile.whatsapp_number}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" className="text-gray-400 font-medium uppercase tracking-wider mb-4 mt-2">
                    Additional Details
                  </Typography>
                </Grid>

                {profile.move_in_date && (
                  <Grid item xs={12} md={6}>
                    <ReadOnlyField
                      icon={<CalendarTodayIcon />}
                      label="Move In Date"
                      value={profile.move_in_date}
                    />
                  </Grid>
                )}
                {profile.move_out_date && (
                  <Grid item xs={12} md={6}>
                    <ReadOnlyField
                      icon={<CalendarTodayIcon />}
                      label="Move Out Date"
                      value={profile.move_out_date}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <ReadOnlyField
                    icon={<BadgeIcon />}
                    label="Registered User ID"
                    value={profile.registed_user_id || profile.userId}
                    bg="bg-gray-50"
                  />
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DIALOG REMAINS SIMILAR BUT STYLED - Include it in the replacement */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)"
          }
        }}
      >
        <DialogTitle className="flex items-center gap-3 p-6 border-b border-gray-100">
          <Box className="p-2 bg-red-50 rounded-lg">
            <LockResetIcon sx={{ color: themeColors.primary }} />
          </Box>
          <Typography variant="h6" className="font-bold text-gray-900">Change Password</Typography>
        </DialogTitle>

        <form onSubmit={handleChangePassword}>
          <DialogContent className="p-6 space-y-5">
            <Typography variant="body2" color="textSecondary" className="mb-2">
              Enter your new password. You will be logged out after successful change.
            </Typography>

            <TextField
              fullWidth
              type={showPassword.newPassword ? "text" : "password"}
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              variant="outlined"
              helperText="Minimum 6 characters"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": {
                    borderColor: themeColors.primary,
                    borderWidth: 2
                  }
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: themeColors.primary
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("newPassword")}
                      edge="end"
                    >
                      {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showPassword.confirmPassword ? "text" : "password"}
              label="Confirm Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": {
                    borderColor: themeColors.primary,
                    borderWidth: 2
                  }
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: themeColors.primary
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("confirmPassword")}
                      edge="end"
                    >
                      {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>

          <DialogActions className="p-6 pt-2 gap-3">
            <Button
              onClick={handleCloseDialog}
              variant="text"
              sx={{
                color: "gray",
                textTransform: "none",
                fontWeight: 600
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: themeColors.primary,
                borderRadius: "8px",
                textTransform: "none",
                padding: "8px 24px",
                fontWeight: 600,
                "&:hover": { bgcolor: themeColors.secondary }
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Update Password"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </motion.div>
  );
}
