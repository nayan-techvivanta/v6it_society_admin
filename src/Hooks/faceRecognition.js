// import { supabase } from "../api/supabaseClient";

// export const getFaceEmbedding = async (imageFile) => {
//   try {
//     // Get current session
//     const {
//       data: { session },
//       error: sessionError,
//     } = await supabase.auth.getSession();

//     if (sessionError || !session) {
//       console.error("User not authenticated");
//       return null;
//     }

//     const formData = new FormData();
//     formData.append("file", imageFile);

//     const { data, error } = await supabase.functions.invoke(
//       "face_recognition",
//       {
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${session.access_token}`,
//         },
//       },
//     );

//     if (error) {
//       console.error("Face recognition error:", error);
//       return null;
//     }

//     console.log("Face API response:", data);

//     if (!data) {
//       console.error("Empty face response");
//       return null;
//     }

//     // =============================
//     // CASE 1: Existing visitor found
//     // =============================
//     if (data.found === true && data.visitor) {
//       let embedding = null;

//       if (data.visitor.face_embedding) {
//         embedding =
//           typeof data.visitor.face_embedding === "string"
//             ? JSON.parse(data.visitor.face_embedding)
//             : data.visitor.face_embedding;
//       }

//       return {
//         found: true,
//         visitor: data.visitor,
//         embedding,
//         confidence: data.confidence || data.visitor.similarity || null,
//       };
//     }

//     // =============================
//     // CASE 2: New face (not found)
//     // =============================
//     if (data.found === false) {
//       return {
//         found: false,
//         visitor: null,
//         embedding: data.face_data?.embedding || null,
//         confidence: data.confidence || null,
//       };
//     }

//     console.error("Unexpected face API structure:", data);
//     return null;
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return null;
//   }
// };
import { supabase } from "../api/supabaseClient";

export const getFaceEmbedding = async (imageFile) => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("User not authenticated");
      return null;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    const { data, error } = await supabase.functions.invoke(
      "face_recognition",
      {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (error) {
      console.error("Face recognition invoke error:", error);
      return null;
    }

    if (!data) {
      console.error("Empty face response");
      return null;
    }

    // ── Parse if string, unwrap if double-wrapped ────
    let response = data;

    if (typeof response === "string") {
      try {
        response = JSON.parse(response);
      } catch {
        return null;
      }
    }

    if (response?.data) {
      response = response.data;
    }

    if (typeof response === "string") {
      try {
        response = JSON.parse(response);
      } catch {
        return null;
      }
    }

    console.log("Final parsed response:", response);

    // ── Parse embedding helper ───────────────────────
    const parseEmbedding = (raw) => {
      if (!raw) return null;
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return Array.isArray(raw) ? raw : null;
    };

    // ── Visitor found ────────────────────────────────
    const visitor = response?.visitor ?? response?.data?.visitor ?? null;

    if (visitor) {
      return {
        found: true,
        visitor,
        embedding: parseEmbedding(visitor.face_embedding),
        confidence: response?.confidence ?? null,
      };
    }

    // ── New face ─────────────────────────────────────
    const faceData = response?.face_data ?? response?.data?.face_data ?? null;

    if (faceData) {
      return {
        found: false,
        visitor: null,
        embedding: parseEmbedding(faceData.embedding),
        confidence: null,
      };
    }

    // ── Not found, no face_data ──────────────────────
    if (response?.found === false) {
      return { found: false, visitor: null, embedding: null, confidence: null };
    }

    console.error("Unexpected face API structure:", response);
    return null;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
};
