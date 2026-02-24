// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   Avatar,
//   Badge,
//   CircularProgress,
//   Drawer,
//   Tab,
//   Tabs,
//   TextField,
//   InputAdornment,
//   Divider,
//   Tooltip,
// } from "@mui/material";
// import {
//   Add,
//   Search,
//   Close,
//   Security,
//   Person,
//   Chat,
//   ArrowBack,
//   Send,
//   CheckCircle,
//   DoneAll,
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import {
//   fetchChatUsers,
//   fetchSocietyUsers,
//   getOrCreateChatRoom,
//   subscribeGlobal,
// } from "./Chatservice";

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const myId = () => Number(localStorage.getItem("profileId") || 0);
// const societyId = () => Number(localStorage.getItem("societyId") || 0);
// const myRole = () => localStorage.getItem("role") || "";
// const buildingId = () => localStorage.getItem("buildingId") || null;

// const initials = (name = "") =>
//   name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

// const fmtTime = (date) => {
//   if (!date) return "";
//   const d = new Date(date);
//   const now = new Date();
//   if (d.toDateString() === now.toDateString())
//     return d.toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
// };

// const roleLabel = (role) => {
//   if (role === "Security") return "Security Guard";
//   if (role === "Tanent-O") return "Owner";
//   if (role === "Tanent-M") return "Member";
//   return role;
// };

// // ─── UserPickerSheet ──────────────────────────────────────────────────────────
// const UserPickerSheet = ({ open, onClose, onSelect }) => {
//   const [tab, setTab] = useState(0);
//   const [search, setSearch] = useState("");
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!open) return;
//     setLoading(true);
//     fetchSocietyUsers({
//       myId: myId(),
//       myRole: myRole(),
//       societyId: societyId(),
//       buildingId: buildingId(),
//     })
//       .then(setUsers)
//       .finally(() => setLoading(false));
//   }, [open]);

//   const filtered = (roles) =>
//     users.filter(
//       (u) =>
//         roles.includes(u.role_type) &&
//         u.name?.toLowerCase().includes(search.toLowerCase()),
//     );

//   const security = filtered(["Security"]);
//   const tenants = filtered(["Tanent-O", "Tanent-M"]);
//   const list = tab === 0 ? security : tenants;

//   return (
//     <Drawer
//       anchor="bottom"
//       open={open}
//       onClose={onClose}
//       PaperProps={{
//         sx: {
//           borderRadius: "20px 20px 0 0",
//           maxHeight: "85vh",
//           display: "flex",
//           flexDirection: "column",
//         },
//       }}
//     >
//       {/* Handle */}
//       <div className="flex justify-center pt-3 pb-1">
//         <div className="w-10 h-1 rounded-full bg-gray-300" />
//       </div>

//       {/* Header */}
//       <div className="flex items-center justify-between px-4 pb-3 pt-1">
//         <span className="text-lg font-bold text-gray-800">New Chat</span>
//         <button
//           onClick={onClose}
//           className="p-1 rounded-full hover:bg-gray-100 transition-colors"
//         >
//           <Close fontSize="small" className="text-gray-500" />
//         </button>
//       </div>

//       {/* Search */}
//       <div className="px-4 pb-3">
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Search users..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search sx={{ color: "#6F0B14", fontSize: 18 }} />
//               </InputAdornment>
//             ),
//           }}
//           sx={{
//             "& .MuiOutlinedInput-root": {
//               borderRadius: "24px",
//               "& fieldset": { borderColor: "rgba(111,11,20,0.2)" },
//               "&:hover fieldset": { borderColor: "#6F0B14" },
//               "&.Mui-focused fieldset": {
//                 borderColor: "#6F0B14",
//                 borderWidth: "2px",
//               },
//             },
//           }}
//         />
//       </div>

//       {/* Tabs */}
//       <Tabs
//         value={tab}
//         onChange={(_, v) => setTab(v)}
//         sx={{
//           px: 2,
//           borderBottom: "1px solid rgba(0,0,0,0.08)",
//           "& .MuiTab-root.Mui-selected": { color: "#6F0B14" },
//           "& .MuiTabs-indicator": { bgcolor: "#6F0B14" },
//         }}
//       >
//         <Tab
//           icon={<Security sx={{ fontSize: 16 }} />}
//           iconPosition="start"
//           label={`Security (${security.length})`}
//           sx={{ textTransform: "none", fontSize: 13, minHeight: 44 }}
//         />
//         <Tab
//           icon={<Person sx={{ fontSize: 16 }} />}
//           iconPosition="start"
//           label={`Residents (${tenants.length})`}
//           sx={{ textTransform: "none", fontSize: 13, minHeight: 44 }}
//         />
//       </Tabs>

//       {/* List */}
//       <div className="flex-1 overflow-y-auto px-2 py-2">
//         {loading ? (
//           <div className="flex justify-center mt-8">
//             <CircularProgress size={28} sx={{ color: "#6F0B14" }} />
//           </div>
//         ) : list.length === 0 ? (
//           <div className="flex flex-col items-center justify-center mt-10 gap-2">
//             <Chat sx={{ fontSize: 40, color: "rgba(111,11,20,0.15)" }} />
//             <p className="text-sm text-gray-400">No users found</p>
//           </div>
//         ) : (
//           list.map((user, i) => (
//             <React.Fragment key={user.id}>
//               <button
//                 onClick={() => onSelect(user)}
//                 className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-all text-left group"
//               >
//                 <Avatar
//                   src={user.profile_url}
//                   sx={{
//                     width: 44,
//                     height: 44,
//                     bgcolor: "#6F0B14",
//                     fontSize: 15,
//                     fontWeight: 700,
//                   }}
//                 >
//                   {!user.profile_url && initials(user.name)}
//                 </Avatar>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-800 truncate">
//                     {user.name}
//                   </p>
//                   <p className="text-xs text-gray-400 truncate">
//                     {roleLabel(user.role_type)}
//                     {user.flatNumber ? ` · Flat ${user.flatNumber}` : ""}
//                   </p>
//                 </div>
//                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
//                   <div className="text-xs text-[#6F0B14] font-medium">
//                     Chat →
//                   </div>
//                 </div>
//               </button>
//               {i < list.length - 1 && <Divider sx={{ mx: 2, opacity: 0.5 }} />}
//             </React.Fragment>
//           ))
//         )}
//       </div>
//     </Drawer>
//   );
// };

// // ─── ChatListPage ─────────────────────────────────────────────────────────────
// const ChatListPage = () => {
//   const navigate = useNavigate();
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pickerOpen, setPicker] = useState(false);
//   const [totalUnread, setUnread] = useState(0);

//   const loadChats = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { chatUsers, totalUnreadCount } = await fetchChatUsers({
//         myId: myId(),
//         societyId: societyId(),
//       });
//       setChats(chatUsers);
//       setUnread(totalUnreadCount);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Realtime global subscription
//   useEffect(() => {
//     loadChats();
//     const unsub = subscribeGlobal({ myId: myId(), onNew: loadChats });
//     return unsub;
//   }, [loadChats]);

//   const handleSelectUser = async (user) => {
//     setPicker(false);
//     const roomId = await getOrCreateChatRoom({
//       currentUserId: myId(),
//       otherUserId: user.id,
//       societyId: societyId(),
//     });
//     navigate(`/user/chat/${roomId}`, { state: { otherUser: user } });
//   };

//   const handleChatClick = async (user) => {
//     const roomId = await getOrCreateChatRoom({
//       currentUserId: myId(),
//       otherUserId: user.id,
//       societyId: societyId(),
//     });
//     navigate(`/user/chat/${roomId}`, { state: { otherUser: user } });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-gray-50 flex flex-col">
//       {/* ── Header ── */}
//       <div className="sticky top-0 z-10 bg-gradient-to-r from-[#6F0B14] via-[#a82834] to-[#6F0B14] px-4 py-4 shadow-lg">
//         <div className="max-w-2xl mx-auto flex items-center justify-between">
//           <div>
//             <h1 className="text-xl font-bold text-white tracking-tight">
//               Messages
//             </h1>
//             <p className="text-xs text-red-200 mt-0.5">
//               {chats.length} conversation{chats.length !== 1 ? "s" : ""}
//               {totalUnread > 0 && ` · ${totalUnread} unread`}
//             </p>
//           </div>
//           <Tooltip title="New Chat">
//             <button
//               onClick={() => setPicker(true)}
//               className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
//             >
//               <Add sx={{ color: "#fff", fontSize: 22 }} />
//             </button>
//           </Tooltip>
//         </div>
//       </div>

//       {/* ── List ── */}
//       <div className="flex-1 max-w-2xl w-full mx-auto px-3 py-3 flex flex-col gap-2">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center flex-1 gap-3 mt-16">
//             <CircularProgress sx={{ color: "#6F0B14" }} />
//             <p className="text-sm text-gray-400">Loading chats...</p>
//           </div>
//         ) : chats.length === 0 ? (
//           <div className="flex flex-col items-center justify-center flex-1 gap-4 mt-16">
//             <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
//               <Chat sx={{ fontSize: 40, color: "rgba(111,11,20,0.25)" }} />
//             </div>
//             <div className="text-center">
//               <p className="text-base font-semibold text-gray-600">
//                 No chats yet
//               </p>
//               <p className="text-sm text-gray-400 mt-1">
//                 Tap <strong>+</strong> to start a conversation
//               </p>
//             </div>
//           </div>
//         ) : (
//           chats.map((user, i) => (
//             <button
//               key={user.id}
//               onClick={() => handleChatClick(user)}
//               className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-left"
//               style={{ animationDelay: `${i * 40}ms` }}
//             >
//               {/* Avatar with unread badge */}
//               <Badge
//                 badgeContent={
//                   user.unreadCount > 0
//                     ? user.unreadCount > 99
//                       ? "99+"
//                       : user.unreadCount
//                     : 0
//                 }
//                 sx={{
//                   "& .MuiBadge-badge": {
//                     bgcolor: "#6F0B14",
//                     color: "#fff",
//                     fontSize: 10,
//                     fontWeight: 700,
//                     minWidth: 18,
//                     height: 18,
//                     padding: "0 4px",
//                   },
//                 }}
//               >
//                 <Avatar
//                   src={user.profile_url}
//                   sx={{
//                     width: 50,
//                     height: 50,
//                     bgcolor: "#6F0B14",
//                     fontSize: 17,
//                     fontWeight: 700,
//                   }}
//                 >
//                   {!user.profile_url && initials(user.name)}
//                 </Avatar>
//               </Badge>

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p
//                   className={`text-sm truncate ${user.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
//                 >
//                   {user.name}
//                 </p>
//                 <p className="text-xs text-gray-400 truncate mt-0.5">
//                   {roleLabel(user.role_type)}
//                 </p>
//               </div>

//               {/* Time + unread dot */}
//               <div className="flex flex-col items-end gap-1 flex-shrink-0">
//                 {user.lastMessageTime && (
//                   <span
//                     className={`text-xs ${user.unreadCount > 0 ? "text-[#6F0B14] font-semibold" : "text-gray-400"}`}
//                   >
//                     {fmtTime(user.lastMessageTime)}
//                   </span>
//                 )}
//                 {user.unreadCount > 0 && (
//                   <div className="w-2 h-2 rounded-full bg-[#6F0B14]" />
//                 )}
//               </div>
//             </button>
//           ))
//         )}
//       </div>

//       <UserPickerSheet
//         open={pickerOpen}
//         onClose={() => setPicker(false)}
//         onSelect={handleSelectUser}
//       />
//     </div>
//   );
// };

// export default ChatListPage;
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Avatar,
  Badge,
  CircularProgress,
  Drawer,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Add,
  Search,
  Close,
  Security,
  Person,
  Chat,
  ArrowBack,
  Send,
  CheckCircle,
  DoneAll,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  fetchChatUsers,
  fetchSocietyUsers,
  getOrCreateChatRoom,
  subscribeGlobal,
} from "./Chatservice";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const myId = () => Number(localStorage.getItem("profileId") || 0);
const societyId = () => Number(localStorage.getItem("societyId") || 0);
const myRole = () => localStorage.getItem("role") || "";
const buildingId = () => localStorage.getItem("buildingId") || null;

const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fmtTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const roleLabel = (role) => {
  if (role === "Security") return "Security Guard";
  if (role === "Tanent-O") return "Owner";
  if (role === "Tanent-M") return "Member";
  return role;
};

// ─── UserPickerSheet ──────────────────────────────────────────────────────────
const UserPickerSheet = ({ open, onClose, onSelect }) => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchSocietyUsers({
      myId: myId(),
      myRole: myRole(),
      societyId: societyId(),
      buildingId: buildingId(),
    })
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = (roles) =>
    users.filter(
      (u) =>
        roles.includes(u.role_type) &&
        u.name?.toLowerCase().includes(search.toLowerCase()),
    );

  const security = filtered(["Security"]);
  const tenants = filtered(["Tanent-O", "Tanent-M"]);
  const list = tab === 0 ? security : tenants;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          //   borderTopLeftRadius: "24px",

          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-12 h-1.5 rounded-full bg-gray-300" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-1">
        <span className="text-xl font-semibold text-gray-800">New Chat</span>
        <IconButton onClick={onClose} size="small" sx={{ color: "#6B7280" }}>
          <Close />
        </IconButton>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#9CA3AF", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
              backgroundColor: "#F9FAFB",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "#E5E7EB" },
              "&.Mui-focused fieldset": {
                borderColor: "#6F0B14",
                borderWidth: "1.5px",
              },
            },
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: 3,
          borderBottom: "1px solid #F3F4F6",
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "0.9rem",
            fontWeight: 500,
            minHeight: 48,
            color: "#6B7280",
          },
          "& .MuiTab-root.Mui-selected": { color: "#6F0B14", fontWeight: 600 },
          "& .MuiTabs-indicator": {
            bgcolor: "#6F0B14",
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        }}
      >
        <Tab
          label={`Security (${security.length})`}
          icon={<Security sx={{ fontSize: 18 }} />}
          iconPosition="start"
        />
        <Tab
          label={`Residents (${tenants.length})`}
          icon={<Person sx={{ fontSize: 18 }} />}
          iconPosition="start"
        />
      </Tabs>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <CircularProgress size={32} sx={{ color: "#6F0B14" }} />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <Chat sx={{ fontSize: 40, color: "#E5E7EB" }} />
            <p className="text-sm text-gray-400">No users found</p>
          </div>
        ) : (
          list.map((user, i) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <Avatar
                src={user.profile_url}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "#6F0B14",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {!user.profile_url && initials(user.name)}
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {roleLabel(user.role_type)}
                  {user.flatNumber && ` · Flat ${user.flatNumber}`}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-[#6F0B14]">
                  Start chat →
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </Drawer>
  );
};

// ─── ChatListPage ─────────────────────────────────────────────────────────────
const ChatListPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPicker] = useState(false);
  const [totalUnread, setUnread] = useState(0);

  const loadChats = useCallback(async () => {
    setLoading(true);
    try {
      const { chatUsers, totalUnreadCount } = await fetchChatUsers({
        myId: myId(),
        societyId: societyId(),
      });
      setChats(chatUsers);
      setUnread(totalUnreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime global subscription
  useEffect(() => {
    loadChats();
    const unsub = subscribeGlobal({ myId: myId(), onNew: loadChats });
    return unsub;
  }, [loadChats]);

  const handleSelectUser = async (user) => {
    setPicker(false);
    const roomId = await getOrCreateChatRoom({
      currentUserId: myId(),
      otherUserId: user.id,
      societyId: societyId(),
    });
    navigate(`/user/chat/${roomId}`, { state: { otherUser: user } });
  };

  const handleChatClick = async (user) => {
    const roomId = await getOrCreateChatRoom({
      currentUserId: myId(),
      otherUserId: user.id,
      societyId: societyId(),
    });
    navigate(`/user/chat/${roomId}`, { state: { otherUser: user } });
  };

  return (
    <div className="h-[85vh] flex flex-col bg-gradient-to-b from-gray-50 to-white ">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#6F0B14] to-[#8B1E1E] px-5 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Messages
            </h1>
            <p className="text-sm text-red-200 mt-1">
              {chats.length} {chats.length === 1 ? "chat" : "chats"}
              {totalUnread > 0 && ` · ${totalUnread} unread`}
            </p>
          </div>
          <Tooltip title="New Chat" arrow>
            <IconButton
              onClick={() => setPicker(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s",
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <CircularProgress sx={{ color: "#6F0B14" }} />
            <p className="text-sm text-gray-400">Loading conversations...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
              <Chat sx={{ fontSize: 40, color: "rgba(111,11,20,0.2)" }} />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-lg font-semibold text-gray-600">
                No conversations yet
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Tap the <span className="font-medium text-[#6F0B14]">+</span>{" "}
                button to start chatting with security or residents
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((user, i) => (
              <button
                key={user.id}
                onClick={() => handleChatClick(user)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-red-100 active:scale-[0.99] text-left"
              >
                <Badge
                  badgeContent={
                    user.unreadCount > 0
                      ? user.unreadCount > 99
                        ? "99+"
                        : user.unreadCount
                      : 0
                  }
                  color="error"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#6F0B14",
                      fontSize: 10,
                      fontWeight: 600,
                      minWidth: 20,
                      height: 20,
                    },
                  }}
                >
                  <Avatar
                    src={user.profile_url}
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "#6F0B14",
                      fontSize: 18,
                      fontWeight: 600,
                    }}
                  >
                    {!user.profile_url && initials(user.name)}
                  </Avatar>
                </Badge>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-base truncate ${
                        user.unreadCount > 0
                          ? "font-bold text-gray-900"
                          : "font-semibold text-gray-700"
                      }`}
                    >
                      {user.name}
                    </p>
                    {user.lastMessageTime && (
                      <span
                        className={`text-xs flex-shrink-0 ${
                          user.unreadCount > 0
                            ? "text-[#6F0B14] font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {fmtTime(user.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      {roleLabel(user.role_type)}
                      {user.flatNumber && ` · Flat ${user.flatNumber}`}
                    </p>
                    {user.unreadCount > 0 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6F0B14] ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Safe Area for Mobile */}
      <div className="flex-shrink-0 h-safe-bottom bg-gradient-to-b from-transparent to-white" />

      <UserPickerSheet
        open={pickerOpen}
        onClose={() => setPicker(false)}
        onSelect={handleSelectUser}
      />
    </div>
  );
};

export default ChatListPage;
