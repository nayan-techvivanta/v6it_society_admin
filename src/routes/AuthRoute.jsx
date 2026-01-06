import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  if (!token || !storedRole) {
    return children;
  }

  let role = storedRole.toLowerCase();
  if (role === "super") role = "superadmin";
  if (role === "Manager") role = "propertymanager";

  const dashboardByRole = {
    superadmin: "/superadmin/dashboard",
    propertymanager: "/property/dashboard",
    admin: "/admin/dashboard",
  };

  // Safety fallback
  if (!dashboardByRole[role]) {
    localStorage.clear();
    return children;
  }

  return <Navigate to={dashboardByRole[role]} replace />;
};

export default AuthRoute;
