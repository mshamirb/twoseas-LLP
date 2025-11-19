import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom"; // ✅ Added Navigate import
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import WhoWeAre from './components/WhoWeAre/WhoWeAre';
import Services from './components/Services/Services'
import WhyUs from './components/WhyUs/WhyUs'
import TalentSolutions from './components/TalentSolutions/TalentSolutions';
import TalentComparison from './components/TalentComparison/TalentComparison';
import Testimonials from './components/Testimonials/Testimonials';
import Solutions from './components/Solutions/Solutions';
import Industries from './components/Industries/Industries';
import Process from './components/Process/Process';
import Difference from './components/Difference/Difference';
import CTA from './components/CTA/CTA';
import Footer from './components/Footer/Footer';
import BookCall from './pages/BookCall/BookCall';
import Contact from './components/Contact/Contact';
import Careers from './pages/Careers/Careers.js';
import HowWeWork from './pages/HowWeWork/HowWeWork.js';
import AdminLogin from './components/AdminLogin/AdminLogin.jsx';
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard.jsx";
import ManagedServices from "./pages/Managed Services/ManagedServices.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy.jsx";
import ServiceDetails from "./components/ServiceDetails/ServiceDetails.js";
import './App.css';
import ProfilePage from "./components/ProfilePage/ProfilePage.js";
import WhatsAppChat from './components/WhatsAppChat/WhatsAppChat';
import AddEmployee from "./pages/AddEmployee/AddEmployee.jsx";
import AddNewOpening from "./pages/AddNewOpening/AddNewOpening.jsx";
import EmployeeCard from "./pages/EmployeeCard/EmployeeCard.js";
import ClientDiary from "./pages/ClientDiary/ClientDiary.jsx";
import NicheManagement from "./pages/NicheManagement/NicheManagement.jsx";
import AdminWelcome from "./pages/AdminWelcome/AdminWelcome.jsx";
import AdminMeetingsView from "./components/AdminMeetingView/AdminMeetingsView.js";
import BlockedSlotsManager from "./components/BlockedSlotsManager/BlockedSlotsManager.js";
import Tracking from "./components/Tracking.js";
import CalendarScheduler from "./components/CalendarScheduler.jsx";
import EmployeeDetail from "./components/EmployeeDetail/EmployeeDetail.jsx";
import ModernAdminPanel from "./pages/AdminPanel/AdminPanel.jsx";

import ClientLogin from "./pages/ClientLogin/ClientLogin.js";
import ClientDashboard from "./pages/ClientDashboard/ClientDashboard.jsx";
import ClientEmployees from "./pages/ClientEmployees/ClientEmployees.jsx";
import ClientSchedule from "./pages/ClientSchedule/ClientSchedule.jsx";
import ClientProfile from "./pages/ClientProfile/ClientProfile.jsx";

import { ThemeProvider } from "./context/ThemeContext";
import ClientProtectedRoute from "./components/ProtectedRoute/ClientProtectedRoute.jsx";
import AdminProtectedRoute from "./components/ProtectedRoute/AdminProtectedRoute.jsx";

function Layout() {
  const location = useLocation();

  const isBookCallPage = location.pathname === "/book-call";
  const isAdminLoginPage = location.pathname === "/admin-login";
  const isAdminDashboardPage = location.pathname === "/admin-dashboard";
  const isAdminPanelPage = location.pathname.startsWith("/admin/"); // ✅ Updated to match cryptic paths
  const isClientPage = location.pathname.startsWith("/client");

  return (
    <>
      <Tracking>
        {/* Hide Navbar on admin/book-call/client pages */}
        {!isBookCallPage && !isAdminLoginPage && !isAdminPanelPage && !isClientPage && <Navbar />}

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <WhoWeAre />
                <Services />
                <WhyUs />
                <TalentSolutions />
                <CTA />
              </>
            }
          />
          <Route path="/process" element={<Process />} />
          <Route path="/book-call" element={<BookCall />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/managed-services" element={<ManagedServices />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceId" element={<ServiceDetails />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/admin-dashboard/add-employee" element={<AddEmployee />} />
          <Route path="/careers/add-new-opening" element={<AddNewOpening />} />
          <Route path="/employee-diary" element={<EmployeeCard />} />
          <Route path="/client-diary" element={<ClientDiary />} />
          <Route path="/employee-niche-assignment" element={<NicheManagement />} />
          <Route path="/admin-welcome" element={<AdminWelcome />} />
          <Route path="/view-meetings" element={<AdminMeetingsView />} />
          <Route path="/slots-manager" element={<BlockedSlotsManager />} />
          <Route path="/schedule-appointment" element={<CalendarScheduler />} />
          <Route path="/employee/:id" element={<EmployeeDetail />} />

          {/* ✅ CORRECTED CRYPTIC ADMIN ROUTES */}
          <Route path="/admin/x7k9p2" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/z4m8q1" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/r3t6y0" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/b5n2v8" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/c9j7x3" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/k8h4d6" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/w1f5s9" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/l2m7p4" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/g6t8k2" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />
          <Route path="/admin/v3q9n5" element={<AdminProtectedRoute><ModernAdminPanel /></AdminProtectedRoute>} />

          {/* ✅ Redirect old admin routes to cryptic dashboard */}
          <Route path="/admin-panel" element={<Navigate to="/admin/x7k9p2" replace />} />
          <Route path="/admin-dashboard" element={<AdminProtectedRoute><Navigate to="/admin/x7k9p2" replace /></AdminProtectedRoute>} />

          {/* ✅ Catch-all for invalid admin paths (must be at the end) */}
          <Route path="/admin/*" element={<Navigate to="/admin/x7k9p2" replace />} />

          {/* CLIENT ROUTES */}
          <Route path="/client-login" element={<ClientLogin />} />
          <Route path="/client-dashboard" element={<ClientProtectedRoute><ClientDashboard /></ClientProtectedRoute>} />
          <Route path="/client-employees" element={<ClientEmployees />} />
          <Route path="/client-schedule" element={<ClientSchedule />} />
          <Route path="/client-profile" element={<ClientProfile />} />
        </Routes>

        {/* WhatsAppChat should also be hidden on client pages */}
        {!isAdminDashboardPage && !isAdminPanelPage && !isClientPage && <WhatsAppChat />}

        {/* Hide Footer on admin/book-call/client pages */}
        {!isBookCallPage && !isAdminLoginPage && !isAdminPanelPage && !isClientPage && <Footer />}
      </Tracking>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Layout />
      </ThemeProvider>
    </Router>
  );
}

export default App;