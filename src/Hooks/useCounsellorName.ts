import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase.js";

export function useCounsellorName() {
  const [name, setName] = useState("your therapist");

  useEffect(() => {
    supabase
      .from("practice_settings")
      .select("counsellor_name")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.counsellor_name) setName(data.counsellor_name);
      });
  }, []);

  return name;
}
