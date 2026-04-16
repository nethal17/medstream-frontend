import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import PatientPortalLayout from "@/components/patient-portal-layout";
import BookingConfirmationPage from "@/pages/BookingConfirmationPage";
import DoctorBookingPage from "@/pages/DoctorBookingPage";
import DoctorsPage from "@/pages/DoctorsPage";
import LoginPage from "@/pages/LoginPage";
import { getAccessToken } from "@/services/api";

function RequireAuth({ children }) {
  const location = useLocation();

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}

function RootRedirect() {
  return <Navigate to={getAccessToken() ? "/doctors" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <PatientPortalLayout />
          </RequireAuth>
        }
      >
        <Route index element={<RootRedirect />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/doctors/:doctorId" element={<DoctorBookingPage />} />
        <Route path="/doctors/confirmation" element={<BookingConfirmationPage />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}