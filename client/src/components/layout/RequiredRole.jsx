/* eslint-disable react/prop-types */
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../../store/store";

function RequiredRole({ requiredRole }) {
  const { isLoggedIn, user } = useStore();

  // Check if the user is logged in and has the required role
  const hasRequiredRole = isLoggedIn && user && user.role === requiredRole;

  // Render the route if the user is logged in and has the required role, otherwise redirect to homepage
  return hasRequiredRole ? <Outlet /> : <Navigate to="/notFound" />;
}

export default RequiredRole;
