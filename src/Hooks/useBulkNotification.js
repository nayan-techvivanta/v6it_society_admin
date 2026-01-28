import { supabase } from "../api/supabaseClient";
import { useState, useCallback } from "react";

export const useBulkNotification = () => {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);

  const sendBulkNotification = useCallback(
    async ({
      buildingIds,
      title,
      body,
      imageUrl = null,
      notificationType = "broadcast",
      data = { screen: "notification" },
      societyName = "Selected users",
      society_id = null,
      building_id = null,
    }) => {
      if (!buildingIds?.length || !title?.trim() || !body?.trim()) {
        throw new Error("Building IDs, title, and body are required");
      }

      setIsSending(true);
      setProgress(0);

      try {
        console.log(`📤 Sending to ${societyName} buildings:`, buildingIds);

        setProgress(20);
        const { data: userFlatsData, error: userFlatsError } = await supabase
          .from("user_flats")
          .select("user_id")
          .in("building_id", buildingIds);

        if (userFlatsError) throw userFlatsError;

        const userIds = userFlatsData?.map((item) => item.user_id) || [];

        if (userIds.length === 0) {
          console.warn(`⚠️ No users found in ${societyName} buildings`);
          return { success: false, message: "No users found" };
        }

        setProgress(40);
        const { data: users, error: usersError } = await supabase
          .from("users")
          .select("id, fcm_token")
          .in("id", userIds)
          .eq("is_active", true)
          .eq("is_delete", false);

        if (usersError) throw usersError;

        if (!users || users.length === 0) {
          console.warn(`⚠️ No active users found in ${societyName}`);
          return { success: false, message: "No active users found" };
        }

        setProgress(60);
        // const notificationsPayload = users.map((u) => ({
        //   user_id: u.id,
        //   title: title.trim(),
        //   body: body.trim(),
        //   type: notificationType,
        //   document: imageUrl || null,
        // }));
        const notificationsPayload = users.map((u) => ({
          user_id: u.id,
          title: title.trim(),
          body: body.trim(),
          type: notificationType,
          document: imageUrl || null,

          society_id,
          building_id,
        }));

        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notificationsPayload);

        if (insertError) throw insertError;

        // 4️⃣ Collect FCM tokens
        const tokens = users.filter((u) => u.fcm_token).map((u) => u.fcm_token);

        // 5️⃣ Send push notification
        setProgress(80);
        if (tokens.length > 0) {
          const { error: fcmError } = await supabase.functions.invoke(
            "send-notification",
            {
              body: {
                tokens,
                title: title.trim(),
                body: body.trim(),
                type: notificationType,
                data: {
                  ...data,
                  image: imageUrl || "",
                  society: societyName,
                },
              },
            },
          );

          if (fcmError) throw fcmError;
        }

        setProgress(100);
        console.log(`✅ Sent to ${users.length} users in ${societyName}`);

        return {
          success: true,
          usersCount: users.length,
          tokensCount: tokens.length,
          message: `Sent to ${users.length} users`,
        };
      } catch (error) {
        console.error(`❌ Bulk Notification Error:`, error);
        throw new Error(error.message || "Failed to send notification");
      } finally {
        setIsSending(false);
        setProgress(0);
      }
    },
  );

  // Get all building IDs for a society (helper)
  const getSocietyBuildingIds = useCallback(async (societyId) => {
    const { data, error } = await supabase
      .from("buildings")
      .select("id")
      .eq("society_id", societyId)
      .eq("is_active", true)
      .eq("is_delete", false);

    if (error) throw error;
    return data?.map((b) => b.id) || [];
  }, []);

  return {
    sendBulkNotification,
    isSending,
    progress,
    getSocietyBuildingIds,
  };
};
