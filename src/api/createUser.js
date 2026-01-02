import axios from "axios";

export const createUser = async (data) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-v1`,
      {
        email: data.email,
        password: data.password,
        number: data.contact,
        name: data.name,
        role_type: "Manager",
        whatsapp_number: data.whatsapp,
      },
      {
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create user");
  }
};
