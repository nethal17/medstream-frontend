import { Navigate, Route, Routes } from "react-router-dom";

import DoctorLayout from "@/components/doctor/DoctorLayout";
import DoctorAvailabilityPage from "@/pages/doctor/DoctorAvailabilityPage";
import DoctorConsultationPage from "@/pages/doctor/DoctorConsultationPage";
import DoctorConfigurationsPage from "@/pages/doctor/DoctorConfigurationsPage";
import DoctorFinancialPage from "@/pages/doctor/DoctorFinancialPage";
import DoctorOverviewPage from "@/pages/doctor/DoctorOverviewPage";

export default function DoctorDashboardPage() {
  return (
    <Routes>
      <Route path="consultation/:appointmentId" element={<DoctorConsultationPage />} />

      <Route element={<DoctorLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<DoctorOverviewPage />} />
        <Route path="availability" element={<DoctorAvailabilityPage />} />
        <Route path="configurations" element={<DoctorConfigurationsPage />} />
        <Route path="financial" element={<DoctorFinancialPage />} />
      </Route>
    </Routes>
  );
}
