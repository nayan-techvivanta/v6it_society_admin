// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { Avatar, CircularProgress, Tooltip } from "@mui/material";
// import { ArrowBack, Send, DoneAll, Done, Lock } from "@mui/icons-material";
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import { supabase } from "../../../api/supabaseClient";
// import {
//   fetchMessages,
//   sendMessage,
//   markAsRead,
//   subscribeMessages,
// } from "./Chatservice";

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const myId = () => Number(localStorage.getItem("profileId") || 0);
// const myRole = () => localStorage.getItem("role") || "";

// const initials = (name = "") =>
//   name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

// const fmtTime = (iso) => {
//   if (!iso) return "";
//   return new Date(iso).toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const fmtDateLabel = (iso) => {
//   if (!iso) return "";
//   const d = new Date(iso);
//   const now = new Date();
//   const yesterday = new Date();
//   yesterday.setDate(now.getDate() - 1);
//   if (d.toDateString() === now.toDateString()) return "Today";
//   if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
//   return d.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "long",
//     year: "numeric",
//   });
// };

// // Group messages by date
// const groupByDate = (msgs) => {
//   const groups = [];
//   let lastDate = null;
//   msgs.forEach((msg) => {
//     const d = new Date(msg.created_at).toDateString();
//     if (d !== lastDate) {
//       groups.push({
//         type: "label",
//         label: fmtDateLabel(msg.created_at),
//         id: `label-${d}`,
//       });
//       lastDate = d;
//     }
//     groups.push({ type: "msg", ...msg });
//   });
//   return groups;
// };

// // ─── Component ────────────────────────────────────────────────────────────────
// const ChatRoomPage = () => {
//   const navigate = useNavigate();
//   const { roomId } = useParams();
//   const { state } = useLocation();
//   const otherUser = state?.otherUser;
//   const chatRoomId = Number(roomId);

//   const me = myId();
//   const role = myRole();

//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [myProfile, setMyProfile] = useState({ name: "", profile_url: "" });

//   const bottomRef = useRef(null);
//   const inputRef = useRef(null);

//   // Can this user send? (Security always yes, others check is_chat_enabled)
//   const canSend =
//     role === "Security" ? true : otherUser?.is_chat_enabled !== false;

//   // Load my profile
//   useEffect(() => {
//     if (!me) return;
//     supabase
//       .from("users")
//       .select("name, profile_url")
//       .eq("id", me)
//       .single()
//       .then(({ data }) => {
//         if (data) setMyProfile(data);
//       });
//   }, [me]);

//   // Load messages
//   const loadMessages = useCallback(async () => {
//     setLoading(true);
//     const data = await fetchMessages(chatRoomId);
//     setMessages(data);
//     setLoading(false);
//     await markAsRead({ chatRoomId, myId: me });
//   }, [chatRoomId, me]);

//   // Realtime subscription
//   useEffect(() => {
//     loadMessages();
//     const unsub = subscribeMessages({
//       chatRoomId,
//       onNew: (newMsg) => {
//         setMessages((prev) => [...prev, newMsg]);
//         if (newMsg.sender_id !== me) markAsRead({ chatRoomId, myId: me });
//         setTimeout(
//           () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
//           50,
//         );
//       },
//     });
//     return unsub;
//   }, [chatRoomId, me, loadMessages]);

//   // Auto scroll on load
//   useEffect(() => {
//     if (!loading) {
//       setTimeout(
//         () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
//         100,
//       );
//     }
//   }, [loading]);

//   const handleSend = async () => {
//     const trimmed = text.trim();
//     if (!trimmed || !canSend || sending) return;
//     setText("");
//     setSending(true);
//     try {
//       await sendMessage({ chatRoomId, senderId: me, text: trimmed });
//     } finally {
//       setSending(false);
//       inputRef.current?.focus();
//     }
//   };

//   const handleKey = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const grouped = groupByDate(messages);

//   return (
//     <div
//       className="flex flex-col h-screen bg-[#f0ebe6]"
//       style={{
//         backgroundImage:
//           "radial-gradient(circle at 1px 1px, rgba(111,11,20,0.04) 1px, transparent 0)",
//         backgroundSize: "20px 20px",
//         // padding: "0",
//       }}
//     >
//       {/* ── App Bar ── */}
//       <div className="bg-gradient-to-r from-[#6F0B14] via-[#a82834] to-[#6F0B14] px-3 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">
//         <button
//           onClick={() => navigate("/user/chat")}
//           className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all flex-shrink-0"
//         >
//           <ArrowBack sx={{ color: "#fff", fontSize: 20 }} />
//         </button>

//         <Avatar
//           src={otherUser?.profile_url}
//           sx={{
//             width: 40,
//             height: 40,
//             bgcolor: "rgba(255,255,255,0.2)",
//             fontSize: 14,
//             fontWeight: 700,
//             border: "2px solid rgba(255,255,255,0.3)",
//             flexShrink: 0,
//           }}
//         >
//           {!otherUser?.profile_url && initials(otherUser?.name)}
//         </Avatar>

//         <div className="flex-1 min-w-0">
//           <p className="text-white font-bold text-base leading-tight truncate">
//             {otherUser?.name || "Chat"}
//           </p>
//           <p className="text-red-200 text-xs truncate">
//             {otherUser?.role_type === "Security"
//               ? "Security Guard"
//               : otherUser?.role_type === "Tanent-O"
//                 ? "Owner"
//                 : otherUser?.role_type === "Tanent-M"
//                   ? "Member"
//                   : otherUser?.role_type}
//           </p>
//         </div>
//       </div>

//       {/* ── Messages ── */}
//       <div
//         className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1"
//         style={{
//           scrollbarWidth: "thin",
//           scrollbarColor: "rgba(111,11,20,0.2) transparent",
//         }}
//       >
//         {loading ? (
//           <div className="flex flex-col items-center justify-center flex-1 gap-3">
//             <CircularProgress size={32} sx={{ color: "#6F0B14" }} />
//             <p className="text-sm text-gray-400">Loading messages...</p>
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center flex-1 gap-3">
//             <div className="px-5 py-3 rounded-2xl bg-white/70 backdrop-blur shadow-sm text-center">
//               <p className="text-sm text-gray-500">No messages yet</p>
//               <p className="text-xs text-gray-400 mt-1">
//                 Say hi to {otherUser?.name?.split(" ")[0]} 👋
//               </p>
//             </div>
//           </div>
//         ) : (
//           grouped.map((item) => {
//             // Date label
//             if (item.type === "label") {
//               return (
//                 <div key={item.id} className="flex justify-center my-3">
//                   <span className="text-xs text-gray-500 bg-white/70 backdrop-blur px-3 py-1 rounded-full shadow-sm font-medium">
//                     {item.label}
//                   </span>
//                 </div>
//               );
//             }

//             const isMe = item.sender_id === me;
//             return (
//               <div
//                 key={item.id}
//                 className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"} mb-1`}
//               >
//                 {/* Avatar */}
//                 <Tooltip
//                   title={isMe ? myProfile.name : otherUser?.name}
//                   placement={isMe ? "left" : "right"}
//                 >
//                   <Avatar
//                     src={isMe ? myProfile.profile_url : otherUser?.profile_url}
//                     sx={{
//                       width: 26,
//                       height: 26,
//                       fontSize: 10,
//                       fontWeight: 700,
//                       bgcolor: "#6F0B14",
//                       flexShrink: 0,
//                     }}
//                   >
//                     {initials(isMe ? myProfile.name : otherUser?.name)}
//                   </Avatar>
//                 </Tooltip>

//                 {/* Bubble */}
//                 <div
//                   className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[72%] sm:max-w-[60%]`}
//                 >
//                   <div
//                     className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
//                       isMe
//                         ? "bg-gradient-to-br from-[#6F0B14] to-[#a82834] text-white rounded-br-sm"
//                         : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
//                     }`}
//                   >
//                     {item.message_text}
//                   </div>
//                   {/* Time + read status */}
//                   <div
//                     className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}
//                   >
//                     <span className="text-[10px] text-gray-400">
//                       {fmtTime(item.created_at)}
//                     </span>
//                     {isMe &&
//                       (item.is_read ? (
//                         <DoneAll sx={{ fontSize: 13, color: "#6F0B14" }} />
//                       ) : (
//                         <Done sx={{ fontSize: 13, color: "#9ca3af" }} />
//                       ))}
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* ── Input Bar ── */}
//       {canSend ? (
//         <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-3 flex items-end gap-2 shadow-lg">
//           <div className="flex-1 min-w-0">
//             <textarea
//               ref={inputRef}
//               rows={1}
//               value={text}
//               onChange={(e) => {
//                 setText(e.target.value);
//                 e.target.style.height = "auto";
//                 e.target.style.height =
//                   Math.min(e.target.scrollHeight, 120) + "px";
//               }}
//               onKeyDown={handleKey}
//               placeholder="Type a message..."
//               className="w-full resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#6F0B14] focus:ring-2 focus:ring-[#6F0B14]/10 transition-all"
//               style={{ minHeight: 42, maxHeight: 120, overflowY: "auto" }}
//             />
//           </div>
//           <button
//             onClick={handleSend}
//             disabled={!text.trim() || sending}
//             className="w-11 h-11 rounded-full bg-[#6F0B14] hover:bg-[#8B1E1E] disabled:bg-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:scale-100 shadow-md flex-shrink-0"
//           >
//             {sending ? (
//               <CircularProgress size={18} sx={{ color: "#fff" }} />
//             ) : (
//               <Send
//                 sx={{ color: text.trim() ? "#fff" : "#9ca3af", fontSize: 18 }}
//               />
//             )}
//           </button>
//         </div>
//       ) : (
//         <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-center gap-2">
//           <Lock sx={{ fontSize: 16, color: "#9ca3af" }} />
//           <p className="text-sm text-gray-400">Chat is disabled by this user</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatRoomPage;
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, CircularProgress, Tooltip } from "@mui/material";
import { ArrowBack, Send, DoneAll, Done, Lock } from "@mui/icons-material";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "../../../api/supabaseClient";
import {
  fetchMessages,
  sendMessage,
  markAsRead,
  subscribeMessages,
} from "./Chatservice";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const myId = () => Number(localStorage.getItem("profileId") || 0);
const myRole = () => localStorage.getItem("role") || "";

const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDateLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Group messages by date
const groupByDate = (msgs) => {
  const groups = [];
  let lastDate = null;
  msgs.forEach((msg) => {
    const d = new Date(msg.created_at).toDateString();
    if (d !== lastDate) {
      groups.push({
        type: "label",
        label: fmtDateLabel(msg.created_at),
        id: `label-${d}`,
      });
      lastDate = d;
    }
    groups.push({ type: "msg", ...msg });
  });
  return groups;
};

// ─── Component ────────────────────────────────────────────────────────────────
const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { state } = useLocation();
  const otherUser = state?.otherUser;
  const chatRoomId = Number(roomId);

  const me = myId();
  const role = myRole();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myProfile, setMyProfile] = useState({ name: "", profile_url: "" });

  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  const HEADER_HEIGHT = 78;
  const INPUT_HEIGHT = 80;
  const DISABLED_INPUT_HEIGHT = 64;

  // Can this user send? (Security always yes, others check is_chat_enabled)
  const canSend =
    role === "Security" ? true : otherUser?.is_chat_enabled !== false;

  const calculateMessagesHeight = useCallback(() => {
    if (!messagesContainerRef.current)
      return `calc(100vh - ${HEADER_HEIGHT}px - ${INPUT_HEIGHT}px)`;

    const inputBarHeight = canSend ? INPUT_HEIGHT : DISABLED_INPUT_HEIGHT;
    return `calc(100vh - ${HEADER_HEIGHT}px - ${inputBarHeight}px)`;
  }, [canSend]);

  // Load my profile
  useEffect(() => {
    if (!me) return;
    supabase
      .from("users")
      .select("name, profile_url")
      .eq("id", me)
      .single()
      .then(({ data }) => {
        if (data) setMyProfile(data);
      });
  }, [me]);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!chatRoomId || !me) return;

    setLoading(true);

    const data = await fetchMessages(chatRoomId);
    setMessages(data);

    setLoading(false);

    await markAsRead({ chatRoomId, myId: me });

    window.dispatchEvent(
      new CustomEvent("chatRead", {
        detail: { chatRoomId },
      }),
    );
  }, [chatRoomId, me]);

  // // Realtime subscription
  // useEffect(() => {
  //   loadMessages();
  //   const unsub = subscribeMessages({
  //     chatRoomId,
  //     onNew: (newMsg) => {
  //       setMessages((prev) => [...prev, newMsg]);
  //       if (newMsg.sender_id !== me) markAsRead({ chatRoomId, myId: me });
  //       setTimeout(scrollToBottom, 100);
  //     },
  //   });
  //   return unsub;
  // }, [chatRoomId, me, loadMessages]);
  useEffect(() => {
    if (!chatRoomId || !me) return;

    loadMessages();

    const unsub = subscribeMessages({
      chatRoomId,

      onNew: async (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);

        if (newMsg.sender_id !== me) {
          await markAsRead({ chatRoomId, myId: me });

          window.dispatchEvent(
            new CustomEvent("chatRead", {
              detail: { chatRoomId },
            }),
          );
        }

        setTimeout(scrollToBottom, 100);
      },
    });

    return () => {
      if (unsub) unsub();
    };
  }, [chatRoomId, me, loadMessages]);
  // Scroll to bottom function
  const scrollToBottom = useCallback((behavior = "smooth") => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior,
        });
      }
      bottomRef.current?.scrollIntoView({ behavior });
    }, 100);
  }, []);

  // Auto scroll on load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [loading, messages.length, scrollToBottom]);

  // Auto resize textarea
  const handleTextareaChange = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !canSend || sending) return;
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);
    try {
      await sendMessage({ chatRoomId, senderId: me, text: trimmed });
      scrollToBottom();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const grouped = groupByDate(messages);

  return (
    <div className="h-[85vh] flex flex-col bg-[#f0ebe6] p-[0px]">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(111,11,20,0.04) 1px, transparent 0)",
        }}
      />

      {/* Main content with fixed heights */}
      <div className="relative flex flex-col h-full w-full max-w-8xl mx-auto bg-white/30 backdrop-blur-sm">
        {/* ── Fixed Header ── */}
        <div
          className="bg-gradient-to-r from-[#6F0B14] via-[#a82834] to-[#6F0B14] px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0 z-10"
          style={{ height: HEADER_HEIGHT }}
        >
          <button
            onClick={() => navigate("/user/chat")}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all flex-shrink-0"
          >
            <ArrowBack sx={{ color: "#fff", fontSize: 20 }} />
          </button>

          <Avatar
            src={otherUser?.profile_url}
            sx={{
              width: 42,
              height: 42,
              bgcolor: "rgba(255,255,255,0.2)",
              fontSize: 14,
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}
          >
            {!otherUser?.profile_url && initials(otherUser?.name)}
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight truncate">
              {otherUser?.name || "Chat"}
            </p>
            <p className="text-red-200 text-xs truncate">
              {otherUser?.role_type === "Security"
                ? "Security Guard"
                : otherUser?.role_type === "Tanent-O"
                  ? "Owner"
                  : otherUser?.role_type === "Tanent-M"
                    ? "Member"
                    : otherUser?.role_type}
            </p>
          </div>
        </div>

        {/* ── Fixed Height Messages Container ── */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{
            height: calculateMessagesHeight(),
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(111,11,20,0.3) transparent",
          }}
        >
          <div className="flex flex-col gap-1 min-h-full">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <CircularProgress size={36} sx={{ color: "#6F0B14" }} />
                <p className="text-sm text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="px-6 py-4 rounded-2xl bg-white/80 backdrop-blur shadow-sm text-center max-w-xs">
                  <p className="text-sm text-gray-600">No messages yet</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Say hi to {otherUser?.name?.split(" ")[0]} 👋
                  </p>
                </div>
              </div>
            ) : (
              <>
                {grouped.map((item) => {
                  if (item.type === "label") {
                    return (
                      <div key={item.id} className="flex justify-center my-4">
                        <span className="text-xs font-medium text-gray-600 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm">
                          {item.label}
                        </span>
                      </div>
                    );
                  }

                  const isMe = item.sender_id === me;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-end gap-2 mb-2 ${
                        isMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <Tooltip
                        title={isMe ? myProfile.name : otherUser?.name}
                        placement={isMe ? "left" : "right"}
                      >
                        <Avatar
                          src={
                            isMe
                              ? myProfile.profile_url
                              : otherUser?.profile_url
                          }
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: "#6F0B14",
                            flexShrink: 0,
                          }}
                        >
                          {initials(isMe ? myProfile.name : otherUser?.name)}
                        </Avatar>
                      </Tooltip>

                      {/* Message Bubble */}
                      <div
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        } max-w-[75%] sm:max-w-[65%]`}
                      >
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                            isMe
                              ? "bg-gradient-to-br from-[#6F0B14] to-[#a82834] text-white rounded-br-sm"
                              : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                          }`}
                        >
                          {item.message_text}
                        </div>

                        {/* Time + Status */}
                        <div
                          className={`flex items-center gap-1.5 mt-1 px-1 ${
                            isMe ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-[10px] text-gray-400">
                            {fmtTime(item.created_at)}
                          </span>
                          {isMe &&
                            (item.is_read ? (
                              <DoneAll
                                sx={{ fontSize: 12, color: "#6F0B14" }}
                              />
                            ) : (
                              <Done sx={{ fontSize: 12, color: "#9ca3af" }} />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} className="h-1" />
              </>
            )}
          </div>
        </div>

        {/* ── Fixed Height Input Bar ── */}
        <div
          className="flex-shrink-0 border-t border-gray-200 bg-white shadow-lg z-10"
          style={{ height: canSend ? INPUT_HEIGHT : DISABLED_INPUT_HEIGHT }}
        >
          {canSend ? (
            <div className="h-full flex items-end gap-2 px-4 py-3">
              <div className="flex-1 min-w-0">
                <textarea
                  ref={(el) => {
                    inputRef.current = el;
                    textareaRef.current = el;
                  }}
                  rows={1}
                  value={text}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKey}
                  placeholder="Type a message..."
                  className="w-full resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#6F0B14] focus:ring-2 focus:ring-[#6F0B14]/20 transition-all"
                  style={{
                    minHeight: 42,
                    maxHeight: 96,
                    overflowY: "auto",
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-11 h-11 rounded-full bg-[#6F0B14] hover:bg-[#8B1E1E] disabled:bg-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:scale-100 shadow-md flex-shrink-0"
              >
                {sending ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : (
                  <Send
                    sx={{
                      color: text.trim() ? "#fff" : "#9ca3af",
                      fontSize: 18,
                    }}
                  />
                )}
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center gap-2 px-4 bg-gray-50">
              <Lock sx={{ fontSize: 16, color: "#9ca3af" }} />
              <p className="text-sm text-gray-500">
                Chat is disabled by this user
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomPage;
