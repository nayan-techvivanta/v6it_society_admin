import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../layout/AppLayout";
import Login from "../pages/Auth/Login";

import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";

import SADashboard from "../pages/SuperAdmin/Dashboard";
import SAPropertyManager from "../pages/SuperAdmin/PropertyManager";
import SABuildings from "../pages/SuperAdmin/Buildings";
import SACards from "../pages/SuperAdmin/Card";
import SADevices from "../pages/SuperAdmin/Devices";
import Unauthorized from "../pages/Errors/Unauthorized";
import NotFound from "../pages/Errors/NotFound";
import Society from "../pages/SuperAdmin/Society";

import PMDashboard from "../pages/PropertyManager/DashboardCom";
import AdminPage from "../pages/PropertyManager/Adminpage";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminBuildings from "../pages/Admin/AdminBuildings";
import Security from "../pages/Admin/Security";
import Flats from "../pages/Admin/Flats";
import AdminSecurityPage from "../pages/SuperAdmin/AdminSecurityPage";
import PMBuildings from "../pages/PropertyManager/PMBuildings";
import PMSociety from "../pages/PropertyManager/PMSociety";
import PMBroadCast from "../pages/PropertyManager/PMBroadCast";
import Visitors from "../pages/SuperAdmin/Visitors";
import BroadCast from "../pages/SuperAdmin/BroadCast";
import VisiterLog from "../pages/Admin/VisiterLog";
import AdminCards from "../pages/Admin/AdminCards";
import AdminBroadcast from "../pages/Admin/AdminBroadcast";
// import AdminComplaints from "../pages/Admin/Complaints";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ================= AUTH ================= */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />

        {/* ================= SUPER ADMIN ================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/superadmin/dashboard" element={<SADashboard />} />
          <Route
            path="/superadmin/property-managers"
            element={<SAPropertyManager />}
          />
          <Route path="/superadmin/buildings" element={<SABuildings />} />
          <Route path="/superadmin/security" element={<AdminSecurityPage />} />
          <Route path="/superadmin/society" element={<Society />} />
          <Route path="/superadmin/cards" element={<SACards />} />
          <Route path="/superadmin/devices" element={<SADevices />} />
          <Route path="/superadmin/visitors" element={<Visitors />} />
          <Route path="/superadmin/broadcast" element={<BroadCast />} />
        </Route>

        {/* ================= PROPERTY MANAGER ================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["propertymanager"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/property/dashboard" element={<PMDashboard />} />
          <Route path="/property/admin" element={<AdminPage />} />
          <Route path="/property/society" element={<PMSociety />} />
          <Route path="/property/buildings" element={<PMBuildings />} />
          <Route path="/property/broadcast" element={<PMBroadCast />} />
        </Route>

        {/* ================= ADMIN ================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/buildings" element={<AdminBuildings />} />
          <Route path="/admin/flats/:buildingId" element={<Flats />} />
          <Route path="/admin/security" element={<Security />} />
          <Route path="/admin/visiters" element={<VisiterLog />} />
          <Route path="/admin/broadcast" element={<AdminBroadcast />} />
          <Route path="/admin/cards" element={<AdminCards />} />
        </Route>

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
