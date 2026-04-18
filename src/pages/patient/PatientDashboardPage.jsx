import { Navigate, Route, Routes } from "react-router-dom";

import PatientLayout from "@/components/patient/PatientLayout";
import PatientAppointmentsPage from "@/pages/patient/PatientAppointmentsPage";
import PatientMedicalInformationPage from "@/pages/patient/PatientMedicalInformationPage";
import PatientOverviewPage from "@/pages/patient/PatientOverviewPage";
import PatientPrescriptionsPage from "@/pages/patient/PatientPrescriptionsPage";
import PatientProfileSetupPage from "@/pages/patient/PatientProfileSetupPage";
import PatientReportsPage from "@/pages/patient/PatientReportsPage";

export default function PatientDashboardPage() {
  return (
    <Routes>
      <Route element={<PatientLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<PatientOverviewPage />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="profile-setup" element={<PatientProfileSetupPage />} />
        <Route path="reports" element={<PatientReportsPage />} />
        <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
        <Route path="medical-information" element={<PatientMedicalInformationPage />} />
      </Route>
    </Routes>
  );
}
