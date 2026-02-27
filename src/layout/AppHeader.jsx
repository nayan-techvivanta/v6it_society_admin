import { useEffect, useRef, useState } from "react";
import { data, Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import logo from "../assets/Images/Logo/logo.png";
import UserDropdown from "../components/Header/UserDropdown";
import { GiSiren } from "react-icons/gi";
import { PiSirenLight } from "react-icons/pi";
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { FaHandHoldingMedical } from "react-icons/fa6";
import { supabase } from "../api/supabaseClient";
import { useNavigate } from "react-router";
import { FaFireAlt } from "react-icons/fa";
import { FaPersonWalkingArrowRight } from "react-icons/fa6";
import { FaUserInjured } from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { MdSecurity } from "react-icons/md";
import { HiSpeakerphone } from "react-icons/hi";
import { MdWarningAmber } from "react-icons/md";
import NotificationDetailModal from "../components/notification/NotificationDetailModal";
import { useBulkNotification } from "../Hooks/useBulkNotification";
import Announcement from "../components/dialogs/security/Announcement";
import { toast } from "react-toastify";
import { PiSirenDuotone } from "react-icons/pi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppHeader = () => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const navigate = useNavigate();
  const notificationButtonRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const userId = localStorage.getItem("profileId");
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const { sendBulkNotification, isSending, progress } = useBulkNotification();
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const EMERGENCY_TYPES = [
    {
      id: "fire",
      label: "Fire Emergency",
      value: "Fire Emergency",
      color: "text-red-600",
      bgColor: "bg-red-100",
      Icon: FaFireAlt,
    },
    {
      id: "medical",
      label: "Medical Emergency",
      value: "Medical Emergency",
      color: "text-red-600",
      bgColor: "bg-red-100",
      Icon: FaHandHoldingMedical,
    },
    {
      id: "theft",
      label: "Theft / Intruder",
      value: "Theft / Intruder",
      color: "text-red-600",
      bgColor: "bg-red-100",
      Icon: FaPersonWalkingArrowRight,
    },
    {
      id: "other",
      label: "Other Emergency",
      value: "Other Emergency",
      color: "text-red-600",
      bgColor: "bg-red-100",
      Icon: MdWarningAmber,
    },
  ];
  const storedRole = localStorage.getItem("role");

  let userRole = storedRole?.toLowerCase().replace(/-/g, "");

  if (userRole === "tanento") userRole = "tenantowner";
  if (userRole === "tanentm") userRole = "tenantmember";

  const isTenant = userRole === "tenantowner" || userRole === "tenantmember";

  const isUserModuleRole =
    userRole === "tenantowner" ||
    userRole === "tenantmember" ||
    userRole === "security";

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isNotificationOpen &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  const fetchNotifications = async () => {
    if (!userId) return;

    setLoadingNotifications(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data);
    }

    setLoadingNotifications(false);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      fetchNotifications();
    }

    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    setIsNotificationOpen(false);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedNotification(null);
  };

  const handleSendEmergency = async () => {
    if (!selectedEmergencyType) {
      toast.warning("Please select an emergency type");
      return;
    }

    if (isSendingEmergency) return;

    try {
      setIsSendingEmergency(true);

      // 1️⃣ Get tenant society
      const { data: tenantData, error: tenantError } = await supabase
        .from("users")
        .select("society_id")
        .eq("id", userId)
        .single();

      if (tenantError || !tenantData?.society_id) {
        toast.error("Society not found");
        return;
      }

      const societyId = tenantData.society_id;

      // 2️⃣ Fetch security users only
      const { data: securityUsers, error: securityError } = await supabase
        .from("users")
        .select("id,fcm_token")
        .eq("society_id", societyId)
        .eq("role_type", "Security");

      if (securityError || !securityUsers?.length) {
        toast.error("No security users found");
        return;
      }

      const fcmTokens = securityUsers.map((u) => u.fcm_token).filter(Boolean);

      if (!fcmTokens.length) {
        toast.error("No valid FCM tokens found");
        return;
      }

      const notificationsToInsert = securityUsers.map((u) => ({
        title: `🚨 EMERGENCY: ${selectedEmergencyType}`,
        body: `Emergency reported: ${selectedEmergencyType}`,
        type: "emergency",
        user_id: u.id,
        society_id: societyId,
        is_read: false,
        is_delete: false,
      }));
      console.log("notificationsToInsert", notificationsToInsert);

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notificationsToInsert);

      if (insertError) {
        toast.error("Failed to save emergency notifications");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            tokens: fcmTokens,
            title: `🚨 EMERGENCY: ${selectedEmergencyType}`,
            type: "emergency",
            body: `Emergency reported: ${selectedEmergencyType}`,
            data: { type: "emergency", society_id: societyId },
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        console.error("FCM Function Error:", result);
        toast.error("Failed to send push notifications");
      } else {
        toast.success("🚨 Emergency alert sent to security successfully");
      }

      setIsEmergencyModalOpen(false);
      setSelectedEmergencyType("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSendingEmergency(false);
    }
  };
  const navigateToNotificationSource = (notification) => {
    closeDetailModal();

    switch (notification.type) {
      case "document":
        if (notification.document) {
          window.open(notification.document, "_blank");
        }
        break;
      case "society":
        if (notification.society_id) {
          navigate(`/society/${notification.society_id}`);
        }
        break;
      case "building":
        if (notification.building_id) {
          navigate(`/building/${notification.building_id}`);
        }
        break;
      case "flat":
        if (notification.flat_id) {
          navigate(`/flat/${notification.flat_id}`);
        }
        break;
      default:
        break;
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-30">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col lg:flex-row">
        <div className="flex items-center justify-between w-full gap-2 px-4 py-3 border-b border-gray-200 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-6 lg:py-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg lg:h-11 lg:w-11 hover:bg-gray-50 transition-colors"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-3"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <Link to="/dashboard" className="lg:hidden">
            <img src={logo} alt="Logo" className="h-8" />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg hover:bg-gray-100 lg:hidden transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                  <svg
                    className="fill-gray-500"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                      fill=""
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all xl:w-[430px]"
                />

                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <span> ⌘ </span>
                  <span> K </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User dropdown section - visible on desktop, hidden on mobile unless menu is open */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-4 py-4 bg-white lg:flex lg:justify-end lg:px-6 lg:py-4 border-t border-gray-200 lg:border-t-0`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            {/* <NotificationDropdown /> */}

            {isUserModuleRole && (
              <div className="relative" ref={notificationButtonRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    fetchNotifications();
                  }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
                >
                  <MdOutlineNotificationsActive size={25} />

                  {/* Show red dot only if unread exists */}
                  {notifications.some((n) => !n.is_read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown - Responsive */}
                {isNotificationOpen && (
                  <div
                    ref={notificationDropdownRef}
                    className="fixed sm:absolute top-auto left-0 right-0 sm:left-auto md:left-[-90px] sm:right-0 mt-3 mx-4 sm:mx-0 w-auto sm:w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[80vh] sm:max-h-96 overflow-y-auto"
                    style={{
                      top: "40px",
                      maxHeight: "calc(60vh - 80px)",
                    }}
                  >
                    <div className="p-4 border-b font-semibold text-gray-700 sticky top-0 bg-white z-10">
                      Notifications
                    </div>

                    <div className="overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No Notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                              !notification.is_read
                                ? "bg-blue-50 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-800">
                              {notification.title}
                              {!notification.is_read && (
                                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.body || notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {userRole === "security" && (
              <button
                onClick={() => setIsAnnounceModalOpen(true)}
                className="
      relative
      flex items-center justify-center
      w-11 h-11
      rounded-full
      text-white
      bg-gradient-to-br from-[#6F0B14] to-[#8A0F1B]
      shadow-md
      hover:from-[#8A0F1B] hover:to-[#A51423]
      hover:shadow-lg
      active:scale-95
      transition-all duration-200
    "
              >
                <MdCampaign size={21} />
              </button>
            )}
            {isTenant && (
              <button
                className="
              relative
              flex items-center justify-center
              w-11 h-11
              rounded-full
              bg-red-600
              text-white
                shadow-lg
               hover:bg-red-700
              hover:shadow-xl
              active:scale-95
              transition-all duration-200
              "
                onClick={() => setIsEmergencyModalOpen(true)}
              >
                <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-60"></span>

                {/* Icon */}
                <PiSirenLight size={22} className="relative z-10" />
              </button>
            )}
            {isEmergencyModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-slideUp">
                  {/* Header */}
                  <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                        relative w-12 h-12 rounded-full                 
                        flex items-center justify-center
                        bg-gradient-to-b from-red-400 to-red-600
                      "
                      >
                        {/* Gloss highlight */}
                        <span className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-full blur-sm pointer-events-none"></span>

                        <GiSiren
                          size={35}
                          className="text-white drop-shadow-md relative z-10"
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          Emergency Alert
                        </h2>
                        <p className="text-sm text-gray-600">
                          Select the type of emergency
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Type Selection - Radio Buttons */}
                  <div className="p-6 space-y-4">
                    {EMERGENCY_TYPES.map((type) => {
                      const IconComponent = type.Icon;

                      return (
                        <label
                          key={type.id}
                          className={`
                            flex items-center p-4 rounded-xl border-2 cursor-pointer
                            transition-all duration-200
                            ${
                              selectedEmergencyType === type.value
                                ? "border-red-500 bg-red-50 shadow-md "
                                : "border-gray-200 hover:border-red-200 hover:bg-gray-50 "
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="emergencyType"
                            value={type.value}
                            checked={selectedEmergencyType === type.value}
                            onChange={(e) =>
                              setSelectedEmergencyType(e.target.value)
                            }
                            className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                          />

                          <div className="ml-4 flex items-center gap-3">
                            <IconComponent
                              className={`text-xl ${
                                selectedEmergencyType === type.value
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            />

                            <span
                              className={`font-medium ${
                                selectedEmergencyType === type.value
                                  ? "text-red-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {type.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <div className="flex gap-4">
                      {/* Cancel Button */}
                      <button
                        onClick={() => {
                          setIsEmergencyModalOpen(false);
                          setSelectedEmergencyType("");
                        }}
                        className="
                        relative flex-1 py-3 px-6 rounded-full font-bold text-lg
                        flex items-center justify-center gap-3
                        bg-gradient-to-b from-gray-200 to-gray-400 text-gray-800
                        shadow-[0_6px_0_rgb(107,114,128),0_10px_20px_rgba(0,0,0,0.25)]
                        hover:brightness-105
                        active:translate-y-[4px]
                        active:shadow-[0_2px_0_rgb(107,114,128)]
                        transition-all duration-150
      "
                      >
                        <span className="tracking-wide">Cancel</span>

                        {/* Gloss */}
                        <span className="absolute top-0 left-0 w-full h-1/2 bg-white/30 rounded-t-2xl blur-sm pointer-events-none"></span>
                      </button>

                      {/* Emergency Button */}
                      <button
                        onClick={handleSendEmergency}
                        disabled={!selectedEmergencyType || isSendingEmergency}
                        className={`
                          relative flex-1 py-3 px-6 rounded-full font-bold text-lg
                          flex items-center justify-center gap-3
                          transition-all duration-150
                          ${
                            selectedEmergencyType && !isSendingEmergency
                              ? `
                                bg-gradient-to-b from-red-500 to-red-700 text-white
                                shadow-[0_8px_0_rgb(127,29,29),0_12px_25px_rgba(0,0,0,0.4)]
                                hover:brightness-110
                                active:translate-y-[6px]
                                active:shadow-[0_2px_0_rgb(127,29,29)]
                              `
                              : "bg-gray-400 text-white cursor-not-allowed"
                          }
                        `}
                      >
                        {/* Gloss */}
                        {selectedEmergencyType && !isSendingEmergency && (
                          <span className="absolute top-0 left-0 w-full h-1/2 bg-white/20 rounded-t-2xl blur-sm pointer-events-none"></span>
                        )}

                        {isSendingEmergency ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="tracking-wide">
                              Sending Alert...
                            </span>
                          </>
                        ) : (
                          <>
                            <PiSirenDuotone
                              size={28}
                              className="drop-shadow-md"
                            />
                            <span className="tracking-wider">EMERGENCY</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Warning Message */}
                    <p className="text-xs text-center text-gray-500 mt-4">
                      ⚠️ This will immediately notify all security personnel
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* User Area */}
          <UserDropdown />
        </div>
      </div>
      <Announcement
        open={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        userRole={userRole}
      />
      {/* Notification Detail Modal */}
      {isDetailModalOpen && selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={closeDetailModal}
          onNavigate={navigateToNotificationSource}
        />
      )}
    </header>
  );
};

export default AppHeader;
