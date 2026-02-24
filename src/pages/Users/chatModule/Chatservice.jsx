import { supabase } from "../../../api/supabaseClient";

export const fetchSocietyUsers = async ({
  myId,
  myRole,
  societyId,
  buildingId,
}) => {
  if (myRole === "Security") {
    const { data } = await supabase
      .from("users")
      .select(`*, user_flats(flat_id, flats(flat_number))`)
      .eq("society_id", societyId)
      .neq("id", myId)
      .eq("is_active", true)
      .eq("is_delete", false)
      .or(
        "role_type.eq.Security,and(role_type.in.(Tanent-O,Tanent-M),is_chat_enabled.eq.true)",
      );

    return (data || []).map((e) => ({
      ...e,
      flatNumber:
        e.role_type !== "Security" && e.user_flats?.length > 0
          ? (e.user_flats[0]?.flats?.flat_number ?? null)
          : null,
    }));
  }

  // ── Non-security path ──────────────────────────────────────────────────────
  // FIX #1: Fetch security users + all same-society tenants without relying
  // on buildingId (which may be null), then separately map flat numbers.

  const [{ data: securityData }, { data: flatUsers }] = await Promise.all([
    supabase
      .from("users")
      .select("*")
      .eq("society_id", societyId)
      .eq("role_type", "Security")
      .neq("id", myId)
      .eq("is_active", true)
      .eq("is_delete", false),

    // FIX #1: If buildingId is available, scope to building; otherwise fetch
    // all flats in the society so Tenant users are never missed.
    buildingId
      ? supabase
          .from("user_flats")
          .select("user_id, flat_id, flats(flat_number)")
          .eq("society_id", societyId)
          .eq("building_id", buildingId)
      : supabase
          .from("user_flats")
          .select("user_id, flat_id, flats(flat_number)")
          .eq("society_id", societyId),
  ]);

  const userFlatMap = {};
  (flatUsers || []).forEach((r) => {
    if (r.flats?.flat_number) userFlatMap[r.user_id] = r.flats.flat_number;
  });

  const userIds = Object.keys(userFlatMap).map(Number);
  let tenantData = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds)
      .neq("id", myId)
      .eq("is_active", true)
      .eq("is_delete", false)
      .eq("is_chat_enabled", true)
      .in("role_type", ["Tanent-O", "Tanent-M"]);
    tenantData = data || [];
  }

  return [
    ...(securityData || []),
    ...tenantData.map((u) => ({ ...u, flatNumber: userFlatMap[u.id] ?? null })),
  ];
};

export const fetchChatUsers = async ({ myId, societyId }) => {
  const { data } = await supabase
    .from("chat_user")
    .select(
      `id,user_one_id,user_two_id,last_msg_time,chat_message(id,sender_id,is_read),user_one:users!chat_user_user_one_id_fkey(id,name,role_type,profile_url,is_chat_enabled),user_two:users!chat_user_user_two_id_fkey(id,name,role_type,profile_url,is_chat_enabled)`,
    )
    .eq("society_id", societyId)
    .or(`user_one_id.eq.${myId},user_two_id.eq.${myId}`)
    .order("last_msg_time", { ascending: false, nullsFirst: false });

  let totalUnread = 0;
  const chatUsers = (data || [])
    // FIX #3: Only show rooms that have at least one message
    .filter((e) => e.chat_message && e.chat_message.length > 0)
    .map((e) => {
      const user = e.user_one_id === myId ? e.user_two : e.user_one;
      const unread = (e.chat_message || []).filter(
        (m) => m.sender_id !== myId && !m.is_read,
      ).length;
      totalUnread += unread;
      return {
        ...user,
        unreadCount: unread,
        chatRoomId: e.id,
        lastMessageTime: e.last_msg_time ? new Date(e.last_msg_time) : null,
      };
    });

  return { chatUsers, totalUnreadCount: totalUnread };
};

export const getOrCreateChatRoom = async ({
  currentUserId,
  otherUserId,
  societyId,
}) => {
  const u1 = Math.max(currentUserId, otherUserId);
  const u2 = Math.min(currentUserId, otherUserId);
  const { data } = await supabase
    .from("chat_user")
    .select("id")
    .eq("user_one_id", u1)
    .eq("user_two_id", u2)
    .eq("society_id", societyId);
  if (data?.length > 0) return data[0].id;
  const { data: ins } = await supabase
    .from("chat_user")
    .insert({ user_one_id: u1, user_two_id: u2, society_id: societyId })
    .select()
    .single();
  return ins.id;
};

export const fetchMessages = async (chatRoomId) => {
  const { data } = await supabase
    .from("chat_message")
    .select("*")
    .eq("chat_id", chatRoomId)
    .order("created_at", { ascending: true });
  return data || [];
};

// export const sendMessage = async ({
//   chatRoomId,
//   senderId,
//   text,
//   senderName,
// }) => {
//   await supabase
//     .from("chat_message")
//     .insert({ chat_id: chatRoomId, sender_id: senderId, message_text: text });
//   await supabase
//     .from("chat_user")
//     .update({ last_msg_time: new Date().toISOString() })
//     .eq("id", chatRoomId);
// };
export const sendMessage = async ({ chatRoomId, senderId, text }) => {
  const now = new Date().toISOString();

  // 1️⃣ Insert message
  await supabase.from("chat_message").insert({
    chat_id: chatRoomId,
    sender_id: senderId,
    message_text: text,
  });

  await supabase
    .from("chat_user")
    .update({ last_msg_time: now })
    .eq("id", chatRoomId);

  const { data: chatUser, error: chatError } = await supabase
    .from("chat_user")
    .select("user_one_id, user_two_id")
    .eq("id", chatRoomId)
    .single();

  if (chatError || !chatUser) return;

  const receiverId =
    chatUser.user_one_id === senderId
      ? chatUser.user_two_id
      : chatUser.user_one_id;

  const { data: userData } = await supabase
    .from("users")
    .select("fcm_token, name")
    .eq("id", receiverId)
    .not("fcm_token", "is", null);

  const tokens = userData?.map((u) => u.fcm_token) || [];

  if (!tokens.length) return;

  await supabase.functions.invoke("send-notification", {
    body: {
      tokens: tokens,
      title: "New Message",
      body: text,
      data: {
        type: "chat",
        chatRoomId: chatRoomId.toString(),
        senderId: senderId.toString(),
        screen: "chat",
      },
      type: "alert",
    },
  });
};
export const markAsRead = async ({ chatRoomId, myId }) => {
  await supabase
    .from("chat_message")
    .update({ is_read: true })
    .eq("chat_id", chatRoomId)
    .neq("sender_id", myId)
    .eq("is_read", false);
};

export const subscribeMessages = ({ chatRoomId, onNew }) => {
  const ch = supabase
    .channel(`room-${chatRoomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_message",
        filter: `chat_id=eq.${chatRoomId}`,
      },
      (p) => onNew(p.new),
    )
    .subscribe();
  return () => supabase.removeChannel(ch);
};

export const subscribeGlobal = ({ myId, onNew }) => {
  const ch = supabase
    .channel(`global-${myId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_message" },
      (p) => {
        if (p.new.sender_id !== myId) onNew();
      },
    )
    .subscribe();
  return () => supabase.removeChannel(ch);
};
