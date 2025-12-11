import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import PatientAuth from "./pages/PatientAuth";
import PatientDashboard from "./pages/PatientDashboard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Consultations from "./pages/Consultations";
import Billing from "./pages/Billing";
import Labs from "./pages/Labs";
import Pharmacy from "./pages/Pharmacy";
import Admin from "./pages/Admin";
import DoctorPanel from "./pages/DoctorPanel";
import LabPanel from "./pages/LabPanel";
import BillingPanel from "./pages/BillingPanel";
import AppointmentPanel from "./pages/AppointmentPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/patient-auth" element={<PatientAuth />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            
            {/* Staff/Admin login */}
            <Route path="/login" element={<Login />} />
            
            {/* Role-based staff panels */}
            <Route path="/doctor-panel" element={<DoctorPanel />} />
            <Route path="/lab-panel" element={<LabPanel />} />
            <Route path="/billing-panel" element={<BillingPanel />} />
            <Route path="/appointment-panel" element={<AppointmentPanel />} />
            
            {/* Protected admin routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/consultations" element={<ProtectedRoute><Consultations /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/labs" element={<ProtectedRoute><Labs /></ProtectedRoute>} />
            <Route path="/pharmacy" element={<ProtectedRoute><Pharmacy /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
