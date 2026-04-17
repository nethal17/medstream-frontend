import { HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientFooter() {
  return (
    <footer id="footer" className="border-t border-slate-300 bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
              <HeartPulse className="size-5 text-teal-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">MedStream</p>
              <p className="text-xs text-slate-600">Clinic & patient care platform</p>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-700">
            A trusted healthcare booking platform for patients, doctors, and clinics to manage
            appointments, consultations, and follow-up care more clearly.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Patients</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <Link to="/doctors" className="block transition-colors hover:text-teal-800">
              Find doctors
            </Link>
            <Link to="/register" className="block transition-colors hover:text-teal-800">
              Create account
            </Link>
            <Link to="/login" className="block transition-colors hover:text-teal-800">
              Sign in
            </Link>
            <Link to="/join-with-us" className="block transition-colors hover:text-teal-800">
              Clinics
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Clinics & Doctors</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <Link to="/join-with-us" className="block transition-colors hover:text-teal-800">
              Join with us
            </Link>
            <Link to="/doctor/dashboard" className="block transition-colors hover:text-teal-800">
              Doctor portal
            </Link>
            <Link to="/admin/clinic/dashboard" className="block transition-colors hover:text-teal-800">
              Clinic dashboard
            </Link>
            <Link to="/login" className="block transition-colors hover:text-teal-800">
              Partner sign in
            </Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Information</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <Link to="/" className="block transition-colors hover:text-teal-800">
              Home
            </Link>
            <Link to="/join-with-us" className="block transition-colors hover:text-teal-800">
              About clinics
            </Link>
            <Link to="/doctors" className="block transition-colors hover:text-teal-800">
              Explore doctors
            </Link>
            <Link to="/register" className="block transition-colors hover:text-teal-800">
              Start now
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 MedStream. All rights reserved.</p>
          <p>Designed for calm and reliable healthcare coordination.</p>
        </div>
      </div>
    </footer>
  );
}
