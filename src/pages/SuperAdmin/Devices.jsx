import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Box,
} from "@mui/material";
import { Edit, Delete, Devices as DeviceIcon, Add } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import AddDeviceDialog from "../../components/dialogs/AddDeviceDialog";
import { supabase } from "../../api/supabaseClient";

// Status configuration (same as before)
const statusColors = {
  active: "#008000",
  inactive: "#A29EB6",
  warning: "#DBA400",
  offline: "#ff0000",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  warning: "Warning",
  offline: "Offline",
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// DeviceRow component - Updated for new data structure
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
      {/* Device ID */}
      <TableCell className="p-4">
        <Typography className="font-roboto font-semibold text-black text-center">
          {device.id}
        </Typography>
      </TableCell>
      <TableCell className="p-4">
        <Typography className="font-roboto font-semibold text-black ">
          {device.device_serial_number}
        </Typography>
      </TableCell>

      {/* Device Info with Avatar */}
      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <Avatar
            className="bg-primary text-white font-roboto font-semibold"
            sx={{ width: 36, height: 36 }}
          >
            {device.avatar ||
              device.device_serial_number?.substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Typography className="font-roboto font-semibold text-black">
              Device {device.device_serial_number}
            </Typography>
            <Typography className="font-roboto text-xs text-hintText">
              {device.type || "Device"} • {device.building_name}
            </Typography>
          </div>
        </div>
      </TableCell>

      {/* Society Name */}
      <TableCell className="p-4">
        <Typography className="font-roboto font-medium text-black">
          {device.society_name || "Not Assigned"}
        </Typography>
      </TableCell>

      {/* Building Name */}
      <TableCell className="p-4">
        <Typography className="font-roboto font-medium text-black">
          {device.building_name || "Not Assigned"}
        </Typography>
      </TableCell>
      <TableCell className="p-4">
        <Typography className="font-roboto font-medium text-black">
          {device.flat_name || "Not Assigned"}
        </Typography>
      </TableCell>

      {/* Actions */}
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

// DeviceCard component - Updated for mobile view
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
              {deviceItem.avatar ||
                deviceItem.device_serial_number?.substring(0, 2).toUpperCase()}
            </Avatar>
            <div>
              <Typography className="font-roboto font-semibold text-black">
                Device {deviceItem.device_serial_number}
              </Typography>
              <Typography className="font-roboto text-xs text-hintText">
                {deviceItem.type || "Device"} • {deviceItem.building_name}
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  statusColors[deviceItem.status] || statusColors.inactive,
              }}
            />
            <span
              className="font-roboto text-xs font-medium"
              style={{
                color: statusColors[deviceItem.status] || statusColors.inactive,
              }}
            >
              {statusLabels[deviceItem.status] || "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-lightBackground p-3 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Society
            </Typography>
            <Typography className="font-roboto text-sm font-semibold text-black">
              {deviceItem.society_name || "Not Assigned"}
            </Typography>
          </div>
          <div className="bg-lightBackground p-3 rounded-lg">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Building
            </Typography>
            <Typography className="font-roboto text-sm font-semibold text-black">
              {deviceItem.building_name || "Not Assigned"}
            </Typography>
          </div>
          <div className="bg-lightBackground p-3 rounded-lg col-span-2">
            <Typography className="font-roboto text-xs text-hintText mb-1">
              Flat
            </Typography>
            <Typography className="font-roboto text-sm font-semibold text-black">
              {deviceItem.flat_name || "Not Assigned"}
            </Typography>
          </div>
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
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Fetch devices from Supabase
  const fetchDevices = async () => {
    try {
      setLoading(true);

      // Fetch devices with joined data from societies and buildings
      const { data: devicesData, error } = await supabase
        .from("devices")
        .select(
          `
    id,
    device_serial_number,
    created_at,
    society_id,
    building_id,
    flat_id,
    societies (
      id,
      name
    ),
    buildings (
      id,
      name
    ),
    flats (
      id,
      flat_number,
      floor_number,
      bhk_type
    )
  `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Format the data
      // const formattedDevices = devicesData.map((device) => ({
      //   id: device.id,
      //   device_serial_number: device.device_serial_number,
      //   society_name: device.societies?.name || null,
      //   building_name: device.buildings?.name || null,
      //   society_id: device.societies?.id || null,
      //   building_id: device.buildings?.id || null,
      //   flat_id: device.flats?.id || null,
      //   created_at: device.created_at,
      //   avatar:
      //     device.device_serial_number?.substring(0, 2).toUpperCase() || "DV",
      //   last_seen: new Date().toISOString(), // You might want to fetch this from another table
      // }));
      const formattedDevices = devicesData.map((device) => ({
        id: device.id,
        device_serial_number: device.device_serial_number,

        society_id: device.societies?.id || null,
        building_id: device.buildings?.id || null,
        flat_id: device.flats?.id || null,

        society_name: device.societies?.name || "Not Assigned",
        building_name: device.buildings?.name || "Not Assigned",

        flat_name: device.flats
          ? `${device.flats.flat_number} (Floor ${device.flats.floor_number})`
          : "Not Assigned",

        created_at: device.created_at,

        avatar:
          device.device_serial_number?.substring(0, 2).toUpperCase() || "DV",
      }));

      setDevices(formattedDevices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      // Handle error - you might want to show a toast notification
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

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

  const handleDeleteDevice = async (id) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        const { error } = await supabase.from("devices").delete().eq("id", id);

        if (error) throw error;

        // Update local state
        setDevices(devices.filter((device) => device.id !== id));

        // Optional: Show success message
        alert("Device deleted successfully!");
      } catch (error) {
        console.error("Error deleting device:", error);
        alert("Failed to delete device. Please try again.");
      }
    }
  };

  const handleSubmitDevice = async (deviceData) => {
    try {
      if (isEditMode && selectedDevice) {
        // Update existing device
        const { error } = await supabase
          .from("devices")
          .update({
            device_serial_number: deviceData.device_serial_number,
            society_id: deviceData.society_id,
            building_id: deviceData.building_id,
            flat_id: deviceData.flat_id,
          })
          .eq("id", selectedDevice.id);

        if (error) throw error;
      } else {
        // Add new device
        const { error } = await supabase.from("devices").insert({
          device_serial_number: deviceData.device_serial_number,
          society_id: deviceData.society_id,
          building_id: deviceData.building_id,
          flat_id: deviceData.flat_id,
        });

        if (error) throw error;
      }

      // Refresh devices list
      fetchDevices();
      setOpenDialog(false);

      // Optional: Show success message
      alert(`Device ${isEditMode ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Error saving device:", error);
      alert(
        `Failed to ${isEditMode ? "update" : "add"} device. Please try again.`,
      );
    }
  };

  // Updated table headers for new requirements
  const headers = [
    "Device ID",
    "Device Serial Number",
    "Device Name",
    "Society Name",
    "Building Name",
    "Flat/Shop/Office",
    "Actions",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography className="font-roboto text-hintText">
            Loading devices...
          </Typography>
        </Box>
      </div>
    );
  }

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

          {devices.length === 0 && !loading && (
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
