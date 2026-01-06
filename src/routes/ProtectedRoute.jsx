// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");

//   if (!token || !role) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!allowedRoles?.includes(role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  // Not logged in
  if (!token || !storedRole) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role (SAME AS LOGIN)
  let role = storedRole.toLowerCase();
  if (role === "super") role = "superadmin";
  if (role === "Manager") role = "propertymanager";

  // Normalize allowed roles too (safety)
  const normalizedAllowedRoles = allowedRoles?.map((r) => {
    let normalized = r.toLowerCase();
    if (normalized === "super") normalized = "superadmin";
    if (normalized === "Manager") normalized = "propertymanager";
    return normalized;
  });

  if (!normalizedAllowedRoles?.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
