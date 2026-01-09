// import React, { useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   List,
//   ListItem,
//   ListItemAvatar,
//   Avatar,
//   ListItemText,
//   CircularProgress,
//   IconButton,
//   TextField,
//   Box,
//   MenuItem,
// } from "@mui/material";
// import { Edit } from "@mui/icons-material";
// import { supabase } from "../../../api/supabaseClient";
// import { toast } from "react-toastify";

// export default function FlatMembersDialog({
//   open,
//   onClose,
//   members,
//   loading,
//   fetchMembers,
// }) {
//   const [editingMember, setEditingMember] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [saving, setSaving] = useState(false);

//   const handleEditClick = (member) => {
//     setEditingMember(member);
//     setFormData({
//       name: member.name,
//       email: member.email,
//       number: member.number,
//       whatsapp_number: member.whatsapp_number,
//       role_type: member.role_type,
//       profile_url: member.profile_url || "",
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUpdateMember = async () => {
//     setSaving(true);
//     try {
//       const { error } = await supabase
//         .from("users")
//         .update({
//           name: formData.name,
//           email: formData.email,
//           number: formData.number,
//           whatsapp_number: formData.whatsapp_number,
//           role_type: formData.role_type,
//           profile_url: formData.profile_url || null,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", editingMember.id);

//       if (error) throw error;

//       toast.success("Member updated successfully!");
//       setEditingMember(null);
//       fetchMembers(); // Refresh members list
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to update member!");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingMember(null);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle>Flat Members</DialogTitle>
//       <DialogContent>
//         {loading ? (
//           <Box sx={{ textAlign: "center", p: 2 }}>
//             <CircularProgress />
//           </Box>
//         ) : members.length === 0 ? (
//           <p>No members found for this flat.</p>
//         ) : (
//           <List>
//             {members.map((member) => (
//               <ListItem key={member.id} divider>
//                 <ListItemAvatar>
//                   <Avatar src={member.profile_url}>{member.name[0]}</Avatar>
//                 </ListItemAvatar>
//                 <ListItemText
//                   primary={member.name}
//                   secondary={
//                     <>
//                       <div>Email: {member.email || "-"}</div>
//                       <div>Phone: {member.number || "-"}</div>
//                       <div>WhatsApp: {member.whatsapp_number || "-"}</div>
//                       <div>Role: {member.role_type}</div>
//                     </>
//                   }
//                 />
//                 <IconButton onClick={() => handleEditClick(member)}>
//                   <Edit />
//                 </IconButton>
//               </ListItem>
//             ))}
//           </List>
//         )}

//         {/* Edit Form */}
//         {editingMember && (
//           <Box sx={{ mt: 3, borderTop: "1px solid #e0e0e0", pt: 2 }}>
//             <TextField
//               label="Name"
//               name="name"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={formData.name}
//               onChange={handleChange}
//             />
//             <TextField
//               label="Email"
//               name="email"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={formData.email}
//               onChange={handleChange}
//             />
//             <TextField
//               label="Phone"
//               name="number"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={formData.number}
//               onChange={handleChange}
//             />
//             <TextField
//               label="WhatsApp"
//               name="whatsapp_number"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={formData.whatsapp_number}
//               onChange={handleChange}
//             />
//             <TextField
//               select
//               label="Role"
//               name="role_type"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={formData.role_type}
//               onChange={handleChange}
//             >
//               <MenuItem value="Tanent-O">Primary Owner</MenuItem>
//               <MenuItem value="Tanent-F">Family Member</MenuItem>
//             </TextField>
//             <TextField
//               label="Profile URL"
//               name="profile_url"
//               fullWidth
//               sx={{ mb: 2 }}
//               value={formData.profile_url}
//               onChange={handleChange}
//             />
//             <Box sx={{ display: "flex", gap: 2 }}>
//               <Button
//                 variant="contained"
//                 onClick={handleUpdateMember}
//                 disabled={saving}
//               >
//                 {saving ? "Saving..." : "Update"}
//               </Button>
//               <Button variant="outlined" onClick={handleCancelEdit}>
//                 Cancel
//               </Button>
//             </Box>
//           </Box>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} variant="contained">
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Box,
  Divider,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import { Close, Person, WhatsApp, Email, Phone } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const FlatMembersDialog = ({
  open,
  onClose,
  members,
  loading,
  fetchMembers,
}) => {
  const theme = {
    primary: "#6F0B14",
    lightBackground: "rgba(111, 11, 20, 0.09)",
    textPrimary: "#6F0B14",
    textSecondary: "#A29EB6",
    success: "#008000",
    white: "#FFFFFF",
    black: "#000000",
  };

  // Function to get role color
  const getRoleColor = (role) => {
    const roleColors = {
      "Tanent-M": "#6F0B14",
      Owner: "#008000",
      Tenant: "#3b82f6",
      "Society-Admin": "#8b5cf6",
      default: "#64748b",
    };
    return roleColors[role] || roleColors.default;
  };

  // Function to get role label
  const getRoleLabel = (role) => {
    const roleLabels = {
      "Tanent-M": "Tenant (Main)",
      Owner: "Owner",
      Tenant: "Tenant",
      "Society-Admin": "Society Admin",
    };
    return roleLabels[role] || role;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          backgroundColor: theme.lightBackground,
          borderBottom: `1px solid ${theme.lightBackground}`,
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              backgroundColor: `${theme.primary}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Person sx={{ color: theme.primary }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ color: theme.textPrimary }}
            >
              Flat Members
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              {members.length} member{members.length !== 1 ? "s" : ""} in this
              flat
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.textSecondary,
            "&:hover": {
              backgroundColor: `${theme.primary}10`,
              color: theme.primary,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress sx={{ color: theme.primary }} />
          </Box>
        ) : members.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: `${theme.lightBackground}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Person sx={{ fontSize: 40, color: theme.textSecondary }} />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: theme.textPrimary, mb: 1 }}
              fontWeight={500}
            >
              No Members Found
            </Typography>
            <Typography sx={{ color: theme.textSecondary, mb: 3 }}>
              This flat doesn't have any members yet.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Person />}
              sx={{
                borderColor: theme.primary,
                color: theme.primary,
                "&:hover": {
                  borderColor: theme.primary,
                  backgroundColor: `${theme.primary}10`,
                },
              }}
            >
              Add Member
            </Button>
          </Box>
        ) : (
          <AnimatePresence>
            <Stack spacing={0}>
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      p: 3,
                      "&:hover": {
                        backgroundColor: `${theme.lightBackground}`,
                      },
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={3}>
                      {/* Profile Image */}
                      <Box position="relative">
                        <Avatar
                          src={member.profile_url}
                          alt={member.name}
                          sx={{
                            width: 64,
                            height: 64,
                            border: `2px solid ${theme.lightBackground}`,
                            backgroundColor: `${theme.primary}10`,
                          }}
                        >
                          {member.name?.charAt(0) || "U"}
                        </Avatar>
                        <Chip
                          label={getRoleLabel(member.role_type)}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: -8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            backgroundColor: getRoleColor(member.role_type),
                            color: theme.white,
                            fontSize: "0.65rem",
                            height: 20,
                            minWidth: 60,
                            fontWeight: 600,
                            "& .MuiChip-label": {
                              px: 1,
                            },
                          }}
                        />
                      </Box>

                      {/* Member Details */}
                      <Box flex={1}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ color: theme.textPrimary }}
                          >
                            {member.name}
                          </Typography>
                          <Chip
                            label={member.role_type}
                            size="small"
                            sx={{
                              backgroundColor: `${getRoleColor(
                                member.role_type
                              )}15`,
                              color: getRoleColor(member.role_type),
                              fontWeight: 500,
                            }}
                          />
                        </Box>

                        {/* Contact Info */}
                        <Stack spacing={1.5} mt={2}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                width: "50%",
                              }}
                            >
                              <Email
                                sx={{
                                  fontSize: 18,
                                  color: theme.textSecondary,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: theme.textPrimary }}
                              >
                                {member.email}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                width: "50%",
                              }}
                            >
                              <Phone
                                sx={{
                                  fontSize: 18,
                                  color: theme.textSecondary,
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: theme.textPrimary }}
                              >
                                {member.number}
                              </Typography>
                            </Box>
                          </Box>

                          {member.whatsapp_number && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <WhatsApp
                                sx={{
                                  fontSize: 18,
                                  color: "#25D366",
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: theme.textPrimary }}
                              >
                                {member.whatsapp_number}
                              </Typography>
                              <Chip
                                label="WhatsApp"
                                size="small"
                                sx={{
                                  backgroundColor: "#25D36615",
                                  color: "#25D366",
                                  fontSize: "0.7rem",
                                  height: 20,
                                  ml: 1,
                                }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Box>

                    {/* Divider (except for last item) */}
                    {index < members.length - 1 && (
                      <Divider
                        sx={{
                          mt: 3,
                          backgroundColor: theme.lightBackground,
                        }}
                      />
                    )}
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </AnimatePresence>
        )}
      </DialogContent>

      {/* Dialog Footer */}
      <DialogActions
        sx={{
          p: 2,
          backgroundColor: theme.lightBackground,
          borderTop: `1px solid ${theme.lightBackground}`,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography variant="body2" sx={{ color: theme.textSecondary }}>
            Total: {members.length} member{members.length !== 1 ? "s" : ""}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderColor: theme.textSecondary,
                color: theme.textPrimary,
                "&:hover": {
                  borderColor: theme.primary,
                  backgroundColor: `${theme.primary}10`,
                },
              }}
            >
              Close
            </Button>
            {members.length > 0 && (
              <Button
                variant="contained"
                onClick={fetchMembers}
                sx={{
                  backgroundColor: theme.primary,
                  "&:hover": {
                    backgroundColor: `${theme.primary}CC`,
                  },
                }}
              >
                Refresh
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default FlatMembersDialog;
