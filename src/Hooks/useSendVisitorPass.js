import { useState } from "react";
import { sendVisitorPass } from "../api/sendVisitorPass";

export const useSendVisitorPass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendPass = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await sendVisitorPass(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { sendPass, loading, error };
};
