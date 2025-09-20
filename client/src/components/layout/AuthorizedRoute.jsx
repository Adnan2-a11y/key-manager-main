import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useStore } from "../../store/store";

const AuthorizedRoute = () => {
  const location = useLocation();
  const { isLoggedIn } = useStore();
  return !isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/multi" state={{ from: location }} replace />
  );
};

export default AuthorizedRoute;
