import { supabase } from "../api/supabaseClient";

export const getFaceEmbedding = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const { data, error } = await supabase.functions.invoke(
      "face_recognition",
      {
        body: formData,
      },
    );

    if (error) {
      console.error("Face recognition error:", error);
      return null;
    }

    console.log("Edge function response:", data);

    return data.embedding;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
};
