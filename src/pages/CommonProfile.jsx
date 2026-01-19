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
        `
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
        }

        // Update local storage with fresh data
        localStorage.setItem("email", userData.email || "");
        localStorage.setItem("name", userData.name || "");
        localStorage.setItem("profileId", userData.id || "");
        localStorage.setItem("role", userData.role_type || "");
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
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to change password"
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
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress sx={{ color: "#6F0B14" }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <Card className="p-6 text-center">
          <Typography color="error">
            No profile data found. Please login again.
          </Typography>
          <Button
            href="/login"
            sx={{
              mt: 2,
              backgroundColor: "#6F0B14",
              "&:hover": { backgroundColor: "#5A0910" },
            }}
            variant="contained"
          >
            Go to Login
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 font-roboto">
      {/* HEADER */}
      <Box className="flex justify-between items-center">
        <Typography
          variant="h4"
          className="font-bold"
          sx={{ color: "#6F0B14" }}
        >
          My Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
            sx={{
              borderColor: "#6F0B14",
              color: "#6F0B14",
              "&:hover": {
                borderColor: "#5A0910",
                backgroundColor: "rgba(111, 11, 20, 0.04)",
              },
            }}
          >
            Edit Profile
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveProfile}
            disabled={loading}
            sx={{
              backgroundColor: "#6F0B14",
              "&:hover": { backgroundColor: "#5A0910" },
            }}
          >
            Save Changes
          </Button>
        )}
      </Box>

      {/* MAIN CONTENT */}
      <Grid container spacing={3}>
        {/* LEFT SIDE - PROFILE IMAGE CARD */}
        <Grid item xs={12} md={4}>
          <Card className="rounded-lg shadow-lg h-full">
            <CardContent className="flex flex-col items-center p-6 space-y-6">
              {/* AVATAR SECTION */}
              <Box className="relative">
                <Avatar
                  src={imagePreview}
                  sx={{
                    width: 180,
                    height: 180,
                    border: "4px solid #6F0B14",
                    fontSize: "3rem",
                  }}
                  className="bg-[#6F0B14]"
                >
                  {profile.name?.charAt(0).toUpperCase() ||
                    profile.email?.charAt(0).toUpperCase() ||
                    "U"}
                </Avatar>

                <IconButton
                  component="label"
                  className="absolute bottom-0 right-0 bg-[#6F0B14] hover:bg-[#5A0910] text-white shadow-lg"
                  size="medium"
                >
                  <EditIcon />
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </IconButton>
              </Box>

              {/* UPLOAD BUTTONS */}
              <Box className="w-full space-y-3">
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderColor: "#6F0B14",
                    color: "#6F0B14",
                    "&:hover": {
                      borderColor: "#5A0910",
                      backgroundColor: "rgba(111, 11, 20, 0.04)",
                    },
                  }}
                  fullWidth
                >
                  Choose New Photo
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </Button>

                {selectedFile && (
                  <Box className="space-y-3 p-3 border rounded-lg bg-[rgba(111,11,20,0.09)]">
                    <Typography variant="body2" className="text-gray-600">
                      Selected:{" "}
                      <span className="font-medium">{selectedFile.name}</span>
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleImageUpload}
                      disabled={uploadingImage}
                      sx={{
                        backgroundColor: "#6F0B14",
                        "&:hover": { backgroundColor: "#5A0910" },
                      }}
                      fullWidth
                    >
                      {uploadingImage ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Upload & Save"
                      )}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(profile.profile_url || "");
                      }}
                      size="small"
                      sx={{ color: "#6F0B14" }}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              {/* CHANGE PASSWORD BUTTON */}
              <Button
                variant="contained"
                onClick={handleOpenDialog}
                startIcon={<LockResetIcon />}
                sx={{
                  backgroundColor: "#6F0B14",
                  "&:hover": { backgroundColor: "#5A0910" },
                  padding: "10px 24px",
                }}
                fullWidth
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE - PROFILE INFO CARD */}
        <Grid item xs={12} md={8}>
          <Card className="rounded-lg shadow-lg h-full">
            <CardContent className="p-6 space-y-6">
              <Typography
                variant="h5"
                className="font-semibold"
                sx={{ color: "#6F0B14" }}
              >
                Personal Information
              </Typography>

              {/* PROFILE DETAILS GRID */}
              <Grid container spacing={3}>
                {/* NAME */}
                <Grid item xs={12} md={6}>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <PersonIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        className="text-[#A29EB6] uppercase tracking-wider"
                      >
                        Full Name
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="name"
                        value={editableProfile?.name || ""}
                        onChange={handleProfileChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.name || "Not provided"}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Grid>

                {/* EMAIL */}
                <Grid item xs={12} md={6}>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <EmailIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        className="text-[#A29EB6] uppercase tracking-wider"
                      >
                        Email Address
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={editableProfile?.email || ""}
                        onChange={handleProfileChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.email || "Not provided"}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Grid>

                {/* PHONE NUMBER */}
                <Grid item xs={12} md={6}>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <PhoneIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        className="text-[#A29EB6] uppercase tracking-wider"
                      >
                        Phone Number
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="number"
                        value={editableProfile?.number || ""}
                        onChange={handleProfileChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.number || "Not provided"}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Grid>

                {/* WHATSAPP NUMBER */}
                <Grid item xs={12} md={6}>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <WhatsAppIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        className="text-[#A29EB6] uppercase tracking-wider"
                      >
                        WhatsApp Number
                      </Typography>
                    </Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="whatsapp_number"
                        value={editableProfile?.whatsapp_number || ""}
                        onChange={handleProfileChange}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.whatsapp_number || "Not provided"}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Grid>

                {/* ROLE */}
                <Grid item xs={12} md={6}>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <BadgeIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        className="text-[#A29EB6] uppercase tracking-wider"
                      >
                        Role
                      </Typography>
                    </Box>
                    <Paper
                      elevation={0}
                      className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                    >
                      <Typography className="font-medium capitalize">
                        {profile.role_type || profile.role || "Not provided"}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>

                {/* SOCIETY */}
                {profile.society_name && (
                  <Grid item xs={12} md={6}>
                    <Box className="space-y-2">
                      <Box className="flex items-center gap-2">
                        <BusinessIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                        <Typography
                          variant="caption"
                          className="text-[#A29EB6] uppercase tracking-wider"
                        >
                          Society
                        </Typography>
                      </Box>
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.society_name}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                )}

                {/* BUILDING */}
                {profile.building_name && (
                  <Grid item xs={12} md={6}>
                    <Box className="space-y-2">
                      <Box className="flex items-center gap-2">
                        <ApartmentIcon
                          sx={{ color: "#A29EB6", fontSize: 20 }}
                        />
                        <Typography
                          variant="caption"
                          className="text-[#A29EB6] uppercase tracking-wider"
                        >
                          Building
                        </Typography>
                      </Box>
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.building_name}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                )}

                {/* FLAT NUMBER */}
                {profile.flat_number && (
                  <Grid item xs={12} md={6}>
                    <Box className="space-y-2">
                      <Box className="flex items-center gap-2">
                        <HomeIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                        <Typography
                          variant="caption"
                          className="text-[#A29EB6] uppercase tracking-wider"
                        >
                          Flat Number
                        </Typography>
                      </Box>
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.flat_number}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                )}

                {/* MOVE IN DATE */}
                {profile.move_in_date && (
                  <Grid item xs={12} md={6}>
                    <Box className="space-y-2">
                      <Box className="flex items-center gap-2">
                        <CalendarTodayIcon
                          sx={{ color: "#A29EB6", fontSize: 20 }}
                        />
                        <Typography
                          variant="caption"
                          className="text-[#A29EB6] uppercase tracking-wider"
                        >
                          Move In Date
                        </Typography>
                      </Box>
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.move_in_date}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                )}

                {/* MOVE OUT DATE */}
                {profile.move_out_date && (
                  <Grid item xs={12} md={6}>
                    <Box className="space-y-2">
                      <Box className="flex items-center gap-2">
                        <CalendarTodayIcon
                          sx={{ color: "#A29EB6", fontSize: 20 }}
                        />
                        <Typography
                          variant="caption"
                          className="text-[#A29EB6] uppercase tracking-wider"
                        >
                          Move Out Date
                        </Typography>
                      </Box>
                      <Paper
                        elevation={0}
                        className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                      >
                        <Typography className="font-medium">
                          {profile.move_out_date}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                )}

                {/* USER ID */}
                <Grid item xs={12}>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <BadgeIcon sx={{ color: "#A29EB6", fontSize: 20 }} />
                      <Typography
                        variant="caption"
                        className="text-[#A29EB6] uppercase tracking-wider"
                      >
                        Registered User ID
                      </Typography>
                    </Box>
                    <Paper
                      elevation={0}
                      className="p-4 border rounded-lg bg-[rgba(111,11,20,0.09)]"
                    >
                      <Typography className="font-medium text-sm break-all">
                        {profile.registed_user_id || profile.userId}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* PASSWORD CHANGE DIALOG */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
            boxShadow: "0 10px 30px rgba(111, 11, 20, 0.2)",
          },
        }}
      >
        <DialogTitle
          className="text-center"
          sx={{ color: "#6F0B14", fontWeight: 600 }}
        >
          <LockResetIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Change Password
        </DialogTitle>

        <form onSubmit={handleChangePassword}>
          <DialogContent className="space-y-4">
            <Typography variant="body2" color="textSecondary" className="mb-2">
              Enter your new password. You will be logged out after successful
              change.
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
              size="medium"
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("newPassword")}
                      edge="end"
                    >
                      {showPassword.newPassword ? (
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
                  "&:hover fieldset": { borderColor: "#6F0B14" },
                  "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
                },
              }}
            />

            <TextField
              fullWidth
              type={showPassword.confirmPassword ? "text" : "password"}
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              variant="outlined"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                      edge="end"
                    >
                      {showPassword.confirmPassword ? (
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
                  "&:hover fieldset": { borderColor: "#6F0B14" },
                  "&.Mui-focused fieldset": { borderColor: "#6F0B14" },
                },
              }}
            />
          </DialogContent>

          <DialogActions className="p-4 pt-2">
            <Button
              onClick={handleCloseDialog}
              sx={{
                color: "#6F0B14",
                fontWeight: 500,
                "&:hover": { backgroundColor: "rgba(111, 11, 20, 0.08)" },
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
                backgroundColor: "#6F0B14",
                fontWeight: 500,
                padding: "8px 24px",
                "&:hover": { backgroundColor: "#5A0910" },
                "&.Mui-disabled": { backgroundColor: "rgba(111, 11, 20, 0.5)" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
