import React, { useEffect, useState } from "react";
import { supabase } from "../../api/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TablePagination,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Refresh,
  Visibility,
  Settings,
  LocationOn,
  Phone,
  Email,
  Home,
  Apartment as ApartmentIcon,
  CalendarToday,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#6F0B14",
  color: "#FFFFFF",
  "&:hover": {
    backgroundColor: "#5A0910",
  },
  fontFamily: "Roboto, sans-serif",
}));

const OutlineButton = styled(Button)(({ theme }) => ({
  borderColor: "#6F0B14",
  color: "#6F0B14",
  "&:hover": {
    backgroundColor: "rgba(111, 11, 20, 0.09)",
    borderColor: "#5A0910",
  },
  fontFamily: "Roboto, sans-serif",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "rgba(111, 11, 20, 0.04)",
  },
}));

const StatusChip = styled(Chip)(({ status }) => ({
  fontFamily: "Roboto, sans-serif",
  fontWeight: 500,
  ...(status === "active" && {
    backgroundColor: "#E6F4E6",
    color: "#008000",
  }),
  ...(status === "inactive" && {
    backgroundColor: "#FDE8E8",
    color: "#B31B1B",
  }),
  ...((!status || status === "pending") && {
    backgroundColor: "#FFF8E1",
    color: "#DBA400",
  }),
}));

function Row({ row, index }) {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <React.Fragment>
      <StyledTableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ color: "#6F0B14" }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography fontFamily="Roboto" fontWeight={500}>
            {index + 1}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily="Roboto" fontWeight={500}>
            {row.name || "N/A"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography
            fontFamily="Roboto"
            sx={{
              color: "#666",
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.address || "N/A"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography fontFamily="Roboto" sx={{ color: "#666" }}>
            {row.city || "N/A"}
          </Typography>
        </TableCell>
        <TableCell>
          <StatusChip
            label={row.pincode ? row.pincode : "N/A"}
            status={row.status}
            size="small"
          />
        </TableCell>
      </StyledTableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                padding: 2,
                backgroundColor: "rgba(111, 11, 20, 0.02)",
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                fontFamily="Roboto"
                fontWeight={600}
                sx={{ color: "#6F0B14", mb: 3 }}
              >
                Society Details
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 3 }}>
                {/* Basic Information */}
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <Typography
                    variant="subtitle2"
                    fontFamily="Roboto"
                    fontWeight={600}
                    sx={{
                      color: "#6F0B14",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Home fontSize="small" />
                    Basic Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        fontFamily="Roboto"
                        sx={{ color: "#A29EB6", display: "block" }}
                      >
                        Society ID
                      </Typography>
                      <Typography fontFamily="Roboto" fontWeight={500}>
                        {row.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        fontFamily="Roboto"
                        sx={{ color: "#A29EB6", display: "block" }}
                      >
                        Pincode
                      </Typography>
                      <Typography fontFamily="Roboto" fontWeight={500}>
                        {row.pincode || "N/A"}
                      </Typography>
                    </Box>
                    {row.total_units && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          Total Units
                        </Typography>
                        <Typography fontFamily="Roboto" fontWeight={500}>
                          {row.total_units}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Contact Information */}
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <Typography
                    variant="subtitle2"
                    fontFamily="Roboto"
                    fontWeight={600}
                    sx={{
                      color: "#6F0B14",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Phone fontSize="small" />
                    Contact Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {row.phone && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          Phone
                        </Typography>
                        <Typography fontFamily="Roboto" fontWeight={500}>
                          {row.phone}
                        </Typography>
                      </Box>
                    )}
                    {row.email && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          <Email
                            fontSize="small"
                            sx={{ fontSize: 14, mr: 0.5 }}
                          />
                          Email
                        </Typography>
                        <Typography fontFamily="Roboto" fontWeight={500}>
                          {row.email}
                        </Typography>
                      </Box>
                    )}
                    {row.website && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          Website
                        </Typography>
                        <Typography fontFamily="Roboto" fontWeight={500}>
                          <a
                            href={row.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#6F0B14", textDecoration: "none" }}
                          >
                            {row.website}
                          </a>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Location Details */}
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <Typography
                    variant="subtitle2"
                    fontFamily="Roboto"
                    fontWeight={600}
                    sx={{
                      color: "#6F0B14",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LocationOn fontSize="small" />
                    Location Details
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        fontFamily="Roboto"
                        sx={{ color: "#A29EB6", display: "block" }}
                      >
                        Full Address
                      </Typography>
                      <Typography fontFamily="Roboto" fontWeight={500}>
                        {row.address || "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        fontFamily="Roboto"
                        sx={{ color: "#A29EB6", display: "block" }}
                      >
                        State
                      </Typography>
                      <Typography fontFamily="Roboto" fontWeight={500}>
                        {row.state || "N/A"}
                      </Typography>
                    </Box>
                    {row.landmark && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          Landmark
                        </Typography>
                        <Typography fontFamily="Roboto" fontWeight={500}>
                          {row.landmark}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Additional Information */}
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <Typography
                    variant="subtitle2"
                    fontFamily="Roboto"
                    fontWeight={600}
                    sx={{
                      color: "#6F0B14",
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CalendarToday fontSize="small" />
                    Additional Information
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {row.established_date && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          Established Date
                        </Typography>
                        <Typography fontFamily="Roboto" fontWeight={500}>
                          {formatDate(row.established_date)}
                        </Typography>
                      </Box>
                    )}
                    {row.description && (
                      <Box>
                        <Typography
                          variant="caption"
                          fontFamily="Roboto"
                          sx={{ color: "#A29EB6", display: "block" }}
                        >
                          Description
                        </Typography>
                        <Typography
                          fontFamily="Roboto"
                          sx={{ fontSize: "0.875rem", color: "#666" }}
                        >
                          {row.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  pt: 2,
                  borderTop: 1,
                  borderColor: "divider",
                }}
              >
                <OutlineButton
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => {
                    console.log("View details for:", row.id);
                    // Navigate to society details page
                  }}
                >
                  View Details
                </OutlineButton>
                <PrimaryButton
                  variant="contained"
                  startIcon={<Settings />}
                  onClick={() => {
                    console.log("Manage society:", row.id);
                    // Navigate to management page
                  }}
                >
                  Manage Society
                </PrimaryButton>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function PMSociety() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        setLoading(true);

        const profileId = localStorage.getItem("profileId");

        if (!profileId) {
          throw new Error("No profile ID found in localStorage");
        }

        const { data: pmSocieties, error: pmError } = await supabase
          .from("pm_society")
          .select("society_id")
          .eq("pm_id", profileId);

        if (pmError) throw pmError;

        const societyIds = pmSocieties.map((item) => item.society_id);

        if (societyIds.length === 0) {
          setSocieties([]);
          setLoading(false);
          return;
        }

        const { data: societiesData, error: societiesError } = await supabase
          .from("societies")
          .select("*")
          .in("id", societyIds)
          .order("name", { ascending: true });

        if (societiesError) throw societiesError;

        setSocieties(societiesData || []);
      } catch (err) {
        console.error("Error fetching societies:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSocieties();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Re-fetch data
    const profileId = localStorage.getItem("profileId");
    if (profileId) {
      fetchSocieties();
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
      >
        <CircularProgress sx={{ color: "#6F0B14" }} />
        <Typography
          variant="body1"
          sx={{ mt: 2, color: "#A29EB6", fontFamily: "Roboto" }}
        >
          Loading societies...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
              sx={{ fontFamily: "Roboto" }}
            >
              RETRY
            </Button>
          }
          sx={{ fontFamily: "Roboto" }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (societies.length === 0) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Typography
          variant="h4"
          className="font-roboto font-semibold text-primary mb-2"
        >
          My Societies
        </Typography>
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "rgba(111, 11, 20, 0.02)",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "rgba(111, 11, 20, 0.09)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Home sx={{ fontSize: 40, color: "#6F0B14" }} />
          </Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#666", fontFamily: "Roboto", fontWeight: 500 }}
          >
            No Societies Assigned
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#A29EB6", fontFamily: "Roboto", mb: 3 }}
          >
            You haven't been assigned to any societies yet.
          </Typography>
          <PrimaryButton
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Refresh
          </PrimaryButton>
        </Paper>
      </Box>
    );
  }

  return (
    <Box px={"20px"} sx={{ minHeight: "80vh" }}>
      {/* Header */}
      {/* <Box sx={{ mb: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#6F0B14",
              fontFamily: "Roboto",
              fontWeight: 400,
            }}
          >
            My Societies
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              color: "#6F0B14",
              fontFamily: "Roboto",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "rgba(111, 11, 20, 0.09)",
              },
            }}
          >
            Refresh
          </Button>
        </Box>
        <Typography
          variant="body1"
          sx={{ color: "#A29EB6", fontFamily: "Roboto" }}
        >
          Showing {societies.length} society{societies.length !== 1 ? "s" : ""}{" "}
          assigned to you
        </Typography>
      </Box> */}
      <Box className="mb-8">
        <Typography
          variant="h4"
          className="font-semibold text-gray-900 mb-2"
          sx={{ color: "#6F0B14" }}
        >
          <ApartmentIcon
            sx={{ mr: 2, verticalAlign: "middle", fontSize: "35px" }}
          />
          My Societies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Showing {societies.length} society
          {societies.length !== 1 ? "s" : ""}{" "}
        </Typography>
      </Box>
      {/* Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="collapsible table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "rgba(111, 11, 20, 0.09)" }}>
                <TableCell sx={{ width: 60 }} />
                <TableCell
                  sx={{
                    fontFamily: "Roboto",
                    fontWeight: 600,
                    color: "#6F0B14",
                  }}
                >
                  Sr. No.
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Roboto",
                    fontWeight: 600,
                    color: "#6F0B14",
                  }}
                >
                  Society Name
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Roboto",
                    fontWeight: 600,
                    color: "#6F0B14",
                  }}
                >
                  Address
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Roboto",
                    fontWeight: 600,
                    color: "#6F0B14",
                  }}
                >
                  City
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "Roboto",
                    fontWeight: 600,
                    color: "#6F0B14",
                  }}
                >
                  Pincode
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {societies
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <Row
                    key={row.id}
                    row={row}
                    index={index + page * rowsPerPage}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={societies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            fontFamily: "Roboto",
            borderTop: 1,
            borderColor: "divider",
          }}
        />
      </Paper>

      {/* Footer Summary */}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "#A29EB6", fontFamily: "Roboto" }}
        >
          Total:{" "}
          <strong style={{ color: "#6F0B14" }}>{societies.length}</strong>{" "}
          societies
        </Typography>
      </Box>
    </Box>
  );
}
