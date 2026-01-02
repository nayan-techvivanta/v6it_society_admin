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
} from "@mui/material";
import { supabase } from "../../api/supabaseClient";
import { Edit, Delete, MoreVert, Add } from "@mui/icons-material";
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
};

const statusLabels = {
  assigned: "Assigned",
  unassigned: "Unassigned",
};

const CardRow = ({ card, isMobile, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(card.id);
  };

  const handleDelete = () => {
    onDelete(card.id);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="hover:bg-lightBackground border-b"
    >
      <TableCell className="p-4">
        <Typography className="font-roboto text-sm font-semibold text-black">
          {card.id}
        </Typography>
      </TableCell>
      <TableCell className="p-4">
        <Typography className="font-roboto text-sm font-semibold text-black">
          {card.serialNumber || "-"}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <Typography className="font-roboto text-sm font-semibold text-black">
          {card.societyId || "-"}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <Typography className="font-roboto text-sm text-black">
          {new Date(card.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <Chip
          label={statusLabels[card.status]}
          className="font-roboto font-semibold text-white"
          style={{ backgroundColor: statusColors[card.status] }}
          size="medium"
        />
      </TableCell>

      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <IconButton
            size="small"
            onClick={handleEdit}
            className="text-primary hover:bg-lightBackground"
            sx={{
              border: "1px solid rgba(111, 11, 20, 0.2)",
              "&:hover": { backgroundColor: "rgba(111, 11, 20, 0.1)" },
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDelete}
            className="text-reject hover:bg-[rgba(179,27,27,0.1)]"
            sx={{
              border: "1px solid rgba(179, 27, 27, 0.2)",
              "&:hover": { backgroundColor: "rgba(179, 27, 27, 0.1)" },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </div>
      </TableCell>
    </motion.tr>
  );
};

const CardCard = ({ cardItem, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(cardItem.id);
  };

  const handleDelete = () => {
    onDelete(cardItem.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-4"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="bg-primary text-white font-roboto font-semibold">
              {cardItem.avatar}
            </Avatar>
            <div>
              <Typography className="font-roboto font-semibold text-primary">
                {cardItem.buildingName}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                #{cardItem.id.toString().padStart(3, "0")}
              </Typography>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-lightBackground p-3 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Serial Number
            </Typography>
            <Typography className="font-roboto font-semibold text-black">
              {cardItem.serialNumber || "-"}
            </Typography>
          </div>

          <div className="bg-lightBackground p-3 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Status
            </Typography>
            <Chip
              label={statusLabels[cardItem.status]}
              className="font-roboto font-semibold text-white"
              style={{ backgroundColor: statusColors[cardItem.status] }}
              size="small"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <IconButton
              size="small"
              onClick={handleEdit}
              className="text-primary hover:bg-lightBackground"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDelete}
              className="text-reject hover:bg-[rgba(179,27,27,0.1)]"
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
      society_id,
      created_at
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch cards error:", error);
      setLoading(false);
      return;
    }

    const mappedCards = data.map((card) => ({
      id: card.id,
      buildingName: `Society #${card.society_id}`,
      status: "assigned",
      avatar: card.card_serial_number
        ? card.card_serial_number.slice(0, 2).toUpperCase()
        : "CR",
      serialNumber: card.card_serial_number,
      societyId: card.society_id,
      createdAt: card.created_at,
    }));

    setCards(mappedCards);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const headers = [
    "Id",
    "Card Serial Number",
    "Society ID",
    "Created At",
    "Status",
    "Actions",
  ];

  const handleAddNewCard = () => {
    setIsEditMode(false);
    setSelectedCard(null);
    setOpenDialog(true);
  };

  const handleEditCard = (id) => {
    const cardToEdit = cards.find((card) => card.id === id);

    if (!cardToEdit) return;

    setIsEditMode(true);
    setSelectedCard({
      id: cardToEdit.id,
      society_id: cardToEdit.societyId,
      card_serial_number: cardToEdit.serialNumber,
    });
    setOpenDialog(true);
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;

    const { error } = await supabase.from("cards").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete card");
      return;
    }

    fetchCards();
  };

  const handleSubmitCard = () => {
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
              {/* Underline animation */}
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

              {/* Hover fill effect */}
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
          {/* <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddNewCard}
            className="
              bg-button
              text-white
              font-roboto
              font-semibold
              px-6
              py-3
              rounded-lg
              hover:bg-darkTrackSelect
              transition-colors
              duration-200
              flex
              items-center
              gap-3
              shadow-sm
              hover:shadow-md
            "
          >
            <Add />
            <span>New Card</span>
          </motion.button> */}
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
          className="bg-white rounded-lg shadow overflow-hidden  border border-gray-200"
        >
          {!isMobile ? (
            <TableContainer component={Paper} elevation={0}>
              <Table aria-label="cards table ">
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
                      />
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // Mobile Card View
            <div className="p-4">
              <AnimatePresence>
                {cards.map((card) => (
                  <CardCard
                    key={card.id}
                    cardItem={card}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {cards.length === 0 && (
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
