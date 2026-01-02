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
import NotFound from "../pages/Errors/NotFounda";

// import PMDashboard from "../pages/PropertyManager/Dashboard";
// import PMBuildings from "../pages/PropertyManager/Buildings";

// import AdminDashboard from "../pages/Admin/Dashboard";
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
          <Route path="/superadmin/cards" element={<SACards />} />
          <Route path="/superadmin/devices" element={<SADevices />} />
        </Route>

        {/* ================= PROPERTY MANAGER ================= */}
        {/*
        <Route
          element={
            <ProtectedRoute allowedRoles={["propertymanager"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/property/dashboard" element={<PMDashboard />} />
          <Route path="/property/buildings" element={<PMBuildings />} />
        </Route>
        */}

        {/* ================= ADMIN ================= */}
        {/*
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
        </Route>
        */}

        {/* Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
