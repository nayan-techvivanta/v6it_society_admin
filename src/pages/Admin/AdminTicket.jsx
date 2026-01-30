import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  InputAdornment,
  Tooltip,
  CircularProgress,
  CardMedia,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton as MuiIconButton,
  LinearProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TitleIcon from "@mui/icons-material/Title";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Search,
  Refresh,
  Visibility,
  Delete,
  PriorityHigh,
  Help,
  BugReport,
  Assignment,
  Description,
  Person,
  Domain,
  CalendarToday,
  AccessTime,
  Pending,
  TaskAlt,
  ClosedCaption,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { uploadImage } from "../../api/uploadImage";

dayjs.extend(relativeTime);

export default function AdminTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [users, setUsers] = useState({});
  const [societies, setSocieties] = useState({});
  const [buildings, setBuildings] = useState({});
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState([]);
  const [replyTitle, setReplyTitle] = useState("");
  const [originalTicketDetails, setOriginalTicketDetails] = useState("");

  const statusConfig = {
    open: {
      color: "#DBA400",
      bgColor: "rgba(219, 164, 0, 0.1)",
      icon: <Assignment />,
      label: "Open",
    },
    in_progress: {
      color: "#6F0B14",
      bgColor: "rgba(111, 11, 20, 0.1)",
      icon: <Pending />,
      label: "In Progress",
    },
    resolved: {
      color: "#008000",
      bgColor: "rgba(0, 128, 0, 0.1)",
      icon: <TaskAlt />,
      label: "Resolved",
    },
    closed: {
      color: "#A29EB6",
      bgColor: "rgba(162, 158, 182, 0.1)",
      icon: <ClosedCaption />,
      label: "Closed",
    },
  };

  const filteredTickets = useMemo(() => {
    if (!tickets.length) return [];

    let filtered = [...tickets];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((ticket) => {
        const user = users[ticket.user_id];
        const userMatch =
          user?.name?.toLowerCase().includes(searchLower) ||
          user?.email?.toLowerCase().includes(searchLower);
        const detailsMatch = ticket.details
          ?.toLowerCase()
          .includes(searchLower);
        return userMatch || detailsMatch;
      });
    }

    if (selectedBuilding !== "all") {
      filtered = filtered.filter(
        (ticket) => String(ticket.building_id) === String(selectedBuilding),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(() => statusFilter === "open");
    }

    return filtered;
  }, [tickets, searchTerm, selectedBuilding, statusFilter, users]);

  const fetchRelatedData = async (ticketsData) => {
    try {
      if (!ticketsData || ticketsData.length === 0) return;

      const userIds = [
        ...new Set(ticketsData.map((t) => t.user_id).filter(Boolean)),
      ];
      const societyIds = [
        ...new Set(ticketsData.map((t) => t.society_id).filter(Boolean)),
      ];
      const buildingIds = [
        ...new Set(ticketsData.map((t) => t.building_id).filter(Boolean)),
      ];

      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, name, email")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching users:", usersError);
        } else if (usersData) {
          const usersMap = {};
          usersData.forEach((u) => (usersMap[u.id] = u));
          setUsers(usersMap);
        }
      }

      if (societyIds.length > 0) {
        const { data: societiesData, error: societiesError } = await supabase
          .from("societies")
          .select("id, name")
          .in("id", societyIds);

        if (societiesError) {
          console.error("Error fetching societies:", societiesError);
        } else if (societiesData) {
          const societiesMap = {};
          societiesData.forEach((s) => (societiesMap[s.id] = s));
          setSocieties(societiesMap);
        }
      }

      if (buildingIds.length > 0) {
        const { data: buildingsData, error: buildingsError } = await supabase
          .from("buildings")
          .select("id, name")
          .in("id", buildingIds);

        if (buildingsError) {
          console.error("Error fetching buildings:", buildingsError);
        } else if (buildingsData) {
          const buildingsMap = {};
          const buildingsList = [];
          buildingsData.forEach((b) => {
            buildingsMap[b.id] = b;
            buildingsList.push(b);
          });
          setBuildings(buildingsMap);
          setAvailableBuildings(buildingsList);
        }
      }
    } catch (err) {
      console.error("Error fetching related data:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const societyIdStr = localStorage.getItem("societyId");
      const societyId = societyIdStr ? parseInt(societyIdStr) : null;

      console.log("Fetching tickets for society ID:", societyId);

      if (!societyId || isNaN(societyId)) {
        console.error("Invalid society ID in localStorage:", societyIdStr);
        setTickets([]);
        setStats({
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0,
        });
        return;
      }

      const { data, error } = await supabase
        .from("ticket")
        .select("*")
        .eq("society_id", societyId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
        return;
      }

      console.log("Fetched tickets:", data?.length || 0);
      setTickets(data || []);

      calculateStats(data || []);

      if (data && data.length > 0) {
        await fetchRelatedData(data);
      }
    } catch (err) {
      console.error("Error in fetchTickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsData) => {
    const today = dayjs().startOf("day");

    const stats = {
      total: ticketsData.length,
      open: ticketsData.length,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    };

    setStats(stats);
  };

  const handleFileAttach = (event) => {
    const files = Array.from(event.target.files);

    if (attachedFiles.length + files.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(
        `Some files exceed 10MB limit: ${oversizedFiles.map((f) => f.name).join(", ")}`,
      );
      return;
    }

    // Add files to state
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      url: null,
      error: null,
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach(async (fileObj) => {
      try {
        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 0 }));

        const result = await uploadImage(fileObj.file);

        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? {
                  ...f,
                  status: "uploaded",
                  url: result.url || result.path,
                  error: null,
                }
              : f,
          ),
        );

        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 100 }));
      } catch (error) {
        console.error("Upload failed:", error);
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? { ...f, status: "error", error: error.message }
              : f,
          ),
        );
        setUploadErrors((prev) => [
          ...prev,
          { fileName: fileObj.name, error: error.message },
        ]);
      }
    });

    event.target.value = "";
  };

  const removeFile = (id) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <ImageIcon />;
    if (fileType === "application/pdf") return <PictureAsPdfIcon />;
    if (fileType.includes("word") || fileType.includes("document"))
      return <DescriptionIcon />;
    return <InsertDriveFileIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSendReply = async () => {
    if (!replyTitle.trim() || !replyText.trim() || !selectedTicket) return;

    try {
      setReplyLoading(true);

      const uploadedFiles = attachedFiles.filter(
        (f) => f.status === "uploaded" && f.url,
      );
      const fileUrls = uploadedFiles.map((f) => f.url);

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, fcm_token")
        .eq("id", selectedTicket.user_id)
        .single();

      if (userError) throw userError;

      let flatId = selectedTicket.flat_id || null;

      if (!flatId) {
        const { data: userFlatData, error: userFlatError } = await supabase
          .from("user_flats")
          .select("flat_id")
          .eq("user_id", selectedTicket.user_id)
          .eq("society_id", selectedTicket.society_id)
          .limit(1)
          .single();

        if (!userFlatError && userFlatData) {
          flatId = userFlatData.flat_id;
        }
      }

      /* 3️⃣ INSERT NOTIFICATION */
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: selectedTicket.user_id,
          title: replyTitle.trim(),
          body: replyText.trim(),
          type: "Admin",
          society_id: selectedTicket.society_id,
          building_id: selectedTicket.building_id ?? null,
          flat_id: flatId,
          document: fileUrls.length ? fileUrls[0] : null,
        });

      if (notificationError) throw notificationError;

      const { error: ticketUpdateError } = await supabase
        .from("ticket")
        .update({ is_ticket_status: true })
        .eq("id", Number(selectedTicket.id));

      if (ticketUpdateError) throw ticketUpdateError;

      /* 5️⃣ SEND FCM */
      if (userData?.fcm_token) {
        const { error: fcmError } = await supabase.functions.invoke(
          "send-notification",
          {
            body: {
              tokens: [userData.fcm_token],
              title: replyTitle.trim(),
              body: replyText.trim(),
              type: "Admin",
              data: {
                screen: "ticket",
                ticket_id: selectedTicket.id,
              },
            },
          },
        );

        if (fcmError) throw fcmError;
      }

      /* 6️⃣ UPDATE LOCAL STATE */
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id ? { ...t, is_ticket_status: true } : t,
        ),
      );

      /* 7️⃣ RESET UI */
      setReplyTitle("");
      setReplyText("");
      setAttachedFiles([]);
      setUploadProgress({});
      setUploadErrors([]);
      setReplyDialogOpen(false);
      setDetailDialogOpen(false);
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to send reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone.",
      )
    ) {
      try {
        const { error } = await supabase
          .from("ticket")
          .delete()
          .eq("id", ticketId);

        if (error) throw error;

        setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));

        console.log("Ticket deleted successfully");
      } catch (error) {
        console.error("Error deleting ticket:", error);
        alert("Failed to delete ticket. Please try again.");
      }
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const getTimeAgo = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).fromNow();
  };
  const handleOpenReplyDialog = (ticket) => {
    setSelectedTicket(ticket);
    setOriginalTicketDetails(ticket.details || "No description provided");
    setReplyDialogOpen(true);
  };
  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    console.log("Tickets state updated:", tickets.length);
    console.log("Filtered tickets:", filteredTickets.length);
  }, [tickets, filteredTickets]);

  return (
    <div className="p-6 font-roboto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-primary">
            Support Tickets
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Manage and track all support tickets for your society
          </Typography>
          <Typography variant="caption" className="text-primary">
            Society ID: {localStorage.getItem("societyId") || "Not set"}
          </Typography>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchTickets}
            className="border-primary text-primary hover:bg-lightBackground"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Total Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {stats.total}
                  </Typography>
                </div>
                <Avatar className="bg-primary/10">
                  <Description className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Open Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-pending">
                    {stats.open}
                  </Typography>
                </div>
                <Avatar className="bg-pending/10">
                  <Assignment className="text-pending" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Tickets with Images
                  </Typography>
                  <Typography variant="h4" className="font-bold text-primary">
                    {tickets.filter((t) => t.image).length}
                  </Typography>
                </div>
                <Avatar className="bg-primary/10">
                  <ImageIcon className="text-primary" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="body2" className="text-hintText">
                    Today's Tickets
                  </Typography>
                  <Typography variant="h4" className="font-bold text-success">
                    {
                      tickets.filter((t) =>
                        dayjs(t.created_at).isSame(dayjs(), "day"),
                      ).length
                    }
                  </Typography>
                </div>
                <Avatar className="bg-success/10">
                  <CalendarToday className="text-success" />
                </Avatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section - Fixed Grid layout */}
      <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search tickets by details or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="text-hintText" />
                  </InputAdornment>
                ),
                className: "bg-white",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="open">Open</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Building</InputLabel>
              <Select
                value={selectedBuilding}
                label="Building"
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="bg-white"
                disabled={availableBuildings.length === 0}
              >
                <MenuItem value="all">All Buildings</MenuItem>
                {availableBuildings.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3} className="text-right">
            <Typography variant="caption" className="text-hintText">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchTerm("");
                setSelectedBuilding("all");
                setStatusFilter("all");
              }}
              className="ml-2"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tickets Table */}
      <Paper className="shadow-sm border border-gray-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-lightBackground">
              <TableRow>
                <TableCell className="font-semibold text-primary">
                  Ticket ID
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  User & Location
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Description
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Created Date
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Status
                </TableCell>
                <TableCell className="font-semibold text-primary text-center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <Typography>No tickets found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => {
                  const user = users[ticket.user_id];
                  const society = societies[ticket.society_id];
                  const building = buildings[ticket.building_id];
                  const status = ticket.is_ticket_status ? "closed" : "open";

                  return (
                    <TableRow
                      key={ticket.id}
                      hover
                      className="hover:bg-lightBackground/50"
                    >
                      {/* Ticket ID */}
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          className="font-semibold"
                        >
                          #{ticket.id}
                        </Typography>
                        {ticket.image && (
                          <Chip
                            icon={<ImageIcon />}
                            label="Has Image"
                            size="small"
                            className="bg-blue-100 text-blue-800 mt-1"
                          />
                        )}
                      </TableCell>

                      {/* User & Location */}
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {user?.name || `User ${ticket.user_id}`}
                        </Typography>
                        <Typography variant="caption" className="text-hintText">
                          {society?.name}
                          {building && ` • ${building.name}`}
                        </Typography>
                      </TableCell>

                      {/* Description */}
                      <TableCell>
                        <Typography variant="body2" className="line-clamp-2">
                          {ticket.details || "No description"}
                        </Typography>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(ticket.created_at)}
                        </Typography>
                        <Typography variant="caption" className="text-hintText">
                          {getTimeAgo(ticket.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          icon={statusConfig[status].icon}
                          label={statusConfig[status].label}
                          size="small"
                          style={{
                            backgroundColor: statusConfig[status].bgColor,
                            color: statusConfig[status].color,
                            border: `1px solid ${statusConfig[status].color}`,
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <div className="flex justify-center gap-1">
                          {!ticket.is_ticket_status && (
                            <Tooltip title="Reply & Close">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenReplyDialog(ticket)}
                                className="text-green-600 hover:bg-green-50"
                              >
                                <ChatIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* View */}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setDetailDialogOpen(true);
                              }}
                              className="text-primary hover:bg-lightBackground"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Delete */}
                          <Tooltip title="Delete Ticket">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTicket(ticket.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle className="bg-gradient-to-r from-primary to-primary/90 text-white">
              <div className="flex justify-between items-center">
                <Typography variant="h6">
                  Ticket #{selectedTicket.id} Details
                </Typography>
                <Chip
                  label="Open"
                  className="bg-white text-primary"
                  size="small"
                />
              </div>
            </DialogTitle>

            <DialogContent className="p-6">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body1"
                    className="mt-2 p-3 bg-gray-50 rounded"
                  >
                    {selectedTicket.details || "No description provided"}
                  </Typography>
                </Grid>

                {selectedTicket.image && (
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle1"
                      color="textSecondary"
                      gutterBottom
                    >
                      Attached Image
                    </Typography>
                    <CardMedia
                      component="img"
                      image={selectedTicket.image}
                      alt="Ticket Attachment"
                      className="rounded-lg mt-2 max-h-64 object-contain border"
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Created Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(selectedTicket.created_at)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getTimeAgo(selectedTicket.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    User Information
                  </Typography>
                  {users[selectedTicket.user_id] ? (
                    <>
                      <Typography variant="body1">
                        {users[selectedTicket.user_id].name}
                      </Typography>
                      {users[selectedTicket.user_id].email && (
                        <Typography variant="caption" color="textSecondary">
                          {users[selectedTicket.user_id].email}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1">
                      User ID: {selectedTicket.user_id}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    gutterBottom
                  >
                    Location Details
                  </Typography>
                  <div className="space-y-2">
                    <Typography variant="body1">
                      Society:{" "}
                      {societies[selectedTicket.society_id]?.name ||
                        "Not specified"}
                    </Typography>
                    {buildings[selectedTicket.building_id] && (
                      <Typography variant="body1">
                        Building: {buildings[selectedTicket.building_id].name}
                      </Typography>
                    )}
                  </div>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions className="p-4 bg-gray-50">
              <Button
                onClick={() => setDetailDialogOpen(false)}
                color="primary"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleDeleteTicket(selectedTicket.id);
                  setDetailDialogOpen(false);
                }}
                color="error"
              >
                Delete Ticket
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reply Dialog */}
      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => !replyLoading && setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: 500,
            boxShadow: "0px 8px 32px rgba(111, 11, 20, 0.15)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "rgba(111, 11, 20, 0.04)",
          }}
        >
          <ChatBubbleOutlineIcon sx={{ color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Compose Reply
          </Typography>
          <Chip
            label="Reply"
            size="small"
            sx={{
              ml: "auto",
              color: "primary.main",
              borderColor: "primary.main",
              borderWidth: 1,
              borderStyle: "solid",
              backgroundColor: "white",
              fontWeight: 600,
              "& .MuiChip-label": {
                px: 1.5,
              },
            }}
            variant="outlined"
          />
        </DialogTitle>

        <DialogContent sx={{ mt: "10px", py: 1 }}>
          {/* Original Ticket Message Section */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              <DescriptionIcon fontSize="small" />
              Original Ticket Message
            </Typography>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                color: "text.primary",
                fontStyle: "normal",
                lineHeight: 1.6,
              }}
            >
              {originalTicketDetails}
            </Typography>
            {selectedTicket?.image && (
              <Box
                sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <ImageIcon fontSize="small" sx={{ color: "primary.main" }} />
                <Typography variant="caption" color="primary.main">
                  Ticket includes an attached image
                </Typography>
              </Box>
            )}
          </Box>

          {/* Divider */}
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{ flexGrow: 1, height: "1px", backgroundColor: "divider" }}
            />
            <Typography variant="caption" color="text.secondary">
              Your Response
            </Typography>
            <Box
              sx={{ flexGrow: 1, height: "1px", backgroundColor: "divider" }}
            />
          </Box>

          {/* Title Field */}
          <TextField
            fullWidth
            placeholder="Reply title..."
            value={replyTitle}
            onChange={(e) => setReplyTitle(e.target.value)}
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(111, 11, 20, 0.2)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon
                    sx={{ color: replyTitle ? "primary.main" : "#A29EB6" }}
                  />
                </InputAdornment>
              ),
            }}
            disabled={replyLoading}
          />

          {/* Description/Message Field */}
          <TextField
            multiline
            rows={6}
            fullWidth
            placeholder="Write your reply here...
      
• Be clear and concise
• Include step-by-step instructions if needed
• Attach screenshots if necessary"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
                "&.Mui-focused": {
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(111, 11, 20, 0.2)",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EditNoteIcon
                    sx={{ color: replyText ? "primary.main" : "#A29EB6" }}
                  />
                </InputAdornment>
              ),
            }}
            disabled={replyLoading}
          />

          {/* Character Counter */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color:
                  replyText.length > 5000 ? "error.main" : "text.secondary",
                fontWeight: replyText.length > 4500 ? 600 : 400,
              }}
            >
              {replyText.length}/5000 characters
            </Typography>
          </Box>

          {/* Attach Files Section */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <input
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg,.gif"
              style={{ display: "none" }}
              id="file-attachment-input"
              type="file"
              multiple
              onChange={handleFileAttach}
              disabled={replyLoading || attachedFiles.length >= 5}
            />
            <label htmlFor="file-attachment-input">
              <Button
                component="span"
                startIcon={<AttachFileIcon />}
                size="small"
                disabled={replyLoading || attachedFiles.length >= 5}
                sx={{
                  color: "primary.main",
                  borderColor: "rgba(111, 11, 20, 0.3)",
                  "&:hover": {
                    borderColor: "primary.main",
                    backgroundColor: "rgba(111, 11, 20, 0.04)",
                  },
                  "&.Mui-disabled": {
                    borderColor: "rgba(162, 158, 182, 0.2)",
                    color: "rgba(162, 158, 182, 0.5)",
                  },
                }}
                variant="outlined"
              >
                Attach Files ({attachedFiles.length}/5)
              </Button>
            </label>
            <Typography variant="caption" color="text.secondary">
              Max 5 files, 10MB each
            </Typography>
          </Box>

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(111, 11, 20, 0.03)",
                border: "1px solid",
                borderColor: "rgba(111, 11, 20, 0.1)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1.5, color: "primary.main", fontWeight: 600 }}
              >
                Attached Files (
                {attachedFiles.filter((f) => f.status === "uploaded").length}/
                {attachedFiles.length})
              </Typography>
              <List dense>
                {attachedFiles.map((file) => (
                  <ListItem
                    key={file.id}
                    secondaryAction={
                      !replyLoading && (
                        <MuiIconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => removeFile(file.id)}
                          size="small"
                          disabled={replyLoading}
                        >
                          <DeleteIcon fontSize="small" />
                        </MuiIconButton>
                      )
                    }
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor: "white",
                      border: "1px solid",
                      borderColor:
                        file.status === "error" ? "error.main" : "divider",
                    }}
                  >
                    <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              file.status === "error"
                                ? "error.main"
                                : "text.primary",
                          }}
                        >
                          {file.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)}
                            {file.status === "uploaded" && " • Uploaded"}
                            {file.status === "pending" && " • Uploading..."}
                            {file.status === "error" &&
                              ` • Error: ${file.error}`}
                          </Typography>
                          {file.status === "pending" && (
                            <LinearProgress
                              variant="determinate"
                              value={uploadProgress[file.id] || 0}
                              sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
              <AlertTitle>Upload Errors</AlertTitle>
              {uploadErrors.map((err, idx) => (
                <Typography key={idx} variant="body2">
                  {err.fileName}: {err.error}
                </Typography>
              ))}
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: "rgba(111, 11, 20, 0.02)",
          }}
        >
          <Button
            onClick={() => {
              if (!replyLoading) {
                setReplyDialogOpen(false);
                setReplyTitle("");
                setReplyText("");
                setAttachedFiles([]);
                setUploadProgress({});
                setUploadErrors([]);
                setOriginalTicketDetails(""); // Clear the original message
              }
            }}
            disabled={replyLoading}
            startIcon={<CloseIcon />}
            sx={{
              mr: "auto",
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "rgba(111, 11, 20, 0.04)",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSendReply}
            disabled={
              !replyTitle.trim() ||
              !replyText.trim() ||
              replyLoading ||
              attachedFiles.some((f) => f.status === "pending")
            }
            startIcon={
              replyLoading ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              px: 3,
              borderRadius: 2,
              boxShadow: "0px 4px 12px rgba(111, 11, 20, 0.25)",
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(111, 11, 20, 0.9)",
                boxShadow: "0px 6px 16px rgba(111, 11, 20, 0.35)",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(111, 11, 20, 0.3)",
                color: "rgba(255, 255, 255, 0.7)",
                boxShadow: "none",
              },
            }}
          >
            {replyLoading ? "Sending..." : "Send & Close Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
