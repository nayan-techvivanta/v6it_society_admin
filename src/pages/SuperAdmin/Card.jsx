import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
  Box,
} from "@mui/material";
import { supabase } from "../../api/supabaseClient";
import { Edit, Delete, Add } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import AddCardDialog from "../../components/dialogs/AddCardDialog";

const mockBuildings = [
  {
    id: "BLDG-001",
    name: "Skyline Tower",
    type: "Commercial Building",
    city: "New York",
    country: "USA",
  },
  {
    id: "BLDG-002",
    name: "Green Valley Apartments",
    type: "Residential Building",
    city: "Los Angeles",
    country: "USA",
  },
  {
    id: "BLDG-003",
    name: "Ocean View Residency",
    type: "Mixed Building",
    city: "Miami",
    country: "USA",
  },
  {
    id: "BLDG-004",
    name: "City Center Plaza",
    type: "Commercial Building",
    city: "Chicago",
    country: "USA",
  },
  {
    id: "BLDG-005",
    name: "Royal Gardens",
    type: "Residential Building",
    city: "Houston",
    country: "USA",
  },
];

const statusColors = {
  assigned: "#93BD57",
  unassigned: "#F96E5B",
  lost: "red", // Gray color for LOST status
};

const statusLabels = {
  assigned: "Assigned",
  unassigned: "Unassigned",
  lost: "LOST",
};

// Updated StatusSwitch to show Chip for LOST cards
const StatusSwitch = ({ card, onStatusChange, onAssign }) => {
  // If card is LOST, show a Chip instead of Switch
  if (card.cardStatus === "LOST") {
    return (
      <Chip
        label="LOST CARD"
        size="small"
        sx={{
          backgroundColor: "#f5f5f5",
          color: statusColors.lost,
          fontWeight: 600,
          border: "1px solid red",
          fontSize: "0.75rem",
          height: "24px",
          cursor: "default",
          "& .MuiChip-label": {
            px: 1.5,
          },
        }}
      />
    );
  }

  const [loading, setLoading] = useState(false);

  const handleSwitchChange = async (event) => {
    const newStatus = event.target.checked;

    if (!card.isAssigned && newStatus) {
      onAssign(card.id);
      return;
    }

    setLoading(true);
    try {
      await onStatusChange(card.id, newStatus);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={card.isAssigned}
          onChange={handleSwitchChange}
          disabled={loading}
          color="primary"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: statusColors.assigned,
              "&:hover": { backgroundColor: "rgba(147, 189, 87, 0.08)" },
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: statusColors.assigned,
            },
          }}
        />
      }
      label={
        <Typography
          className="font-roboto text-xs font-semibold"
          sx={{
            color: card.isAssigned
              ? statusColors.assigned
              : statusColors.unassigned,
          }}
        >
          {statusLabels[card.status]}
        </Typography>
      }
      labelPlacement="end"
    />
  );
};

const CardRow = ({
  card,
  isMobile,
  onEdit,
  onDelete,
  onStatusChange,
  onAssign,
}) => {
  const handleEdit = () => {
    // Don't allow editing LOST cards
    if (card.cardStatus === "LOST") return;
    onEdit(card.id);
  };

  const handleDelete = () => {
    // Don't allow deleting LOST cards
    if (card.cardStatus === "LOST") {
      alert("Cannot delete LOST cards");
      return;
    }
    onDelete(card.id);
  };

  // Check if card is LOST
  const isLost = card.cardStatus === "LOST";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`hover:bg-lightBackground border-b ${isLost ? "bg-gray-50" : ""}`}
      style={{
        opacity: isLost ? 0.8 : 1,
      }}
    >
      <TableCell className="p-4">
        <Typography
          className={`font-roboto text-sm font-semibold ${isLost ? "text-gray-500" : "text-black"}`}
        >
          {card.id}
        </Typography>
      </TableCell>
      <TableCell className="p-4">
        <Typography
          className={`font-roboto text-sm font-semibold ${isLost ? "text-gray-500" : "text-black"}`}
        >
          {card.serialNumber || "-"}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <Typography
          className={`font-roboto text-sm font-semibold ${isLost ? "text-gray-500" : "text-black"}`}
        >
          {card.societyName}
        </Typography>
      </TableCell>
      <TableCell className="p-4">
        <Typography
          className={`font-roboto text-sm font-semibold ${isLost ? "text-gray-500" : "text-black"}`}
        >
          {card.buildingName}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <Typography
          className={`font-roboto text-sm ${isLost ? "text-gray-500" : "text-black"}`}
        >
          {new Date(card.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <StatusSwitch
          card={card}
          onStatusChange={onStatusChange}
          onAssign={onAssign}
        />
      </TableCell>

      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <IconButton
            size="small"
            onClick={handleEdit}
            disabled={isLost}
            className={`${isLost ? "text-gray-400 cursor-not-allowed" : "text-primary hover:bg-lightBackground"}`}
            sx={{
              border: "1px solid",
              borderColor: isLost
                ? "rgba(156, 163, 175, 0.2)"
                : "rgba(111, 11, 20, 0.2)",
              "&:hover": {
                backgroundColor: isLost
                  ? "transparent"
                  : "rgba(111, 11, 20, 0.1)",
              },
              "&.Mui-disabled": {
                color: "#9ca3af",
                borderColor: "rgba(156, 163, 175, 0.2)",
              },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={isLost}
            className={`${isLost ? "text-gray-400 cursor-not-allowed" : "text-reject hover:bg-[rgba(179,27,27,0.1)]"}`}
            sx={{
              border: "1px solid",
              borderColor: isLost
                ? "rgba(156, 163, 175, 0.2)"
                : "rgba(179, 27, 27, 0.2)",
              "&:hover": {
                backgroundColor: isLost
                  ? "transparent"
                  : "rgba(179, 27, 27, 0.1)",
              },
              "&.Mui-disabled": {
                color: "#9ca3af",
                borderColor: "rgba(156, 163, 175, 0.2)",
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </motion.tr>
  );
};

const CardCard = ({ cardItem, onEdit, onDelete, onStatusChange, onAssign }) => {
  const handleEdit = () => {
    // Don't allow editing LOST cards
    if (cardItem.cardStatus === "LOST") return;
    onEdit(cardItem.id);
  };

  const handleDelete = () => {
    // Don't allow deleting LOST cards
    if (cardItem.cardStatus === "LOST") {
      alert("Cannot delete LOST cards");
      return;
    }
    onDelete(cardItem.id);
  };

  const handleStatusChange = (event) => {
    // Don't allow status change for LOST cards
    if (cardItem.cardStatus === "LOST") return;
    onStatusChange(cardItem.id, event.target.checked);
  };

  const isLost = cardItem.cardStatus === "LOST";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-4"
      style={{
        opacity: isLost ? 0.8 : 1,
        backgroundColor: isLost ? "#f9fafb" : "white",
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              className={`${isLost ? "bg-gray-300" : "bg-primary"} text-white font-roboto font-semibold`}
            >
              {cardItem.avatar}
            </Avatar>
            <div>
              <Typography
                className={`font-roboto font-semibold ${isLost ? "text-gray-500" : "text-primary"}`}
              >
                {cardItem.societyName}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                {cardItem.buildingName}
              </Typography>
            </div>
          </div>
          {isLost && (
            <Chip
              label="LOST"
              size="small"
              sx={{
                backgroundColor: "#f5f5f5",
                color: statusColors.lost,
                fontWeight: 600,
                fontSize: "0.75rem",
                height: "24px",
              }}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            className={`${isLost ? "bg-gray-50" : "bg-lightBackground"} p-3 rounded-lg`}
          >
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Serial Number
            </Typography>
            <Typography
              className={`font-roboto font-semibold ${isLost ? "text-gray-500" : "text-black"}`}
            >
              {cardItem.serialNumber || "-"}
            </Typography>
          </div>

          <div
            className={`${isLost ? "bg-gray-50" : "bg-lightBackground"} p-3 rounded-lg`}
          >
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Status
            </Typography>
            <div className="flex items-center">
              {isLost ? (
                <Typography
                  className="font-roboto text-xs font-semibold"
                  sx={{
                    color: statusColors.lost,
                  }}
                >
                  LOST
                </Typography>
              ) : (
                <>
                  <Switch
                    checked={cardItem.isAssigned}
                    onChange={handleStatusChange}
                    size="small"
                    disabled={isLost}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: statusColors.assigned,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: statusColors.assigned,
                        },
                    }}
                  />
                  <Typography
                    className="font-roboto text-xs font-semibold ml-2"
                    sx={{
                      color: cardItem.isAssigned
                        ? statusColors.assigned
                        : statusColors.unassigned,
                    }}
                  >
                    {statusLabels[cardItem.status]}
                  </Typography>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <IconButton
              size="small"
              onClick={handleEdit}
              disabled={isLost}
              className={`${isLost ? "text-gray-400" : "text-primary hover:bg-lightBackground"}`}
              sx={{
                "&.Mui-disabled": {
                  color: "#9ca3af",
                },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={isLost}
              className={`${isLost ? "text-gray-400" : "text-reject hover:bg-[rgba(179,27,27,0.1)]"}`}
              sx={{
                "&.Mui-disabled": {
                  color: "#9ca3af",
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Card() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [buildings, setBuildings] = useState(mockBuildings);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchCards = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("cards")
      .select(
        `
      id,
      card_serial_number,
      created_at,
      is_assigned,
      society_id,
      card_status, 
      building_id,
      societies (
        id,
        name,
        buildings (id, name)
      )
    `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch cards error:", error);
      setLoading(false);
      return;
    }

    const mappedCards = data.map((card) => {
      const assignedBuilding = card.societies?.buildings?.find(
        (b) => b.id === card.building_id,
      );

      const isLost = card.card_status === "LOST";

      return {
        id: card.id,
        serialNumber: card.card_serial_number,
        societyId: card.societies?.id || "-",
        societyName: card.societies?.name || "-",
        buildingName: assignedBuilding?.name || "-",
        // For LOST cards, always show as unassigned
        isAssigned: isLost
          ? false
          : card.is_assigned === true || card.is_assigned === "true",
        // Use card_status for status display
        status: isLost
          ? "lost"
          : card.is_assigned === true || card.is_assigned === "true"
            ? "assigned"
            : "unassigned",
        cardStatus: card.card_status || "ACTIVE",
        isDisabled: isLost,
        avatar: card.card_serial_number
          ? card.card_serial_number.slice(0, 2).toUpperCase()
          : "CR",
        createdAt: card.created_at,
      };
    });

    setCards(mappedCards);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const headers = [
    "Id",
    "Card Serial Number",
    "Society Name",
    "Building Name",
    "Created At",
    "Status",
    "Actions",
  ];

  const handleStatusChange = async (cardId, isAssigned) => {
    try {
      // Check if card is LOST before allowing status change
      const card = cards.find((c) => c.id === cardId);
      if (card?.cardStatus === "LOST") {
        alert("Cannot change status of LOST cards");
        return;
      }

      const { error } = await supabase
        .from("cards")
        .update({
          is_assigned: isAssigned,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cardId);

      if (error) throw error;

      // Local state update for instant UI feedback
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                isAssigned,
                status: isAssigned ? "assigned" : "unassigned",
              }
            : card,
        ),
      );
    } catch (error) {
      console.error("Error updating card status:", error);
      alert("Failed to update card status");
      // Re-fetch to sync with database
      fetchCards();
    }
  };

  const handleAddNewCard = () => {
    setIsEditMode(false);
    setSelectedCard({
      society_id: "",
      building_id: "",
      card_serial_number: "",
      is_assigned: false,
    });
    setOpenDialog(true);
  };

  const handleAssignCard = (cardId) => {
    const cardToEdit = cards.find((card) => card.id === cardId);
    if (!cardToEdit) return;

    // Don't allow assigning LOST cards
    if (cardToEdit.cardStatus === "LOST") {
      alert("Cannot assign LOST cards");
      return;
    }

    setIsEditMode(true);
    setSelectedCard({
      id: cardToEdit.id,
      society_id: cardToEdit.societyId,
      building_id: cardToEdit.buildingId || "",
      card_serial_number: cardToEdit.serialNumber,
      is_assigned: false,
    });

    setOpenDialog(true);
  };

  const handleEditCard = (id) => {
    const cardToEdit = cards.find((card) => card.id === id);

    if (!cardToEdit) return;

    // Don't allow editing LOST cards
    if (cardToEdit.cardStatus === "LOST") {
      alert("Cannot edit LOST cards");
      return;
    }

    setIsEditMode(true);
    setSelectedCard({
      id: cardToEdit.id,
      society_id: cardToEdit.societyId,
      building_id: cardToEdit.buildingId,
      card_serial_number: cardToEdit.serialNumber,
      is_assigned: cardToEdit.isAssigned,
    });
    setOpenDialog(true);
  };

  const handleDeleteCard = async (id) => {
    const cardToDelete = cards.find((card) => card.id === id);

    // Don't allow deleting LOST cards
    if (cardToDelete?.cardStatus === "LOST") {
      alert("Cannot delete LOST cards");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this card?")) return;

    const { error } = await supabase.from("cards").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete card");
      return;
    }

    fetchCards();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 font-roboto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header with Add Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Typography
              variant="h4"
              className="font-roboto font-bold text-primary mb-2"
            >
              Building Cards
            </Typography>
            <Typography className="font-roboto text-hintText">
              Manage building cards and their assignment status
            </Typography>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="inline-block"
          >
            <button
              onClick={handleAddNewCard}
              className="
                group
                bg-white
                font-roboto
                font-medium
                px-8
                py-3.5
                text-primary
                text-sm
                rounded-xl
                border-2
                border-primary
                hover:bg-primary
                hover:text-white
                transition-all
                duration-300
                relative
                overflow-hidden
                flex
                items-center
                gap-3
                shadow-sm
                hover:shadow-md
              "
            >
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-primary group-hover:bg-white"
                initial={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />

              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="tracking-wide">New Card</span>

              <div
                className="
                  absolute
                  inset-0
                  bg-primary
                  transform
                  -translate-x-full
                  group-hover:translate-x-0
                  transition-transform
                  duration-300
                  -z-10
                "
              />
            </button>
          </motion.div>
        </div>

        {loading && (
          <div className="p-6 text-center">
            <Typography className="font-roboto text-hintText">
              Loading cards...
            </Typography>
          </div>
        )}

        {/* Table/Card View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
        >
          {!isMobile ? (
            <TableContainer component={Paper} elevation={0}>
              <Table aria-label="cards table">
                <TableHead className="bg-lightBackground">
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableCell
                        key={index}
                        className="p-4 font-roboto font-semibold text-primary uppercase text-sm"
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {cards.map((card) => (
                      <CardRow
                        key={card.id}
                        card={card}
                        isMobile={isMobile}
                        onEdit={handleEditCard}
                        onDelete={handleDeleteCard}
                        onStatusChange={handleStatusChange}
                        onAssign={handleAssignCard}
                      />
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div className="p-4">
              <AnimatePresence>
                {cards.map((card) => (
                  <CardCard
                    key={card.id}
                    cardItem={card}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                    onStatusChange={handleStatusChange}
                    onAssign={handleAssignCard}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {cards.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow border border-gray-200 mt-4"
          >
            <Typography className="font-roboto text-hintText mb-4">
              No cards found
            </Typography>
            <button
              onClick={handleAddNewCard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-button text-white font-roboto font-medium rounded-lg hover:bg-darkTrackSelect transition-colors"
            >
              <Add fontSize="small" />
              Add New Card
            </button>
          </motion.div>
        )}
        <AddCardDialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            fetchCards();
          }}
          isEdit={isEditMode}
          cardData={selectedCard}
        />
      </motion.div>
    </div>
  );
}
