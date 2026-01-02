import { Navigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return children;
  }

  const dashboardByRole = {
    superadmin: "/superadmin/dashboard",
    propertymanager: "/property/dashboard",
    admin: "/admin/dashboard",
  };

  return <Navigate to={dashboardByRole[role]} replace />;
};

export default AuthRoute;
