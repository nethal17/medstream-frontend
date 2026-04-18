import { Link2, PlusIcon, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getAccessToken } from "@/services/api";
import { decodeJwtPayload, getClinicIdFromToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/appointment-utils";
import { getUserClinic } from "@/services/clinicStaff";
import {
  assignDoctorToClinic,
  getClinicAvailableDoctors,
  getClinicDoctors,
  unassignDoctorFromClinic,
  listAllDoctors,
} from "@/services/doctors";

export default function ClinicAdminDoctorsPage() {
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [clinicId, setClinicId] = useState("");
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    const tokenClinicId = getClinicIdFromToken(accessToken) || decodeJwtPayload(accessToken)?.clinic_id || decodeJwtPayload(accessToken)?.clinicId;
    if (tokenClinicId) {
      setClinicId(tokenClinicId);
      return;
    }

    if (!accessToken) {
      setClinicId("");
      return;
    }

    (async () => {
      try {
        const result = await getUserClinic();
        setClinicId(result?.clinic_id || "");
      } catch (error) {
        toast.error(extractApiErrorMessage(error, "Unable to resolve clinic assignment."));
        setClinicId("");
      }
    })();
  }, []);

  const fetchAssigned = useCallback(async () => {
    if (!clinicId) return;
    setIsLoadingAssigned(true);
    try {
      const data = await getClinicDoctors(clinicId);
      setAssignedDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to load assigned doctors."));
    } finally {
      setIsLoadingAssigned(false);
    }
  }, [clinicId]);

  const fetchAvailable = useCallback(async () => {
    if (!clinicId) return;
    setIsLoadingAvailable(true);
    try {
      const data = await getClinicAvailableDoctors(clinicId);
      setAvailableDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to load available doctors."));
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [clinicId]);

  useEffect(() => {
    if (clinicId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAssigned();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAvailable();
    }
  }, [clinicId, fetchAssigned, fetchAvailable]);

  const handleAssign = async (doctorId) => {
    setIsProcessingId(doctorId);
    try {
      await assignDoctorToClinic(clinicId, doctorId);
      toast.success("Doctor assigned to clinic.");
      await Promise.all([fetchAssigned(), fetchAvailable()]);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to assign doctor."));
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleUnassign = async (doctorId) => {
    setIsProcessingId(doctorId);
    try {
      await unassignDoctorFromClinic(clinicId, doctorId);
      toast.success("Doctor unassigned from clinic.");
      await Promise.all([fetchAssigned(), fetchAvailable()]);
    } catch (error) {
      toast.error(extractApiErrorMessage(error, "Failed to unassign doctor."));
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <UsersRound className="size-5 text-primary" />
            Doctors Assigned to Clinic
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAssigned ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Doctor Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Consultation Mode</th>  
                    <th className="px-4 py-3">Consultation Fee</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedDoctors.map((item) => (
                    <tr key={item.doctor_id} className="border-t">
                      <td className="px-4 py-3 text-slate-700">{item.full_name}</td>
                      <td className="px-4 py-3 text-slate-700">{item.specialization || "-"}</td>
                      <td className="px-4 py-3 text-slate-700 capitalize">{item.consultation_mode || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.consultation_fee != null ? `Rs. ${item.consultation_fee}.00` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="xs"
                          className="text-white hover:bg-red-700 bg-red-600 rounded"
                          disabled={isProcessingId === item.doctor_id}
                          onClick={() => handleUnassign(item.doctor_id)}
                        >
                          {isProcessingId === item.doctor_id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <Trash2 className="size-3" />
                          )}
                          Unassign
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {assignedDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No doctors currently assigned to your clinic.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl text-slate-800">
            <UserPlus className="size-5 text-slate-500" />
            Available Doctors in System
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAvailable ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Doctor Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Consultation Mode</th>
                    <th className="px-4 py-3">Consultation Fee</th>
                    <th className="px-4 py-3">Verification</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableDoctors.map((item) => (
                    <tr key={item.doctor_id} className="border-t">
                      <td className="px-4 py-3 text-slate-700">{item.full_name}</td>
                      <td className="px-4 py-3 text-slate-700">{item.specialization || "-"}</td>
                      <td className="px-4 py-3 text-slate-700 capitalize">{item.consultation_mode || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.consultation_fee != null ? `Rs. ${item.consultation_fee}.00` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                          item.verification_status === "verified" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {item.verification_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          className="rounded cursor-pointer"
                          disabled={isProcessingId === item.doctor_id}
                          onClick={() => handleAssign(item.doctor_id)}
                        >
                          {isProcessingId === item.doctor_id ? (
                            <Spinner className="size-3" />
                          ) : (
                            <PlusIcon className="size-3" />
                          )}
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {availableDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        All doctors in the system are either assigned to your clinic or unavailable.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
