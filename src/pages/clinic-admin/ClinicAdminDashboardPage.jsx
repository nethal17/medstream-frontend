import { Navigate, Route, Routes } from "react-router-dom";

import ClinicAdminLayout from "@/components/clinic-admin/ClinicAdminLayout";
import ClinicAdminAppointmentsPage from "@/pages/clinic-admin/ClinicAdminAppointmentsPage";
import ClinicAdminConfigurationsPage from "@/pages/clinic-admin/ClinicAdminConfigurationsPage";
import ClinicAdminFinancialsPage from "@/pages/clinic-admin/ClinicAdminFinancialsPage";
import ClinicAdminOverviewPage from "@/pages/clinic-admin/ClinicAdminOverviewPage";
import ClinicAdminStaffPage from "@/pages/clinic-admin/ClinicAdminStaffPage";

export default function ClinicAdminDashboardPage() {
  return (
    <Routes>
      <Route element={<ClinicAdminLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ClinicAdminOverviewPage />} />
        <Route path="staff" element={<ClinicAdminStaffPage />} />
        <Route path="appointments" element={<ClinicAdminAppointmentsPage />} />
        <Route path="financials" element={<ClinicAdminFinancialsPage />} />
        <Route path="configurations" element={<ClinicAdminConfigurationsPage />} />
      </Route>
    </Routes>
  );
}
