import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  LandingPage,
  RegistrationPage,
  RegistrationSuccessPage,
  AdminLoginPage,
  AdminDashboard,
  GroupManagementPage,
  CheckInPage,
  AdminSettingsPage,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/registration/success" element={<RegistrationSuccessPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/groups" element={<GroupManagementPage />} />
        <Route path="/admin/checkin" element={<CheckInPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
