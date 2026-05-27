import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard'; 
import InspectorDashboard from './pages/InspectorDashboard'; 
import NotFound from './pages/NotFound';

// Import the NEW powerful gatekeeper we just created!
// (Make sure the path is correct based on where you saved ProtectedRoute.jsx)
import ProtectedRoute from './pages/ProtectedRoute';
import TelecallerDashboard from './pages/TelecallerDashboard'; // Adjust path if needed 

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/telecaller" element={
          <ProtectedRoute allowedRoles={['TELECALLER', 'SUPER_ADMIN']}>
            <TelecallerDashboard />
          </ProtectedRoute>
        } />
        
        {/* Protected Client Route */}
        <Route 
          path="/client" 
          element={
            <ProtectedRoute allowedRoles={["CLIENT"]}>
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Worker Route */}
        <Route 
          path="/worker" 
          element={
            <ProtectedRoute allowedRoles={["WORKER"]}>
              <WorkerDashboard />
            </ProtectedRoute>
          } 
        />
        

        {/* Protected Inspector Route */}
        <Route 
          path="/inspector" 
          element={
            <ProtectedRoute allowedRoles={["INSPECTOR"]}>
              <InspectorDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Unified Admin Workspace Control Panel */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN_MANAGER", "TELECALLER"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* 🚨 THE CATCH-ALL ROUTE (Must be at the bottom) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Routes>
    </Router>
  );
}

export default App;