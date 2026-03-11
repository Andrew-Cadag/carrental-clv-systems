import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerCars from './pages/CustomerCars';
import CustomerBookings from './pages/CustomerBookings';
import CustomerProfile from './pages/CustomerProfile';
import StaffDashboard from './pages/StaffDashboard';
import StaffBookings from './pages/StaffBookings';
import StaffFleet from './pages/StaffFleet';
import AdminDashboard from './pages/AdminDashboard';
import AdminCars from './pages/AdminCars';
import AdminUsers from './pages/AdminUsers';
import AdminBookings from './pages/AdminBookings';
import AdminSettings from './pages/AdminSettings';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/cars" element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <CustomerCars />
            </ProtectedRoute>
          } />
          <Route path="/customer/bookings" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerBookings />
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/bookings" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffBookings />
            </ProtectedRoute>
          } />
          <Route path="/staff/fleet" element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffFleet />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/cars" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCars />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
