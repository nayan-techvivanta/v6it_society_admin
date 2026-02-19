import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Fade,
  Zoom,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
  CameraAlt as CameraAltIcon,
  DriveEta as DriveEtaIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

import { styled } from "@mui/material/styles";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../api/supabaseClient";
import { getFaceEmbedding } from "../../../Hooks/faceRecognition";
import { uploadImage } from "../../../api/uploadImage";
import { useSendVisitorPass } from "../../../Hooks/useSendVisitorPass";
import html2canvas from "html2canvas";
import VisitorPass from "./VisitorPass";
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "80vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: "28px",
  overflow: "hidden",
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  background: "linear-gradient(120deg, #6F0B14 0%, #a82834 50%, #6F0B14 100%)",
  color: "#FFFFFF",
  padding: theme.spacing(3, 4),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -30,
    right: -30,
    width: "200px",
    height: "200px",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2, 3),
  },
}));

// Left panel - Visitor Details
const DetailsPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  borderRadius: "20px",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(111, 11, 20, 0.08)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
}));

const UploadPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: "100%",
  borderRadius: "20px",
  backgroundColor: "#ffffff",
  border: "1px solid rgba(111, 11, 20, 0.08)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
  display: "flex",
  flexDirection: "column",
}));

const StyledSelect = styled(Select)({
  borderRadius: "12px",
  backgroundColor: "#fafafa",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#ffffff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#6F0B14",
    },
  },
  "&.Mui-focused": {
    backgroundColor: "#ffffff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#6F0B14",
      borderWidth: "2px",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "12px",
  },
  "& .MuiSelect-select": {
    padding: "16.5px 14px",
  },
});

const SectionTitle = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
    color: "#6F0B14",
    background: "rgba(111, 11, 20, 0.08)",
    padding: "6px",
    borderRadius: "10px",
  },
  "& .MuiTypography-root": {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#1e293b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fafafa",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#ffffff",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#6F0B14",
      },
    },
    "&.Mui-focused": {
      backgroundColor: "#ffffff",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#6F0B14",
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    "&.Mui-focused": {
      color: "#6F0B14",
    },
  },
});

const UploadArea = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "error",
})(({ theme, error }) => ({
  border: `2px dashed ${error ? "#dc3545" : "#6F0B14"}`,
  borderRadius: "16px",
  padding: theme.spacing(3),
  textAlign: "center",
  backgroundColor: error
    ? "rgba(220, 53, 69, 0.02)"
    : "rgba(111, 11, 20, 0.02)",
  transition: "all 0.3s ease",
  cursor: "pointer",
  minHeight: "180px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    borderColor: "#8B1E1E",
    backgroundColor: "rgba(111, 11, 20, 0.04)",
    transform: "translateY(-2px)",
  },
}));

const PreviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: "16px",
  border: "2px solid rgba(111, 11, 20, 0.1)",
  backgroundColor: "rgba(111, 11, 20, 0.02)",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  position: "relative",
}));
const captureVisitorPassImage = async (visitorPassData) => {
  const html2canvas = (await import("html2canvas")).default;

  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  await new Promise((resolve) => {
    root.render(<VisitorPass visitor={visitorPassData} />);
    setTimeout(resolve, 300);
  });

  const canvas = await html2canvas(container.firstChild, {
    useCORS: true,
    scale: 2,
    backgroundColor: "#ffffff",
  });

  root.unmount();
  document.body.removeChild(container);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  const file = new File(
    [blob],
    `visitor_pass_${visitorPassData.visitorName?.replace(/\s+/g, "_") || "pass"}.png`,
    { type: "image/png" },
  );

  const uploadResult = await uploadImage(file);
  return uploadResult.url;
};
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AddVisitorPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Role determination
  const rawRole = localStorage.getItem("role") || "";
  const role = rawRole.toLowerCase().replace("-", "");
  const isTenant = role === "tanento" || role === "tanentm";
  const isSecurity = role === "security";
  const userId = localStorage.getItem("profileId");
  const societyId = localStorage.getItem("societyId");

  const [uploadTab, setUploadTab] = useState(isSecurity ? 0 : 0);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    whatsappNumber: "",
    flatNumber: "",
    flatId: "",
    visitPurpose: "",
    visitDateTime: isTenant ? null : new Date(),
    vehicleNumber: "",
    visitorPhoto: null,
    idProofImage: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});
  const [flatsList, setFlatsList] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const [tenantLocation, setTenantLocation] = useState({
    societyId: null,
    buildingId: null,
    flatId: null,
    flatNumber: "",
  });
  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [faceMatchResult, setFaceMatchResult] = useState(null);
  const [faceLoading, setFaceLoading] = useState(false);
  const [locationInfo, setLocationInfo] = useState({
    societyName: "",
    buildingName: "",
  });
  const { sendPass } = useSendVisitorPass();

  useEffect(() => {
    const fetchFlatsForSecurity = async () => {
      if (!isSecurity || !societyId) return;

      setLoadingFlats(true);
      try {
        const { data: buildings, error: buildingsError } = await supabase
          .from("buildings")
          .select("id, name")
          .eq("society_id", societyId);

        if (buildingsError) throw buildingsError;

        if (buildings && buildings.length > 0) {
          const buildingIds = buildings.map((b) => b.id);

          // Then get all flats in those buildings
          const { data: flats, error: flatsError } = await supabase
            .from("flats")
            .select(
              `
              id,
              flat_number,
              building_id,
              buildings (
                name,
                society_id
              )
            `,
            )
            .in("building_id", buildingIds)
            .order("flat_number");

          if (flatsError) throw flatsError;

          // Format flats for dropdown
          const formattedFlats = flats.map((flat) => ({
            id: flat.id,
            flat_number: flat.flat_number,
            building_name: flat.buildings?.name || "Unknown Building",
            display_name: `${flat.flat_number} - ${flat.buildings?.name || "Unknown Building"}`,
          }));

          setFlatsList(formattedFlats);
        }
      } catch (err) {
        console.error("Error fetching flats for security:", err.message);
      } finally {
        setLoadingFlats(false);
      }
    };

    fetchFlatsForSecurity();
  }, [isSecurity, societyId]);

  useEffect(() => {
    const fetchTenantLocation = async () => {
      try {
        if (!isTenant || !userId) return;

        const { data, error } = await supabase
          .from("user_flats")
          .select(
            `
            society_id,
            building_id,
            flat_id,
            societies ( name ),
            buildings ( name ),
            flats ( flat_number )
          `,
          )
          .eq("user_id", userId)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const row = data[0];

          setTenantLocation({
            societyId: row.society_id,
            buildingId: row.building_id,
            flatId: row.flat_id,
            flatNumber: row.flats?.flat_number || "",
          });

          setLocationInfo({
            societyName: row.societies?.name || "",
            buildingName: row.buildings?.name || "",
          });

          setFormData((prev) => ({
            ...prev,
            flatNumber: row.flats?.flat_number || "",
            flatId: row.flat_id || "",
          }));
        }
      } catch (err) {
        console.error("Tenant location fetch error:", err.message);
      }
    };

    fetchTenantLocation();
  }, [userId, isTenant]);

  useEffect(() => {
    if (isSecurity) {
      console.log("Security user - ready for photo upload");
    }
  }, [isSecurity]);

  const generateVisitorOtp = () => Math.floor(1000 + Math.random() * 9000);
  const visitPurposes = [
    {
      value: "Guests",
      label: "Guests / Visitors",
      icon: "👤",
      description: "Friends, Family & Personal Guests",
    },
    {
      value: "Residents",
      label: "Residents / Tenants",
      icon: "🏠",
      description: "Society Residents & Staff",
    },
    {
      value: "Deliveries",
      label: "Deliveries / Couriers",
      icon: "📦",
      description: "Food, Packages, Orders",
    },
    {
      value: "Maintenance",
      label: "Maintenance & Repairs",
      icon: "🔧",
      description: "Repair & Technical Work",
    },
    {
      value: "ServiceProviders",
      label: "Service Providers",
      icon: "🛠️",
      description: "Electrician, Plumber, Cleaner",
    },
    {
      value: "Emergency",
      label: "Emergency Services",
      icon: "🚑",
      description: "Police, Ambulance, Fire",
    },
    {
      value: "Other",
      label: "Other",
      icon: "📝",
      description: "Miscellaneous Purpose",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFlatChange = (e) => {
    const selectedFlatId = e.target.value;
    const selectedFlat = flatsList.find((flat) => flat.id === selectedFlatId);

    setFormData((prev) => ({
      ...prev,
      flatId: selectedFlatId,
      flatNumber: selectedFlat?.flat_number || "",
    }));
    setTouched((prev) => ({ ...prev, flatId: true }));
    if (errors.flatId) setErrors((prev) => ({ ...prev, flatId: null }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };

    switch (field) {
      case "fullName":
        if (!formData.fullName.trim())
          newErrors.fullName = "Full name is required";
        else if (formData.fullName.trim().length < 3)
          newErrors.fullName = "Name must be at least 3 characters";
        else delete newErrors.fullName;
        break;
      case "phoneNumber":
        if (!formData.phoneNumber.trim())
          newErrors.phoneNumber = "Phone number is required";
        else {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ""))) {
            newErrors.phoneNumber =
              "Please enter a valid 10-digit phone number";
          } else delete newErrors.phoneNumber;
        }
        break;
      case "flatId":
        if (isSecurity && !formData.flatId)
          newErrors.flatId = "Please select a flat";
        else delete newErrors.flatId;
        break;
      case "visitPurpose":
        if (!formData.visitPurpose)
          newErrors.visitPurpose = "Visit purpose is required";
        else delete newErrors.visitPurpose;
        break;
      case "visitDateTime":
        if (isTenant && !formData.visitDateTime)
          newErrors.visitDateTime = "Visit date and time is required";
        else delete newErrors.visitDateTime;
        break;
      case "vehicleNumber":
        if (isSecurity && formData.vehicleNumber) {
          const vehicleRegex = /^[A-Za-z0-9- ]{5,15}$/;
          if (!vehicleRegex.test(formData.vehicleNumber)) {
            newErrors.vehicleNumber = "Please enter a valid vehicle number";
          } else delete newErrors.vehicleNumber;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleDateTimeChange = (dateTime) => {
    setFormData((prev) => ({ ...prev, visitDateTime: dateTime }));
    if (isTenant) {
      setTouched((prev) => ({ ...prev, visitDateTime: true }));
      if (errors.visitDateTime)
        setErrors((prev) => ({ ...prev, visitDateTime: null }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "File size should be less than 5MB",
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Please upload an image file" }));
      return;
    }

    setFormData((prev) => ({ ...prev, visitorPhoto: file }));
    setErrors((prev) => ({ ...prev, photo: null }));

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    setFaceLoading(true);
    setFaceMatchResult(null);
    setFaceEmbedding(null);

    try {
      // ── Call edge function directly ──────────────────
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fd = new FormData();
      fd.append("file", file);

      const { data: rawData, error: fnError } = await supabase.functions.invoke(
        "face_recognition",
        {
          body: fd,
          headers: { Authorization: `Bearer ${session?.access_token}` },
        },
      );

      if (fnError) {
        setErrors((prev) => ({
          ...prev,
          photo: "Face recognition failed. Please try again.",
        }));
        return;
      }

      console.log("Face recognition raw response:", rawData);
      console.log("Type of rawData:", typeof rawData);
      console.log("rawData keys:", rawData ? Object.keys(rawData) : "null");

      // ── Normalize response — handle all wrapping cases ──
      let response = rawData;

      // If it's a string, parse it
      if (typeof response === "string") {
        try {
          response = JSON.parse(response);
        } catch (e) {
          response = rawData;
        }
      }

      // If wrapped inside .data
      if (
        response &&
        !response.visitor &&
        !response.face_data &&
        response.data
      ) {
        response = response.data;
      }

      console.log("Normalized response:", response);
      console.log("response.visitor:", response?.visitor);

      // ── Parse embedding helper ───────────────────────
      const parseEmbedding = (raw) => {
        if (!raw) return null;
        if (typeof raw === "string") {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }
        return Array.isArray(raw) ? raw : null;
      };

      // ── Purpose reverse map ──────────────────────────
      const purposeReverseMap = {
        "Guests/VisitorsMaintenance & Repairs": "Guests",
        Guests: "Guests",
        Residents: "Residents",
        "Residents/Tenants": "Residents",
        Delivery: "Deliveries",
        Deliveries: "Deliveries",
        "Deliveries/Couriers": "Deliveries",
        Maintenance: "Maintenance",
        "Maintenance & Repairs": "Maintenance",
        ServiceProviders: "ServiceProviders",
        "Service Providers": "ServiceProviders",
        Emergency: "Emergency",
        "Emergency Services": "Emergency",
        Other: "Other",
      };

      // ── Check visitor in response OR nested ──────────
      const visitor = response?.visitor ?? response?.data?.visitor ?? null;
      const faceData = response?.face_data ?? response?.data?.face_data ?? null;
      const hasError = response?.error ?? response?.data?.error ?? null;

      // ── Visitor found in DB ──────────────────────────
      if (visitor) {
        const embedding = parseEmbedding(visitor.face_embedding);

        setFaceEmbedding(embedding);
        setFaceMatchResult({ found: true, visitor });

        setFormData((prev) => ({
          ...prev,
          fullName: visitor.visitor_name || prev.fullName,
          phoneNumber: visitor.phone_number || prev.phoneNumber,
          visitPurpose: purposeReverseMap[visitor.purpose] || prev.visitPurpose,
          vehicleNumber: visitor.vehicle_number || prev.vehicleNumber,
        }));

        return;
      }

      // ── New visitor — face not in DB ─────────────────
      if (faceData) {
        const embedding = parseEmbedding(faceData.embedding);

        if (!embedding) {
          setErrors((prev) => ({
            ...prev,
            photo: "No face detected. Please upload a clear photo.",
          }));
          return;
        }

        setFaceEmbedding(embedding);
        setFaceMatchResult({ found: false });
        return;
      }

      // ── No face detected ─────────────────────────────
      if (hasError === "No face detacted") {
        setErrors((prev) => ({
          ...prev,
          photo: "No face detected. Please upload a clear photo.",
        }));
        return;
      }

      // ── Unexpected response ──────────────────────────
      console.error("Unexpected response:", response);
      setErrors((prev) => ({
        ...prev,
        photo: "Face recognition failed. Please try again.",
      }));
    } catch (err) {
      console.error("Face recognition error:", err);
      setErrors((prev) => ({
        ...prev,
        photo: "Something went wrong during face recognition.",
      }));
    } finally {
      setFaceLoading(false);
    }
  };
  const handleIdProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          idProof: "File size should be less than 10MB",
        }));
        return;
      }
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setErrors((prev) => ({
          ...prev,
          idProof: "Please upload an image or PDF file",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, idProofImage: file }));
      setErrors((prev) => ({ ...prev, idProof: null }));

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setIdProofPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setIdProofPreview("pdf");
      }
    }
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, visitorPhoto: null }));
    setPhotoPreview(null);
    setErrors((prev) => ({ ...prev, photo: null }));
  };

  const removeIdProof = () => {
    setFormData((prev) => ({ ...prev, idProofImage: null }));
    setIdProofPreview(null);
    setErrors((prev) => ({ ...prev, idProof: null }));
  };

  const validateForm = () => {
    const fieldsToValidate = ["fullName", "phoneNumber", "visitPurpose"];
    if (isTenant) {
      fieldsToValidate.push("visitDateTime");
    }
    if (isSecurity) {
      fieldsToValidate.push("flatId");
    }
    fieldsToValidate.forEach((field) => validateField(field));
    return fieldsToValidate.every((field) => !errors[field]);
  };
  const handleSendVisitorPass = async ({
    insertedVisitor,
    otp,
    societyName,
    buildingName,
    flatNumber,
  }) => {
    try {
      const visitorPassData = {
        visitorId: insertedVisitor.id,
        societyName,
        buildingName,
        flatNumber,
        tenantName: localStorage.getItem("userName") || "Resident",
        visitorName: insertedVisitor.visitor_name,
        visitorPhone: insertedVisitor.phone_number,
        purpose: insertedVisitor.purpose,
        otp,
      };

      const passImageUrl = await captureVisitorPassImage(visitorPassData);

      const whatsappTarget = formData.whatsappNumber || formData.phoneNumber;

      await sendPass({
        visitor_id: insertedVisitor.id,
        whatsapp: whatsappTarget,
        file_url: passImageUrl,
        file_name: `visitor_pass_${insertedVisitor.id}.png`,
      });

      console.log("✅ Visitor pass sent to WhatsApp:", whatsappTarget);
    } catch (err) {
      console.error("⚠️ Visitor pass send failed (non-critical):", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      setTouched({
        fullName: true,
        phoneNumber: true,
        visitPurpose: true,
        ...(isTenant && { visitDateTime: true }),
        ...(isSecurity && { flatId: true }),
      });
      return;
    }

    setIsSubmitting(true);
    setSuccess(false);
    setErrors({});

    try {
      // ── Validation ──────────────────────────────
      if (!formData.fullName || !formData.phoneNumber) {
        throw new Error("Please fill required fields");
      }

      if (!formData.visitorPhoto) {
        throw new Error("Please upload visitor photo");
      }

      const flatInfo = isTenant
        ? tenantLocation
        : { flatId: formData.flatId, societyId };

      if (!flatInfo.flatId) {
        throw new Error("Flat information missing");
      }

      if (isTenant && !formData.visitDateTime) {
        throw new Error("Please select visit date & time");
      }

      // ── Upload visitor photo ─────────────────────
      let imageUrl = null;
      try {
        const uploadResult = await uploadImage(formData.visitorPhoto);
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      if (!imageUrl) throw new Error("Visitor image upload failed");

      // ── Upload ID proof (security only) ──────────
      let idProofUrl = null;
      if (isSecurity && formData.idProofImage) {
        try {
          const uploadResult = await uploadImage(formData.idProofImage);
          idProofUrl = uploadResult.url;
        } catch (uploadError) {
          throw new Error(`ID proof upload failed: ${uploadError.message}`);
        }
      }

      // ── Generate OTP (number to match bigint column) ─
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // ── Build common values ──────────────────────
      const societyIdValue = isTenant
        ? tenantLocation?.societyId
        : localStorage.getItem("societyId");
      const buildingIdValue = isTenant ? tenantLocation?.buildingId : null;
      const flatIdValue = isTenant
        ? tenantLocation?.flatId
        : formData.flatId || null;
      const flatNumberValue = isTenant
        ? tenantLocation?.flatNumber
        : formData.flatNumber || null;
      const visitType = isTenant ? "previsitor" : "normal";
      const inTime = isTenant
        ? formData.visitDateTime.toISOString()
        : new Date().toISOString();

      // ── visitor_type mapping (matches DB constraint) ─
      const visitorTypeMap = {
        Guests: "Guest",
        Residents: "Other",
        Deliveries: "Delivery",
        Maintenance: "Maintenance",
        ServiceProviders: "Maintenance",
        Emergency: "Other",
        Other: "Other",
      };

      let finalEmbedding = null;

      if (faceMatchResult?.found && faceMatchResult?.visitor?.face_embedding) {
        finalEmbedding =
          typeof faceMatchResult.visitor.face_embedding === "string"
            ? faceMatchResult.visitor.face_embedding
            : JSON.stringify(faceMatchResult.visitor.face_embedding);
      } else if (faceEmbedding) {
        finalEmbedding = JSON.stringify(faceEmbedding);
      }
      // ── Build visitor payload ────────────────────
      const visitorData = {
        society_id: Number(societyIdValue),
        building_id: buildingIdValue ? Number(buildingIdValue) : null,
        flat_id: flatIdValue ? Number(flatIdValue) : null,
        flat_number: flatNumberValue,
        visitor_name: formData.fullName,
        phone_number: formData.phoneNumber,
        purpose: formData.visitPurpose,
        visitor_type: visitorTypeMap[formData.visitPurpose] ?? "Other",
        visit_type: visitType,
        image_url: imageUrl,
        approved_status: "Pending",
        in_time: inTime,
        visitor_otp: otp,
        face_embedding: finalEmbedding,
      };

      if (isSecurity) {
        visitorData.verified_by_guard = Number(userId);
        visitorData.id_proof_image = idProofUrl;
        if (formData.vehicleNumber) {
          visitorData.vehicle_number = formData.vehicleNumber;
        }
      }

      console.log("Submitting visitor data:", visitorData);

      // ── Insert visitor ───────────────────────────
      const { error, data } = await supabase
        .from("visitors")
        .insert([visitorData])
        .select();

      if (error) throw error;

      if (isTenant && data && data[0]) {
        try {
          const insertedVisitor = data[0];

          // ── Build VisitorPass data ───────────────────────
          const visitorPassData = {
            visitorId: insertedVisitor.id,
            societyName: locationInfo.societyName,
            buildingName: locationInfo.buildingName,
            flatNumber: tenantLocation.flatNumber,
            tenantName: localStorage.getItem("userName") || "Resident",
            visitorName: insertedVisitor.visitor_name,
            visitorPhone: insertedVisitor.phone_number,
            purpose: insertedVisitor.purpose,
            otp: otp,
          };

          // ── Render VisitorPass off-screen ────────────────
          const container = document.createElement("div");
          container.style.cssText =
            "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
          document.body.appendChild(container);

          const passRoot = ReactDOM.createRoot(container);
          await new Promise((resolve) => {
            passRoot.render(<VisitorPass visitor={visitorPassData} />);
            setTimeout(resolve, 500);
          });

          // ── Capture with html2canvas ─────────────────────
          const passCanvas = await html2canvas(container.firstChild, {
            useCORS: true,
            scale: 2,
            backgroundColor: "#ffffff",
          });

          // ── Cleanup DOM ──────────────────────────────────
          passRoot.unmount();
          document.body.removeChild(container);

          // ── Convert to File and upload ───────────────────
          const passBlob = await new Promise((resolve) =>
            passCanvas.toBlob(resolve, "image/png"),
          );
          const passFile = new File(
            [passBlob],
            `visitor_pass_${insertedVisitor.id}.png`,
            { type: "image/png" },
          );
          const passUpload = await uploadImage(passFile);
          const passImageUrl = passUpload?.url;

          if (!passImageUrl) throw new Error("Pass image upload failed");

          // ── Send via WhatsApp ────────────────────────────
          const whatsappTarget =
            formData.whatsappNumber || formData.phoneNumber;

          await sendPass({
            visitor_id: insertedVisitor.id,
            whatsapp: whatsappTarget,
            file_url: passImageUrl,
            file_name: `visitor_pass_${insertedVisitor.id}.png`,
          });

          console.log("✅ Visitor pass sent to WhatsApp:", whatsappTarget);
        } catch (passError) {
          console.error(
            "⚠️ Pass send failed (non-critical):",
            passError.message,
          );
        }
      }

      // ── Success ──────────────────────────────────
      setSuccess(true);

      setTimeout(() => {
        setFormData({
          fullName: "",
          phoneNumber: "",
          whatsappNumber: "",
          flatNumber: "",
          flatId: "",
          visitPurpose: "",
          visitDateTime: isTenant ? null : new Date(),
          vehicleNumber: "",
          visitorPhoto: null,
          idProofImage: null,
        });
        setPhotoPreview(null);
        setIdProofPreview(null);

        navigate(isSecurity ? "/dashboard" : "/user/visitor");
      }, 2000);
    } catch (err) {
      console.error("Error:", err.message);
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <PageContainer>
        <Container maxWidth="xl" disableGutters>
          <Fade in={true} timeout={600}>
            <MainCard>
              {/* Header */}
              <HeaderSection>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {!isSecurity && (
                    <IconButton
                      onClick={() => navigate("/user/visitor")}
                      sx={{
                        color: "#FFFFFF",
                        bgcolor: "rgba(255,255,255,0.2)",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                      }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {isSecurity
                        ? "Register New Visitor"
                        : "Schedule a Visitor"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        icon={<LocationIcon />}
                        label={locationInfo.societyName || "Society"}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.2)",
                          color: "#FFFFFF",
                        }}
                      />
                      {locationInfo.buildingName && (
                        <Chip
                          icon={<HomeIcon />}
                          label={locationInfo.buildingName}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "#FFFFFF",
                          }}
                        />
                      )}
                      {isTenant && tenantLocation.flatNumber && (
                        <Chip
                          icon={<BadgeIcon />}
                          label={`Flat ${tenantLocation.flatNumber}`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "#FFFFFF",
                          }}
                        />
                      )}
                      {isSecurity && (
                        <Chip
                          icon={<SecurityIcon />}
                          label="Security Entry"
                          size="small"
                          sx={{ bgcolor: "#FFC107", color: "#000000" }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </HeaderSection>

              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit} ref={formRef}>
                  {/* Success Message */}
                  {success && (
                    <Zoom in={success}>
                      <Alert
                        icon={<CheckCircleIcon />}
                        severity="success"
                        sx={{ mb: 3, borderRadius: "12px" }}
                      >
                        {/* Visitor added successfully! Redirecting... */}
                        {isTenant
                          ? "Visitor scheduled! Pass sent to WhatsApp. Redirecting…"
                          : "Visitor registered successfully! Redirecting…"}
                      </Alert>
                    </Zoom>
                  )}

                  {/* Main 2-Column Layout */}
                  <Grid container spacing={3}>
                    {/* LEFT COLUMN - Visitor Details */}
                    <Grid item xs={12} md={6}>
                      <UploadPanel>
                        <SectionTitle>
                          <CloudUploadIcon />
                          <Typography>Upload Files</Typography>
                        </SectionTitle>

                        {/* ── SECURITY: Tabs (Photo + ID Proof) ── */}
                        {isSecurity ? (
                          <>
                            <Tabs
                              value={uploadTab}
                              onChange={(e, val) => setUploadTab(val)}
                              sx={{
                                borderBottom: 1,
                                borderColor: "divider",
                                "& .MuiTab-root.Mui-selected": {
                                  color: "#6F0B14",
                                },
                                "& .MuiTabs-indicator": { bgcolor: "#6F0B14" },
                              }}
                            >
                              <Tab
                                icon={<CameraAltIcon />}
                                label="Photo"
                                iconPosition="start"
                              />
                              <Tab
                                icon={<DescriptionIcon />}
                                label="ID Proof"
                                iconPosition="start"
                              />
                            </Tabs>

                            {/* ── Photo Tab ── */}
                            <TabPanel value={uploadTab} index={0}>
                              {photoPreview ? (
                                <PreviewCard>
                                  <Avatar
                                    src={photoPreview}
                                    variant="rounded"
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      borderRadius: "10px",
                                    }}
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2">
                                      Visitor Photo
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Ready to upload
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={removePhoto}
                                    size="small"
                                    sx={{ color: "#dc3545" }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </PreviewCard>
                              ) : (
                                <UploadArea error={!!errors.photo}>
                                  <input
                                    accept="image/*"
                                    id="photo-upload"
                                    type="file"
                                    onChange={handlePhotoUpload}
                                    style={{ display: "none" }}
                                    autoFocus={isSecurity}
                                  />
                                  <label
                                    htmlFor="photo-upload"
                                    style={{ cursor: "pointer", width: "100%" }}
                                  >
                                    <Box sx={{ textAlign: "center" }}>
                                      <CameraAltIcon
                                        sx={{
                                          fontSize: 48,
                                          color: "#6F0B14",
                                          mb: 1,
                                        }}
                                      />
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          color: "#6F0B14",
                                          fontWeight: 600,
                                        }}
                                      >
                                        Click to upload photo
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        JPG, PNG • Max 5MB
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{
                                          mt: 1,
                                          color: "#6F0B14",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        Photo will auto-detect returning
                                        visitors
                                      </Typography>
                                    </Box>
                                  </label>
                                </UploadArea>
                              )}

                              {/* Face Recognition Status */}
                              {faceLoading && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    mt: 2,
                                    p: 2,
                                    bgcolor: "#FFF8E1",
                                    borderRadius: 2,
                                    border: "1px solid #FFE082",
                                  }}
                                >
                                  <CircularProgress
                                    size={18}
                                    sx={{ color: "#E86100" }}
                                  />
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="#E86100"
                                      fontWeight={600}
                                    >
                                      Analyzing face...
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Checking visitor history in the system
                                    </Typography>
                                  </Box>
                                </Box>
                              )}

                              {!faceLoading && faceMatchResult?.found && (
                                <Alert
                                  severity="warning"
                                  sx={{ mt: 2, borderRadius: 2 }}
                                  icon={
                                    <PersonIcon sx={{ color: "#E86100" }} />
                                  }
                                >
                                  <Typography variant="body2" fontWeight={700}>
                                    Returning Visitor Detected!
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 0.5 }}
                                  >
                                    Last visit:{" "}
                                    {faceMatchResult.visitor.in_time
                                      ? new Date(
                                          faceMatchResult.visitor.in_time,
                                        ).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "—"}{" "}
                                    • Status:{" "}
                                    <strong>
                                      {faceMatchResult.visitor.approved_status}
                                    </strong>
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 0.3 }}
                                  >
                                    Flat:{" "}
                                    <strong>
                                      {faceMatchResult.visitor.flat_number ||
                                        "—"}
                                    </strong>
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ mt: 0.5 }}
                                  >
                                    Form auto-filled with last known details.
                                    Please verify before submitting.
                                  </Typography>
                                </Alert>
                              )}

                              {!faceLoading &&
                                faceMatchResult?.found === false && (
                                  <Alert
                                    severity="success"
                                    sx={{ mt: 2, borderRadius: 2 }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                    >
                                      New Visitor
                                    </Typography>
                                    <Typography variant="caption">
                                      No previous visit records found. Please
                                      fill in the details.
                                    </Typography>
                                  </Alert>
                                )}

                              {!faceLoading && faceEmbedding && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 1.5,
                                  }}
                                >
                                  <CheckCircleIcon
                                    sx={{ fontSize: 16, color: "#008000" }}
                                  />
                                  <Typography
                                    variant="caption"
                                    color="#008000"
                                    fontWeight={500}
                                  >
                                    Face captured & saved successfully
                                  </Typography>
                                </Box>
                              )}

                              {/* Photo error — only here, removed from outside */}
                              {errors.photo && (
                                <Alert
                                  severity="error"
                                  sx={{ mt: 2, borderRadius: 2 }}
                                >
                                  {errors.photo}
                                </Alert>
                              )}
                            </TabPanel>

                            {/* ── ID Proof Tab ── */}
                            <TabPanel value={uploadTab} index={1}>
                              {idProofPreview ? (
                                <PreviewCard>
                                  {idProofPreview === "pdf" ? (
                                    <DescriptionIcon
                                      sx={{ fontSize: 50, color: "#6F0B14" }}
                                    />
                                  ) : (
                                    <Avatar
                                      src={idProofPreview}
                                      variant="rounded"
                                      sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: "10px",
                                      }}
                                    />
                                  )}
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2">
                                      ID Proof
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {formData.idProofImage?.name ||
                                        "Ready to upload"}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={removeIdProof}
                                    size="small"
                                    sx={{ color: "#dc3545" }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </PreviewCard>
                              ) : (
                                <UploadArea error={!!errors.idProof}>
                                  <input
                                    accept="image/*,application/pdf"
                                    id="idproof-upload"
                                    type="file"
                                    onChange={handleIdProofUpload}
                                    style={{ display: "none" }}
                                  />
                                  <label
                                    htmlFor="idproof-upload"
                                    style={{ cursor: "pointer", width: "100%" }}
                                  >
                                    <Box sx={{ textAlign: "center" }}>
                                      <DescriptionIcon
                                        sx={{
                                          fontSize: 48,
                                          color: "#6F0B14",
                                          mb: 1,
                                        }}
                                      />
                                      <Typography
                                        variant="subtitle1"
                                        sx={{
                                          color: "#6F0B14",
                                          fontWeight: 600,
                                        }}
                                      >
                                        Upload ID Proof
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        JPG, PNG, PDF • Max 10MB
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                      >
                                        Aadhar Card, Driving License, etc.
                                      </Typography>
                                    </Box>
                                  </label>
                                </UploadArea>
                              )}

                              {/* ID Proof error — only here, removed from outside */}
                              {errors.idProof && (
                                <Alert
                                  severity="error"
                                  sx={{ mt: 2, borderRadius: 2 }}
                                >
                                  {errors.idProof}
                                </Alert>
                              )}
                            </TabPanel>
                          </>
                        ) : (
                          /* ── TENANT: Single Photo Upload ── */
                          <>
                            {photoPreview ? (
                              <PreviewCard>
                                <Avatar
                                  src={photoPreview}
                                  variant="rounded"
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: "10px",
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2">
                                    Visitor Photo
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Ready to upload
                                  </Typography>
                                </Box>
                                <IconButton
                                  onClick={removePhoto}
                                  size="small"
                                  sx={{ color: "#dc3545" }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </PreviewCard>
                            ) : (
                              <UploadArea error={!!errors.photo}>
                                <input
                                  accept="image/*"
                                  id="photo-upload"
                                  type="file"
                                  onChange={handlePhotoUpload}
                                  style={{ display: "none" }}
                                />
                                <label
                                  htmlFor="photo-upload"
                                  style={{ cursor: "pointer", width: "100%" }}
                                >
                                  <Box sx={{ textAlign: "center" }}>
                                    <CloudUploadIcon
                                      sx={{
                                        fontSize: 48,
                                        color: "#6F0B14",
                                        mb: 1,
                                      }}
                                    />
                                    <Typography
                                      variant="subtitle1"
                                      sx={{ color: "#6F0B14", fontWeight: 600 }}
                                    >
                                      Upload Visitor Photo
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      JPG, PNG • Max 5MB (Optional)
                                    </Typography>
                                  </Box>
                                </label>
                              </UploadArea>
                            )}

                            {/* Face Recognition Status (Tenant) */}
                            {faceLoading && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  mt: 2,
                                  p: 2,
                                  bgcolor: "#FFF8E1",
                                  borderRadius: 2,
                                  border: "1px solid #FFE082",
                                }}
                              >
                                <CircularProgress
                                  size={18}
                                  sx={{ color: "#E86100" }}
                                />
                                <Typography
                                  variant="body2"
                                  color="#E86100"
                                  fontWeight={500}
                                >
                                  Processing face data...
                                </Typography>
                              </Box>
                            )}

                            {!faceLoading && faceEmbedding && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 1.5,
                                }}
                              >
                                <CheckCircleIcon
                                  sx={{ fontSize: 16, color: "#008000" }}
                                />
                                <Typography
                                  variant="caption"
                                  color="#008000"
                                  fontWeight={500}
                                >
                                  Face captured successfully
                                </Typography>
                              </Box>
                            )}

                            {/* Photo error */}
                            {errors.photo && (
                              <Alert
                                severity="error"
                                sx={{ mt: 2, borderRadius: 2 }}
                              >
                                {errors.photo}
                              </Alert>
                            )}
                          </>
                        )}
                      </UploadPanel>
                    </Grid>

                    {/* RIGHT COLUMN - Upload Section */}
                    <Grid item xs={12} md={6}>
                      <DetailsPanel>
                        <SectionTitle>
                          <PersonIcon />
                          <Typography>Visitor Details</Typography>
                        </SectionTitle>

                        <Stack spacing={3}>
                          {/* Full Name */}
                          <StyledTextField
                            fullWidth
                            label="Full Name *"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("fullName")}
                            error={touched.fullName && !!errors.fullName}
                            helperText={touched.fullName && errors.fullName}
                            disabled={loading}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon
                                    sx={{ color: "#6F0B14", fontSize: 20 }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            placeholder="Enter visitor's full name"
                          />

                          {/* Phone & WhatsApp */}
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <StyledTextField
                                fullWidth
                                label="Phone Number *"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur("phoneNumber")}
                                error={
                                  touched.phoneNumber && !!errors.phoneNumber
                                }
                                helperText={
                                  touched.phoneNumber && errors.phoneNumber
                                }
                                disabled={loading}
                                inputProps={{ maxLength: 10 }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PhoneIcon
                                        sx={{ color: "#6F0B14", fontSize: 20 }}
                                      />
                                    </InputAdornment>
                                  ),
                                }}
                                placeholder="10-digit mobile"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <StyledTextField
                                fullWidth
                                label="WhatsApp Number"
                                name="whatsappNumber"
                                value={formData.whatsappNumber}
                                onChange={handleInputChange}
                                disabled={loading}
                                inputProps={{ maxLength: 10 }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <WhatsAppIcon
                                        sx={{ color: "#25D366", fontSize: 20 }}
                                      />
                                    </InputAdornment>
                                  ),
                                }}
                                placeholder="Optional"
                              />
                            </Grid>
                          </Grid>

                          {/* Flat Selection - Different for Tenant vs Security */}
                          {isTenant ? (
                            <StyledTextField
                              fullWidth
                              label="Flat Number"
                              name="flatNumber"
                              value={formData.flatNumber}
                              disabled
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <HomeIcon
                                      sx={{ color: "#6F0B14", fontSize: 20 }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  bgcolor: "#f5f5f5",
                                },
                              }}
                            />
                          ) : (
                            <FormControl
                              fullWidth
                              error={touched.flatId && !!errors.flatId}
                            >
                              <InputLabel>Select Flat *</InputLabel>
                              <StyledSelect
                                name="flatId"
                                value={formData.flatId || ""}
                                onChange={handleFlatChange}
                                onBlur={() => handleBlur("flatId")}
                                label="Select Flat *"
                                disabled={loading || loadingFlats}
                                startAdornment={
                                  <InputAdornment position="start">
                                    <HomeIcon
                                      sx={{
                                        color: "#6F0B14",
                                        fontSize: 20,
                                        ml: 1,
                                      }}
                                    />
                                  </InputAdornment>
                                }
                              >
                                {loadingFlats ? (
                                  <MenuItem disabled>
                                    <CircularProgress
                                      size={20}
                                      sx={{ mr: 1 }}
                                    />
                                    Loading flats...
                                  </MenuItem>
                                ) : flatsList.length > 0 ? (
                                  flatsList.map((flat) => (
                                    <MenuItem key={flat.id} value={flat.id}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <HomeIcon
                                          sx={{
                                            color: "#6F0B14",
                                            fontSize: 18,
                                          }}
                                        />
                                        <Box>
                                          <Typography variant="body2">
                                            Flat {flat.flat_number}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {flat.building_name}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </MenuItem>
                                  ))
                                ) : (
                                  <MenuItem disabled>
                                    <Typography color="text.secondary">
                                      No flats available
                                    </Typography>
                                  </MenuItem>
                                )}
                              </StyledSelect>
                              {touched.flatId && errors.flatId && (
                                <FormHelperText error>
                                  {errors.flatId}
                                </FormHelperText>
                              )}
                            </FormControl>
                          )}

                          {/* Visit Purpose */}
                          <FormControl
                            fullWidth
                            error={
                              touched.visitPurpose && !!errors.visitPurpose
                            }
                          >
                            <InputLabel>Visit Purpose *</InputLabel>
                            <StyledSelect
                              name="visitPurpose"
                              value={formData.visitPurpose || ""}
                              onChange={handleInputChange}
                              onBlur={() => handleBlur("visitPurpose")}
                              label="Visit Purpose *"
                              disabled={loading}
                              renderValue={(selected) => {
                                const purpose = visitPurposes.find(
                                  (p) => p.value === selected,
                                );
                                return (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <span>{purpose?.icon}</span>
                                    <Typography>{purpose?.label}</Typography>
                                  </Box>
                                );
                              }}
                            >
                              {visitPurposes.map((purpose) => (
                                <MenuItem
                                  key={purpose.value}
                                  value={purpose.value}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                    }}
                                  >
                                    <span style={{ fontSize: "1.2rem" }}>
                                      {purpose.icon}
                                    </span>
                                    <Box>
                                      <Typography variant="body2">
                                        {purpose.label}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {purpose.description}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </MenuItem>
                              ))}
                            </StyledSelect>
                            {touched.visitPurpose && errors.visitPurpose && (
                              <FormHelperText error>
                                {errors.visitPurpose}
                              </FormHelperText>
                            )}
                          </FormControl>

                          {/* Conditional Field: Date/Time for Tenant OR Vehicle Number for Security */}
                          {isTenant ? (
                            <DateTimePicker
                              label="Visit Date & Time *"
                              value={formData.visitDateTime}
                              onChange={handleDateTimeChange}
                              disabled={loading}
                              minDateTime={new Date()}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error:
                                    touched.visitDateTime &&
                                    !!errors.visitDateTime,
                                  helperText:
                                    touched.visitDateTime &&
                                    errors.visitDateTime,
                                  onBlur: () => handleBlur("visitDateTime"),
                                  InputProps: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <CalendarIcon
                                          sx={{ color: "#6F0B14" }}
                                        />
                                      </InputAdornment>
                                    ),
                                  },
                                  sx: {
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "12px",
                                      backgroundColor: "#fafafa",
                                      transition: "all 0.2s ease",
                                      "&:hover": {
                                        backgroundColor: "#ffffff",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                          borderColor: "#6F0B14",
                                        },
                                      },
                                      "&.Mui-focused": {
                                        backgroundColor: "#ffffff",
                                        "& .MuiOutlinedInput-notchedOutline": {
                                          borderColor: "#6F0B14",
                                          borderWidth: "2px",
                                        },
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          ) : (
                            <StyledTextField
                              fullWidth
                              label="Vehicle Number"
                              name="vehicleNumber"
                              value={formData.vehicleNumber}
                              onChange={handleInputChange}
                              onBlur={() => handleBlur("vehicleNumber")}
                              error={
                                touched.vehicleNumber && !!errors.vehicleNumber
                              }
                              helperText={
                                touched.vehicleNumber && errors.vehicleNumber
                              }
                              disabled={loading}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <DriveEtaIcon
                                      sx={{ color: "#6F0B14", fontSize: 20 }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              placeholder="e.g., MH01AB1234"
                            />
                          )}
                        </Stack>
                      </DetailsPanel>
                    </Grid>

                    {/* Submit Error */}
                    {errors.submit && (
                      <Grid item xs={12}>
                        <Alert severity="error" sx={{ borderRadius: "12px" }}>
                          {errors.submit}
                        </Alert>
                      </Grid>
                    )}

                    {/* Action Buttons */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Stack
                        direction={isMobile ? "column-reverse" : "row"}
                        justifyContent="flex-end"
                        spacing={2}
                      >
                        <Button
                          onClick={() => navigate("/user/visitor")}
                          disabled={loading}
                          variant="outlined"
                          size="large"
                          sx={{
                            color: "#6F0B14",
                            borderColor: "#6F0B14",
                            borderRadius: "10px",
                            px: 4,
                            py: 1.2,
                            "&:hover": {
                              borderColor: "#8B1E1E",
                              bgcolor: "rgba(111, 11, 20, 0.04)",
                            },
                            width: isMobile ? "100%" : "auto",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting || success}
                          startIcon={
                            isSubmitting && (
                              <CircularProgress size={20} color="inherit" />
                            )
                          }
                          size="large"
                          sx={{
                            bgcolor: "#6F0B14",
                            borderRadius: "10px",
                            px: 4,
                            py: 1.2,
                            "&:hover": { bgcolor: "#8B1E1E" },
                            width: isMobile ? "100%" : "auto",
                            minWidth: "160px",
                          }}
                        >
                          {isSubmitting
                            ? "Adding..."
                            : isTenant
                              ? "Schedule Visit"
                              : "Register Entry"}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </MainCard>
          </Fade>
        </Container>
      </PageContainer>
    </LocalizationProvider>
  );
}
