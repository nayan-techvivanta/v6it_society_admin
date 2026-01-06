import axios from "axios";

export const createUser = async (data) => {
  try {
    const accessToken = localStorage.getItem("token");

    if (!accessToken) {
      throw new Error("User not authenticated");
    }

    const res = await axios.post(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-v1`,
      {
        email: data.email,
        password: data.password,
        number: data.contact,
        name: data.name,
        role_type: data.role_type,
        whatsapp_number: data.whatsapp || data.contact,
        building_id: data.building_id || null,
        society_id: data.society_id || null,
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Create user error:", error);
    throw new Error(
      error.response?.data?.error ||
        error.response?.data ||
        "Failed to create user"
    );
  }
};
