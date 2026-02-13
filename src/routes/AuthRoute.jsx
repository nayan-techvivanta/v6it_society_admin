import { Navigate } from "react-router-dom";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  if (!token || !storedRole) {
    return children;
  }

  let role = storedRole.toLowerCase().replace("-", "");

  if (role === "super") role = "superadmin";
  if (role === "manager") role = "propertymanager";
  if (role === "tanento") role = "tenantowner";
  if (role === "tanentm") role = "tenantmember";
  if (role === "security") role = "security";
  const dashboardByRole = {
    superadmin: "/superadmin/dashboard",
    propertymanager: "/property/dashboard",
    admin: "/admin/dashboard",
    tenantowner: "/user/dashboard",
    tenantmember: "/user/dashboard",
    security: "/user/dashboard",
  };

  if (!dashboardByRole[role]) {
    return children;
  }

  return <Navigate to={dashboardByRole[role]} replace />;
};

export default AuthRoute;
