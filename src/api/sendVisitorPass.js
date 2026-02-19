// // sendVisitorPass.js
// import { supabase } from "./supabaseClient";

// /**
//  * Send Visitor Pass via WhatsApp
//  * @param {Object} params
//  * @param {number} params.visitor_id
//  * @param {string} params.whatsapp
//  * @param {string} params.file_url
//  * @param {string} params.file_name
//  */
// export const sendVisitorPass = async ({
//   visitor_id,
//   whatsapp,
//   file_url,
//   file_name,
// }) => {
//   try {
//     // Get current session (if user is logged in)
//     const { data: sessionData } = await supabase.auth.getSession();
//     const accessToken = sessionData?.session?.access_token;

//     // Build headers
//     const headers = {
//       "Content-Type": "application/json",
//       ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
//     };

//     // Call Supabase Edge Function
//     const response = await fetch(
//       `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-pass`,
//       {
//         method: "POST",
//         headers,
//         body: JSON.stringify({
//           visitor_id,
//           whatsapp,
//           file_url,
//           file_name,
//         }),
//       },
//     );

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result.error || "Failed to send WhatsApp message");
//     }

//     return result;
//   } catch (error) {
//     console.error("Send Visitor Pass Error:", error.message);
//     throw error;
//   }
// };
import { supabase } from "./supabaseClient";

export const sendVisitorPass = async ({
  visitor_id,
  whatsapp,
  file_url,
  file_name,
}) => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-whatsapp-pass",
      {
        body: {
          visitor_id,
          whatsapp,
          file_url,
          file_name,
        },
      },
    );

    if (error) {
      throw new Error(error.message || "Failed to send WhatsApp message");
    }

    return data;
  } catch (error) {
    console.error("Send Visitor Pass Error:", error.message);
    throw error;
  }
};
