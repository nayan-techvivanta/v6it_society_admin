import { useState, useEffect } from "react";
import { supabase } from "../api/supabaseClient";

export const useNotificationDetails = (notification) => {
  const [societyName, setSocietyName] = useState(null);
  const [buildingName, setBuildingName] = useState(null);
  const [flatName, setFlatName] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!notification) return;

      setLoading(true);

      if (notification.society_id) {
        const { data } = await supabase
          .from("societies")
          .select("name")
          .eq("id", notification.society_id)
          .single();
        if (data) setSocietyName(data.name);
      }

      if (notification.building_id) {
        const { data } = await supabase
          .from("buildings")
          .select("name")
          .eq("id", notification.building_id)
          .single();
        if (data) setBuildingName(data.name);
      }

      if (notification.flat_id) {
        const { data } = await supabase
          .from("flats")
          .select("flat_number, name")
          .eq("id", notification.flat_id)
          .single();
        if (data) setFlatName(data.flat_number || data.name);
      }

      setLoading(false);
    };

    fetchRelatedData();
  }, [notification]);

  return { societyName, buildingName, flatName, loading };
};
