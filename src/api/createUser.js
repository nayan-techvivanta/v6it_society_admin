// import axios from "axios";

// export const createUser = async (data) => {
//   try {
//     const accessToken = localStorage.getItem("token");

//     if (!accessToken) {
//       throw new Error("User not authenticated");
//     }

//     const res = await axios.post(
//       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-v1`,
//       {
//         email: data.email,
//         password: data.password,
//         number: data.contact,
//         name: data.name,
//         role_type: data.role_type,
//         whatsapp_number: data.whatsapp || data.contact,
//         building_id: data.building_id || null,
//         society_id: data.society_id || null,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     return res.data;
//   } catch (error) {
//     console.error("Create user error:", error);
//     throw new Error(
//       error.response?.data?.error ||
//         error.response?.data ||
//         "Failed to create user"
//     );
//   }
// };
import axios from "axios";

export const createUser = async (data) => {
  try {
    const accessToken = localStorage.getItem("token");

    if (!accessToken) {
      throw new Error("User not authenticated");
    }

    const payload = {
      email: data.email,
      password: data.password,
      number: data.number,
      name: data.name,
      role_type: data.role_type,
      whatsapp_number: data.whatsapp_number,

      flat_id: data.flat_id,
      building_id: data.building_id,
      society_id: data.society_id,
      created_by: data.created_by,
      updated_by: data.updated_by,

      profile_url: data.profile_url || null,
    };

    console.log("🔥 API Payload:", payload);

    const res = await axios.post(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-v1`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("✅ API Response:", res.data);
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
