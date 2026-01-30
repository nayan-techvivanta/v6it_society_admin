import { supabase } from "./supabaseClient";

export const fetchSocietyVisitors = async (societyId) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User not authenticated");
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch_socity_visitors`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        society_id: societyId,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch visitors");
  }

  return result;
};
