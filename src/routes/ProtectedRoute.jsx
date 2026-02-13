import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  // Not logged in
  if (!token || !storedRole) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role (SAME AS LOGIN)
  let role = storedRole.toLowerCase().replace("-", "");
  if (role === "super") role = "superadmin";
  if (role === "Manager") role = "propertymanager";
  if (role === "tanento") role = "tenantowner";
  if (role === "tanentm") role = "tenantmember";
  if (role === "security") role = "security";
  // Normalize allowed roles too (safety)
  const normalizedAllowedRoles = allowedRoles?.map((r) => {
    let normalized = r.toLowerCase();
    if (normalized === "super") normalized = "superadmin";
    if (normalized === "manager") normalized = "propertymanager";
    if (normalized === "tanento") normalized = "tenantowner";
    if (normalized === "tanentm") normalized = "tenantmember";
    if (normalized === "security") normalized = "security";
    return normalized;
  });

  if (!normalizedAllowedRoles?.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
