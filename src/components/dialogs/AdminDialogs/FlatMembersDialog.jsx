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
                                member.role_type,
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
