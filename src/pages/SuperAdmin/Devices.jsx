import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Edit,
  Delete,
  MoreVert,
  Devices as DeviceIcon,
  Add,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import AddDeviceDialog from "../../components/dialogs/AddDeviceDialog";
const initialDevices = [
  {
    id: "DEV001",
    name: "Smart Thermostat",
    type: "Thermostat",
    issueDate: "2024-01-15",
    status: "active",
    avatar: "ST",
    location: "Living Room",
    lastSeen: "2 min ago",
  },
  {
    id: "DEV002",
    name: "Security Camera",
    type: "Camera",
    issueDate: "2024-02-10",
    status: "active",
    avatar: "SC",
    location: "Front Door",
    lastSeen: "Online",
  },
  {
    id: "DEV003",
    name: "Motion Sensor",
    type: "Sensor",
    issueDate: "2024-01-25",
    status: "inactive",
    avatar: "MS",
    location: "Kitchen",
    lastSeen: "5 hours ago",
  },
  {
    id: "DEV004",
    name: "Smart Lock",
    type: "Lock",
    issueDate: "2024-03-01",
    status: "active",
    avatar: "SL",
    location: "Main Door",
    lastSeen: "Online",
  },
  {
    id: "DEV005",
    name: "Water Leak Detector",
    type: "Sensor",
    issueDate: "2024-02-20",
    status: "warning",
    avatar: "WL",
    location: "Basement",
    lastSeen: "1 hour ago",
  },
  {
    id: "DEV006",
    name: "Smart Plug",
    type: "Outlet",
    issueDate: "2024-01-30",
    status: "active",
    avatar: "SP",
    location: "Bedroom",
    lastSeen: "Online",
  },
];

const statusColors = {
  active: "#008000",
  inactive: "#A29EB6",
  warning: "#DBA400",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  warning: "Warning",
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const DeviceRow = ({ device, isMobile, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(device.id);
  };

  const handleDelete = () => {
    onDelete(device.id);
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
          {formatDate(device.issueDate)}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <Avatar
            className="bg-primary text-white font-roboto font-semibold"
            sx={{ width: 36, height: 36 }}
          >
            {device.avatar}
          </Avatar>
          <div>
            <Typography className="font-roboto font-semibold text-black">
              {device.name}
            </Typography>
            <Typography className="font-roboto text-xs text-hintText">
              {device.type} • {device.location}
            </Typography>
          </div>
        </div>
      </TableCell>

      <TableCell className="p-4">
        <Typography className="font-roboto font-semibold text-black">
          {device.id}
        </Typography>
      </TableCell>

      <TableCell className="p-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusColors[device.status] }}
          />
          <span
            className="font-roboto font-medium text-sm"
            style={{ color: statusColors[device.status] }}
          >
            {statusLabels[device.status]}
          </span>
        </div>
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

const DeviceCard = ({ deviceItem, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(deviceItem.id);
  };

  const handleDelete = () => {
    onDelete(deviceItem.id);
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
              {deviceItem.avatar}
            </Avatar>
            <div>
              <Typography className="font-roboto font-semibold text-black">
                {deviceItem.name}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                {deviceItem.type} • {deviceItem.location}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColors[deviceItem.status] }}
            />
            <span
              className="font-roboto text-xs font-medium"
              style={{ color: statusColors[deviceItem.status] }}
            >
              {statusLabels[deviceItem.status]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-lightBackground p-3 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Issue Date
            </Typography>
            <Typography className="font-roboto text-sm font-semibold text-black">
              {formatDate(deviceItem.issueDate)}
            </Typography>
          </div>
          <div className="bg-lightBackground p-3 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Device ID
            </Typography>
            <Typography className="font-roboto text-sm font-semibold text-black">
              {deviceItem.id}
            </Typography>
          </div>
        </div>

        <div className="mb-3 bg-lightBackground p-3 rounded-lg">
          <Typography className="font-roboto text-xs text-hintText mb-1">
            Last Seen
          </Typography>
          <Typography className="font-roboto text-sm font-medium text-black">
            {deviceItem.lastSeen}
          </Typography>
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-lightBackground text-primary font-roboto font-medium rounded-lg hover:bg-trackSelect transition-colors text-sm"
          >
            <Edit fontSize="small" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgba(179,27,27,0.1)] text-reject font-roboto font-medium rounded-lg hover:bg-[rgba(179,27,27,0.2)] transition-colors text-sm"
          >
            <Delete fontSize="small" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function Devices() {
  const [devices, setDevices] = useState(initialDevices);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleAddNewDevice = () => {
    setIsEditMode(false);
    setSelectedDevice(null);
    setOpenDialog(true);
  };

  const handleEditDevice = (id) => {
    const deviceToEdit = devices.find((device) => device.id === id);
    if (deviceToEdit) {
      setIsEditMode(true);
      setSelectedDevice(deviceToEdit);
      setOpenDialog(true);
    }
  };

  const handleDeleteDevice = (id) => {
    console.log("Delete device:", id);
    if (window.confirm("Are you sure you want to delete this device?")) {
      setDevices(devices.filter((device) => device.id !== id));
    }
  };

  const handleSubmitDevice = (deviceData) => {
    if (isEditMode && selectedDevice) {
      // Update existing device
      setDevices(
        devices.map((device) =>
          device.id === selectedDevice.id
            ? {
                ...device,
                name: deviceData.name,
                type:
                  deviceData.type.charAt(0).toUpperCase() +
                  deviceData.type.slice(1),
                location: deviceData.location,
                issueDate: deviceData.issueDate,
                status: deviceData.status,
                avatar: deviceData.name.substring(0, 2).toUpperCase(),
              }
            : device
        )
      );
    } else {
      // Add new device
      const newDevice = {
        id: deviceData.deviceId,
        name: deviceData.name,
        type:
          deviceData.type.charAt(0).toUpperCase() + deviceData.type.slice(1),
        issueDate: deviceData.issueDate,
        status: deviceData.status,
        avatar: deviceData.name.substring(0, 2).toUpperCase(),
        location: deviceData.location,
        lastSeen: "Just now",
      };
      setDevices([...devices, newDevice]);
    }
    setOpenDialog(false);
  };

  // Table headers
  const headers = [
    "Issue Date",
    "Device Name",
    "Device ID",
    "Status",
    "Actions",
  ];

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
              Devices
            </Typography>
            <Typography className="font-roboto text-hintText">
              Manage all smart devices in your building
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
              onClick={handleAddNewDevice}
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
              <span className="tracking-wide">New device</span>

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
        </div>

        {/* Table/Card View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
        >
          {!isMobile ? (
            // Desktop Table View
            <TableContainer component={Paper} elevation={0}>
              <Table aria-label="devices table">
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
                    {devices.map((device) => (
                      <DeviceRow
                        key={device.id}
                        device={device}
                        isMobile={isMobile}
                        onEdit={handleEditDevice}
                        onDelete={handleDeleteDevice}
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
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    deviceItem={device}
                    onEdit={handleEditDevice}
                    onDelete={handleDeleteDevice}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {devices.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow border border-gray-200 mt-4"
          >
            <div className="text-hintText mb-3">
              <DeviceIcon sx={{ fontSize: 64 }} />
            </div>
            <Typography className="font-roboto text-hintText mb-2 font-medium">
              No devices found
            </Typography>
            <Typography className="font-roboto text-hintText text-sm mb-4">
              Add your first device to get started
            </Typography>
            <button
              onClick={handleAddNewDevice}
              className="inline-flex items-center gap-2 px-4 py-2 bg-button text-white font-roboto font-medium rounded-lg hover:bg-darkTrackSelect transition-colors"
            >
              <Add fontSize="small" />
              Add Device
            </button>
          </motion.div>
        )}
      </motion.div>
      <AddDeviceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmitDevice}
        isEdit={isEditMode}
        deviceData={selectedDevice}
      />
    </div>
  );
}
