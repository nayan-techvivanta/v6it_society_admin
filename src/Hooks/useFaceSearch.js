import { useState } from "react";
import { supabase } from "../supabaseClient";

export const useFaceSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFace = async (file) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const { data, error } = await supabase.functions.invoke("face-search", {
        body: formData,
      });

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { searchFace, loading, error };
};
