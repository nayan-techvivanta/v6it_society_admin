import React, { useState, useEffect } from "react";
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
  Badge,
} from "@mui/material";
import {
  Search,
  FilterList,
  Refresh,
  Add,
  Delete,
  CreditCard,
  CheckCircle,
  Cancel,
  ContentCopy,
  Business,
  Apartment,
  LocationOn,
  EventAvailable,
  Visibility,
  Domain,
  Home,
} from "@mui/icons-material";
import { supabase } from "../../api/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";

dayjs.extend(relativeTime);

export default function AdminCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    unassigned: 0,
  });

  // Fetch cards with related data
  const fetchCards = async () => {
    try {
      setLoading(true);
      const societyId = localStorage.getItem("societyId");

      if (!societyId) {
        console.error("Society ID not found");
        setLoading(false);
        return;
      }

      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select(
          `
          *,
          buildings:building_id (
            name
          ),
          societies:society_id (
            name
          )
        `
        )
        .eq("society_id", societyId)
        .order("created_at", { ascending: false });

      if (cardsError) throw cardsError;

      // Process the data
      const processedCards = (cardsData || []).map((card) => ({
        ...card,
        building_name: card.buildings?.name || null,
        society_name: card.societies?.name || null,
      }));

      setCards(processedCards);
      calculateStats(processedCards);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cardsData) => {
    const assignedCount = cardsData.filter((card) => card.is_assigned).length;
    setStats({
      total: cardsData.length,
      assigned: assignedCount,
      unassigned: cardsData.length - assignedCount,
    });
  };

  const handleDeleteCard = async (cardId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this card? This action cannot be undone."
      )
    ) {
      try {
        const { error } = await supabase
          .from("cards")
          .delete()
          .eq("id", cardId);

        if (error) throw error;

        // Remove card from local state
        const deletedCard = cards.find((card) => card.id === cardId);
        setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));

        // Update stats
        setStats((prev) => ({
          total: prev.total - 1,
          assigned: deletedCard?.is_assigned
            ? prev.assigned - 1
            : prev.assigned,
          unassigned: !deletedCard?.is_assigned
            ? prev.unassigned - 1
            : prev.unassigned,
        }));
      } catch (error) {
        console.error("Error deleting card:", error);
      }
    }
  };

  const handleAddCard = async () => {
    const serialNumber = prompt("Enter card serial number:");
    if (!serialNumber) return;

    try {
      const societyId = localStorage.getItem("societyId");
      const { data, error } = await supabase
        .from("cards")
        .insert([
          {
            card_serial_number: serialNumber,
            society_id: societyId,
            is_assigned: false,
            building_id: null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Fetch society name for the new card
      const { data: societyData } = await supabase
        .from("societies")
        .select("name")
        .eq("id", societyId)
        .single();

      const newCard = {
        ...data,
        society_name: societyData?.name || "N/A",
        building_name: null,
      };

      // Add new card to state
      setCards((prev) => [newCard, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        unassigned: prev.unassigned + 1,
      }));
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Error adding card: " + error.message);
    }
  };

  const filteredCards = cards
    .filter((card) => {
      const matchesSearch =
        searchTerm === "" ||
        (card.card_serial_number &&
          card.card_serial_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (card.building_name &&
          card.building_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (card.society_name &&
          card.society_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "assigned" && card.is_assigned) ||
        (statusFilter === "unassigned" && !card.is_assigned);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "assigned":
          return b.is_assigned === a.is_assigned ? 0 : b.is_assigned ? -1 : 1;
        default:
          return 0;
      }
    });

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD MMM YYYY, hh:mm A");
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div className="p-6 font-roboto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-primary">
            Card Management
          </Typography>
          <Typography variant="body2" className="text-hintText">
            Manage access cards for your society
          </Typography>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 p-4 bg-lightBackground rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Badge badgeContent={stats.total} color="primary" className="mr-2">
              <CreditCard className="text-primary" />
            </Badge>
            <div>
              <Typography variant="body2" className="text-hintText">
                Total Cards
              </Typography>
              <Typography variant="h6" className="font-bold">
                {stats.total}
              </Typography>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <Badge
              badgeContent={stats.assigned}
              color="success"
              className="mr-2"
            >
              <CheckCircle className="text-success" />
            </Badge>
            <div>
              <Typography variant="body2" className="text-hintText">
                Assigned
              </Typography>
              <Typography variant="h6" className="font-bold text-success">
                {stats.assigned}
              </Typography>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <Badge
              badgeContent={stats.unassigned}
              color="warning"
              className="mr-2"
            >
              <Cancel className="text-pending" />
            </Badge>
            <div>
              <Typography variant="body2" className="text-hintText">
                Unassigned
              </Typography>
              <Typography variant="h6" className="font-bold text-pending">
                {stats.unassigned}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search by serial, building, or society..."
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
                <MenuItem value="assigned">Assigned</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="assigned">Assigned First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4} className="text-right">
            <Typography variant="caption" className="text-hintText">
              Showing {filteredCards.length} of {cards.length} cards
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards Table */}
      <Paper className="shadow-sm border border-gray-100 overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead className="bg-lightBackground">
              <TableRow>
                <TableCell className="font-semibold text-primary">
                  Card Details
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Society
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Building
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Status
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  Created Date
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
                    <div className="flex flex-col items-center justify-center">
                      <CircularProgress className="text-primary mb-4" />
                      <Typography variant="body1" className="text-hintText">
                        Loading cards...
                      </Typography>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" className="py-12">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="text-hintText text-4xl mb-4" />
                      <Typography variant="h6" className="text-hintText mb-2">
                        {searchTerm ? "No cards found" : "No cards available"}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="text-hintText mb-4"
                      >
                        {searchTerm
                          ? "Try adjusting your search criteria"
                          : "Add your first card to get started"}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddCard}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        Add New Card
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((card) => (
                  <TableRow
                    key={card.id}
                    hover
                    className="hover:bg-lightBackground/50"
                  >
                    {/* Card Details Column */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Badge
                          color={card.is_assigned ? "success" : "warning"}
                          variant="dot"
                          overlap="circular"
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                        >
                          <Avatar className="bg-primary/10">
                            <CreditCard className="text-primary" />
                          </Avatar>
                        </Badge>
                        <div>
                          <Typography
                            variant="subtitle2"
                            className="font-semibold"
                          >
                            Card #{card.id}
                          </Typography>
                          <div className="flex items-center space-x-2">
                            <Typography
                              variant="body2"
                              className="text-gray-600 font-mono"
                            >
                              {card.card_serial_number || "No serial"}
                            </Typography>
                            {card.card_serial_number && (
                              <Tooltip title="Copy serial number">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    copyToClipboard(card.card_serial_number)
                                  }
                                  className="text-hintText hover:text-primary"
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Society Column */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Domain fontSize="small" className="text-primary" />
                        <div>
                          <Typography variant="body2" className="font-medium">
                            {card.society_name || "N/A"}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-hintText"
                          >
                            ID: {card.society_id}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>

                    {/* Building Column */}
                    <TableCell>
                      {card.building_name ? (
                        <div className="flex items-center space-x-2">
                          <Business fontSize="small" className="text-primary" />
                          <div>
                            <Typography variant="body2" className="font-medium">
                              {card.building_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              className="text-hintText"
                            >
                              ID: {card.building_id}
                            </Typography>
                          </div>
                        </div>
                      ) : (
                        <Chip
                          label="No Building"
                          size="small"
                          className="bg-gray-100 text-gray-600"
                          icon={<LocationOn fontSize="small" />}
                        />
                      )}
                    </TableCell>

                    {/* Status Column */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {card.is_assigned ? (
                          <Chip
                            icon={<CheckCircle />}
                            label="Assigned"
                            size="small"
                            className="bg-success/10 text-success border-success/30"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            icon={<Cancel />}
                            label="Unassigned"
                            size="small"
                            className="bg-pending/10 text-pending border-pending/30"
                            variant="outlined"
                          />
                        )}
                      </div>
                    </TableCell>

                    {/* Created Date Column */}
                    <TableCell>
                      <Typography variant="body2" className="font-medium">
                        {formatDateTime(card.created_at)}
                      </Typography>
                      <Typography variant="caption" className="text-hintText">
                        {dayjs(card.created_at).fromNow()}
                      </Typography>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell align="center">
                      <div className="flex justify-center space-x-1">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCard(card);
                              setDetailDialogOpen(true);
                            }}
                            className="text-primary hover:bg-lightBackground"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* <Tooltip title="Delete Card">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-reject hover:bg-red-50"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Card Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "rounded-xl",
        }}
      >
        {selectedCard && (
          <>
            <DialogTitle className="bg-gradient-to-r from-primary to-primary/90 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Typography variant="h5" className="font-bold">
                    Card Details
                  </Typography>
                  <Typography variant="body2" className="text-white/90">
                    Complete card information
                  </Typography>
                </div>
                <Badge
                  color={selectedCard.is_assigned ? "success" : "warning"}
                  variant="dot"
                  overlap="circular"
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <Avatar className="bg-white/20">
                    <CreditCard className="text-white" />
                  </Avatar>
                </Badge>
              </div>
            </DialogTitle>

            <DialogContent className="p-6">
              <Grid container spacing={3}>
                {/* Card ID Section */}
                <Grid item xs={12}>
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography
                          variant="caption"
                          className="text-primary font-semibold"
                        >
                          CARD ID
                        </Typography>
                        <Typography
                          variant="h4"
                          className="font-bold text-primary"
                        >
                          #{selectedCard.id}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </Grid>

                {/* Serial Number */}
                <Grid item xs={12}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText font-medium mb-2"
                    >
                      Serial Number
                    </Typography>
                    <div className="flex items-center justify-between">
                      <Typography
                        variant="h6"
                        className="font-mono font-bold text-gray-800"
                      >
                        {selectedCard.card_serial_number || "Not Available"}
                      </Typography>
                      {selectedCard.card_serial_number && (
                        <Button
                          startIcon={<ContentCopy />}
                          size="small"
                          onClick={() =>
                            copyToClipboard(selectedCard.card_serial_number)
                          }
                          className="text-primary hover:bg-primary/10"
                        >
                          Copy
                        </Button>
                      )}
                    </div>
                  </div>
                </Grid>

                {/* Society Information */}
                <Grid item xs={12}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Domain className="text-primary mr-2" fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        className="text-hintText font-medium"
                      >
                        Society Information
                      </Typography>
                    </div>
                    <Typography
                      variant="body1"
                      className="font-semibold text-gray-800"
                    >
                      {selectedCard.society_name || "N/A"}
                    </Typography>
                    <Typography variant="caption" className="text-hintText">
                      Society ID: {selectedCard.society_id}
                    </Typography>
                  </div>
                </Grid>

                {/* Building Information */}
                <Grid item xs={12}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Business
                        className="text-primary mr-2"
                        fontSize="small"
                      />
                      <Typography
                        variant="subtitle2"
                        className="text-hintText font-medium"
                      >
                        Building Assignment
                      </Typography>
                    </div>
                    {selectedCard.building_name ? (
                      <div>
                        <Typography
                          variant="body1"
                          className="font-semibold text-gray-800"
                        >
                          {selectedCard.building_name}
                        </Typography>
                        <Typography variant="caption" className="text-hintText">
                          Building ID: {selectedCard.building_id}
                        </Typography>
                      </div>
                    ) : (
                      <Typography
                        variant="body1"
                        className="text-gray-500 italic"
                      >
                        Not assigned to any building
                      </Typography>
                    )}
                  </div>
                </Grid>

                {/* Status Information */}
                <Grid item xs={12} sm={6}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <Typography
                      variant="subtitle2"
                      className="text-hintText font-medium mb-2"
                    >
                      Assignment Status
                    </Typography>
                    <div className="flex items-center space-x-2">
                      {selectedCard.is_assigned ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Assigned"
                          size="medium"
                          className="bg-success/10 text-success border-success/30"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="Unassigned"
                          size="medium"
                          className="bg-pending/10 text-pending border-pending/30"
                          variant="outlined"
                        />
                      )}
                    </div>
                  </div>
                </Grid>

                {/* Creation Date */}
                <Grid item xs={12} sm={6}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <EventAvailable
                        className="text-primary mr-2"
                        fontSize="small"
                      />
                      <Typography
                        variant="subtitle2"
                        className="text-hintText font-medium"
                      >
                        Created Date
                      </Typography>
                    </div>
                    <Typography
                      variant="body1"
                      className="font-semibold text-gray-800"
                    >
                      {formatDateTime(selectedCard.created_at)}
                    </Typography>
                    <Typography variant="caption" className="text-hintText">
                      {dayjs(selectedCard.created_at).fromNow()}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions className="p-6 bg-gray-50 border-t">
              <div className="flex justify-end w-full items-center">
                <Button
                  onClick={() => setDetailDialogOpen(false)}
                  variant="outlined"
                  className="border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-lightBackground"
                >
                  Close
                </Button>

                {/* <div className="space-x-3">
                  <Button
                    variant="contained"
                    className="bg-reject hover:bg-red-700 text-white"
                    startIcon={<Delete />}
                    onClick={() => {
                      setDetailDialogOpen(false);
                      handleDeleteCard(selectedCard.id);
                    }}
                  >
                    Delete Card
                  </Button>
                </div> */}
              </div>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
