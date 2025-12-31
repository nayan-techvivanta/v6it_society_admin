import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import Login from "../pages/Auth/Login";
import Dashboard from "../pages/SuperAdmin/Dashboard";
import PropertyManager from "../pages/SuperAdmin/PropertyManager";
import Buildings from "../pages/SuperAdmin/Buildings";
import Card from "../pages/SuperAdmin/Card";
import Devices from "../pages/SuperAdmin/Devices";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/property-manager" element={<PropertyManager />} />
          <Route path="/buildings" element={<Buildings />} />
          <Route path="/cards" element={<Card />} />
          <Route path="/device" element={<Devices />} />
        </Route>

        <Route
          path="*"
          element={<h1 className="text-center mt-20">Page Not Found</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}
