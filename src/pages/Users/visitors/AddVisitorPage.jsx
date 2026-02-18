import React, { useEffect, useRef, useState } from "react";
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
import { uploadImage } from "../../../api/uploadImage";

// Main container
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: "80vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

// Main card
const MainCard = styled(Card)(({ theme }) => ({
  borderRadius: "28px",
  overflow: "hidden",
}));

// Header section
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

// Right panel - Upload Section
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

// Section title
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

// Styled text field
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

// Upload area
const UploadArea = styled(Paper)(({ theme, error }) => ({
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

// Preview card
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

// Tab panel for document types (Security only)
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

  const [locationInfo, setLocationInfo] = useState({
    societyName: "",
    buildingName: "",
  });

  // Fetch flats for security user based on their society
  useEffect(() => {
    const fetchFlatsForSecurity = async () => {
      if (!isSecurity || !societyId) return;

      setLoadingFlats(true);
      try {
        // First get all buildings in the society
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

  // Fetch tenant location for tenants
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

  // Auto-focus on photo upload for security when page loads
  useEffect(() => {
    if (isSecurity) {
      // You can trigger any initialization here
      console.log("Security user - ready for photo upload");
    }
  }, [isSecurity]);
  // Add this function before your handleSubmit
  const generateVisitorOtp = () =>
    Math.floor(1000 + Math.random() * 9000).toString();
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

  // const handlePhotoUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     if (file.size > 5 * 1024 * 1024) {
  //       setErrors((prev) => ({
  //         ...prev,
  //         photo: "File size should be less than 5MB",
  //       }));
  //       return;
  //     }
  //     if (!file.type.startsWith("image/")) {
  //       setErrors((prev) => ({
  //         ...prev,
  //         photo: "Please upload an image file",
  //       }));
  //       return;
  //     }

  //     setFormData((prev) => ({ ...prev, visitorPhoto: file }));
  //     setErrors((prev) => ({ ...prev, photo: null }));

  //     const reader = new FileReader();
  //     reader.onloadend = () => setPhotoPreview(reader.result);
  //     reader.readAsDataURL(file);

  //     // TODO: After photo upload, you can call an OCR service or API
  //     // to extract data and auto-fill the form
  //     // Example:
  //     // extractDataFromImage(file).then(extractedData => {
  //     //   setFormData(prev => ({
  //     //     ...prev,
  //     //     fullName: extractedData.name || prev.fullName,
  //     //     phoneNumber: extractedData.phone || prev.phoneNumber,
  //     //     // ... other fields
  //     //   }));
  //     // });
  //   }
  // };
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

    setFormData((prev) => ({ ...prev, visitorPhoto: file }));

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    if (isSecurity) {
      try {
        setLoading(true);

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const formDataToSend = new FormData();
        formDataToSend.append("file", file);

        const response = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/match-visitor-face`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
          },
        );

        const result = await response.json();

        console.log("Face match result:", result);

        if (result.found) {
          setFormData((prev) => ({
            ...prev,
            fullName: result.visitor.visitor_name || "",
            phoneNumber: result.visitor.phone_number || "",
            visitPurpose: result.visitor.purpose || "",
          }));

          alert(
            `Visitor already exists! Confidence: ${(result.confidence * 100).toFixed(2)}%`,
          );
        } else {
          console.log("New visitor detected.");
        }
      } catch (err) {
        console.error("Face match error:", err.message);
      } finally {
        setLoading(false);
      }
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     setTouched({
  //       fullName: true,
  //       phoneNumber: true,
  //       visitPurpose: true,
  //       ...(isTenant && { visitDateTime: true }),
  //       ...(isSecurity && { flatId: true }),
  //     });
  //     return;
  //   }

  //   setLoading(true);
  //   setSuccess(false);

  //   try {
  //     let imageUrl = null;
  //     let idProofUrl = null;

  //     // Upload visitor photo if exists
  //     if (formData.visitorPhoto) {
  //       try {
  //         const uploadResult = await uploadImage(formData.visitorPhoto);
  //         imageUrl = uploadResult.url;
  //       } catch (uploadError) {
  //         throw new Error(`Image upload failed: ${uploadError.message}`);
  //       }
  //     }

  //     // Upload ID proof image if exists (for security)
  //     if (formData.idProofImage) {
  //       try {
  //         const uploadResult = await uploadImage(formData.idProofImage);
  //         idProofUrl = uploadResult.url;
  //       } catch (uploadError) {
  //         throw new Error(`ID proof upload failed: ${uploadError.message}`);
  //       }
  //     }

  //     const societyId = isTenant
  //       ? tenantLocation?.societyId
  //       : localStorage.getItem("societyId");

  //     const buildingId = isTenant ? tenantLocation?.buildingId : null;

  //     const flatId = isTenant
  //       ? tenantLocation?.flatId
  //       : formData.flatId || null;

  //     const flatNumber = isTenant
  //       ? tenantLocation?.flatNumber
  //       : formData.flatNumber || null;

  //     const visitType = isTenant ? "PreVisitor" : "Normal";
  //     const approvedStatus = isTenant ? "Pending" : "Approved";

  //     const inTime = isTenant
  //       ? formData.visitDateTime.toISOString()
  //       : new Date().toISOString();

  //     // Base visitor data
  //     const visitorData = {
  //       society_id: Number(societyId),
  //       building_id: buildingId ? Number(buildingId) : null,
  //       flat_id: flatId ? Number(flatId) : null,
  //       flat_number: flatNumber,
  //       visitor_name: formData.fullName,
  //       phone_number: formData.phoneNumber,
  //       // whatsapp_number: formData.whatsappNumber || null,
  //       purpose: formData.visitPurpose,
  //       visitor_type: formData.visitPurpose,
  //       visit_type: visitType,
  //       image_url: imageUrl,
  //       approved_status: approvedStatus,
  //       in_time: inTime,
  //     };

  //     if (isTenant) {
  //       visitorData.approved_by = Number(userId);
  //     }

  //     // Add security-specific fields
  //     if (isSecurity) {
  //       visitorData.verified_by_guard = Number(userId);
  //       visitorData.id_proof_image = idProofUrl;
  //       if (formData.vehicleNumber) {
  //         visitorData.vehicle_number = formData.vehicleNumber;
  //       }
  //     }

  //     console.log("Submitting visitor data:", visitorData);

  //     const { error } = await supabase.from("visitors").insert([visitorData]);

  //     if (error) throw error;

  //     setSuccess(true);
  //     setTimeout(() => {
  //       navigate("/user/dashboard");
  //     }, 2000);
  //   } catch (err) {
  //     console.error("Error:", err.message);
  //     setErrors((prev) => ({ ...prev, submit: err.message }));
  //   } finally {
  //     setLoading(false);
  //   }
  // };
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
      // Additional validation from the new functionality
      if (!formData.fullName || !formData.phoneNumber) {
        throw new Error("Please fill required fields");
      }

      if (!formData.visitorPhoto) {
        throw new Error("Please upload visitor photo");
      }

      const flatInfo = isTenant
        ? tenantLocation
        : {
            flatId: formData.flatId,
            societyId: societyId,
          };

      if (!flatInfo.flatId) {
        throw new Error("Flat information missing");
      }

      if (isTenant && !formData.visitDateTime) {
        throw new Error("Please select visit date & time");
      }

      let imageUrl = null;
      let idProofUrl = null;

      // Upload visitor photo
      if (formData.visitorPhoto) {
        try {
          const uploadResult = await uploadImage(formData.visitorPhoto);
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
      }

      if (!imageUrl) {
        throw new Error("Visitor image upload failed");
      }

      // Upload ID proof image if exists (for security)
      if (isSecurity && formData.idProofImage) {
        try {
          const uploadResult = await uploadImage(formData.idProofImage);
          idProofUrl = uploadResult.url;
        } catch (uploadError) {
          throw new Error(`ID proof upload failed: ${uploadError.message}`);
        }
      }

      // Generate OTP for visitor
      const generateVisitorOtp = () =>
        Math.floor(1000 + Math.random() * 9000).toString();
      const otp = generateVisitorOtp();

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

      const visitType = isTenant ? "PreVisitor" : "Normal";

      const inTime = isTenant
        ? formData.visitDateTime.toISOString()
        : new Date().toISOString();

      // Base visitor data with OTP
      const visitorData = {
        society_id: Number(societyIdValue),
        building_id: buildingIdValue ? Number(buildingIdValue) : null,
        flat_id: flatIdValue ? Number(flatIdValue) : null,
        flat_number: flatNumberValue,
        visitor_name: formData.fullName,
        phone_number: formData.phoneNumber,
        purpose: formData.visitPurpose,
        visitor_type: formData.visitPurpose,
        visit_type: visitType,
        image_url: imageUrl,
        approved_status: "Pending",
        in_time: inTime,
        visitor_otp: otp,
      };

      if (isTenant) {
        visitorData.approved_by = Number(userId);
      }

      // Add security-specific fields
      if (isSecurity) {
        visitorData.verified_by_guard = Number(userId);
        visitorData.id_proof_image = idProofUrl;
        if (formData.vehicleNumber) {
          visitorData.vehicle_number = formData.vehicleNumber;
        }
      }

      console.log("Submitting visitor data:", visitorData);

      const { error, data } = await supabase
        .from("visitors")
        .insert([visitorData])
        .select();

      if (error) throw error;

      // If Tenant → Generate Visitor Pass Image and Send WhatsApp
      if (isTenant && data && data[0]) {
        try {
          // Generate Visitor Pass Image
          const element = formRef.current;
          if (element) {
            // You'll need to install html2canvas: npm install html2canvas
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(element);
            const image = canvas.toDataURL("image/png");

            // Upload the screenshot
            const blob = await (await fetch(image)).blob();
            const file = new File(
              [blob],
              `visitor_${formData.fullName.replace(/\s+/g, "_")}.jpg`,
              { type: "image/png" },
            );
            const screenshotResult = await uploadImage(file);
            const screenshotUrl = screenshotResult.url;

            // Send WhatsApp if number exists
            const whatsappNumber =
              formData.whatsappNumber || formData.phoneNumber;
            if (whatsappNumber) {
              // Implement your WhatsApp sending logic here
              console.log(
                "Send WhatsApp to:",
                whatsappNumber,
                "with image:",
                screenshotUrl,
              );

              // Example WhatsApp integration (you can customize this)
              try {
                // You can call your WhatsApp API here
                // await sendWhatsAppMessage(whatsappNumber, screenshotUrl, visitorData);
                console.log("WhatsApp sent successfully");
              } catch (whatsappError) {
                console.error("WhatsApp send failed:", whatsappError);
                // Don't throw error, visitor is already created
              }
            }
          }
        } catch (passError) {
          console.error("Error generating visitor pass:", passError);
          // Don't throw error here, visitor is already created
        }
      }

      setSuccess(true);

      // Clear form and redirect
      setTimeout(() => {
        // Clear form
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

        if (isSecurity) {
          navigate("/dashboard");
        } else {
          navigate("/user/visitor");
        }
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
                        Visitor added successfully! Redirecting...
                      </Alert>
                    </Zoom>
                  )}

                  {/* Main 2-Column Layout */}
                  <Grid container spacing={3}>
                    {/* LEFT COLUMN - Visitor Details */}
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

                    {/* RIGHT COLUMN - Upload Section */}
                    <Grid item xs={12} md={6}>
                      <UploadPanel>
                        <SectionTitle>
                          <CloudUploadIcon />
                          <Typography>Upload Files</Typography>
                        </SectionTitle>

                        {/* Tabs for Security (Photo + ID Proof) */}
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

                            {/* Photo Tab */}
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
                                      {isSecurity && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{
                                            mt: 1,
                                            color: "#6F0B14",
                                            fontStyle: "italic",
                                          }}
                                        >
                                          Photo upload will auto-fill visitor
                                          details
                                        </Typography>
                                      )}
                                    </Box>
                                  </label>
                                </UploadArea>
                              )}
                            </TabPanel>

                            {/* ID Proof Tab */}
                            <TabPanel value={uploadTab} index={1}>
                              {idProofPreview ? (
                                <PreviewCard>
                                  {idProofPreview === "pdf" ? (
                                    <DescriptionIcon
                                      sx={{
                                        fontSize: 50,
                                        color: "#6F0B14",
                                      }}
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
                            </TabPanel>
                          </>
                        ) : (
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
                          </>
                        )}

                        {/* Photo Error */}
                        {errors.photo && uploadTab === 0 && (
                          <Alert
                            severity="error"
                            sx={{ mt: 2, borderRadius: "8px" }}
                          >
                            {errors.photo}
                          </Alert>
                        )}

                        {/* ID Proof Error */}
                        {errors.idProof && uploadTab === 1 && (
                          <Alert
                            severity="error"
                            sx={{ mt: 2, borderRadius: "8px" }}
                          >
                            {errors.idProof}
                          </Alert>
                        )}
                      </UploadPanel>
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
