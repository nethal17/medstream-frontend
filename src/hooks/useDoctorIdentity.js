import { useEffect, useState } from "react";

import { extractApiErrorMessage } from "@/lib/appointment-utils";
import { resolveCurrentDoctor } from "@/services/doctors";

export function useDoctorIdentity() {
  const [state, setState] = useState({
    doctorId: "",
    doctorName: "",
    isLoading: true,
    error: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadDoctorIdentity() {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: "",
      }));

      try {
        const payload = await resolveCurrentDoctor();

        if (ignore) {
          return;
        }

        setState({
          doctorId: payload?.doctorId || "",
          doctorName: payload?.doctorName || "",
          isLoading: false,
          error: payload?.doctorId ? "" : "Doctor profile not found for the signed-in account.",
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        setState({
          doctorId: "",
          doctorName: "",
          isLoading: false,
          error: extractApiErrorMessage(error, "Unable to resolve doctor account."),
        });
      }
    }

    loadDoctorIdentity();

    return () => {
      ignore = true;
    };
  }, []);

  return state;
}
