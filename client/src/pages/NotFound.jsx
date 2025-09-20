import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import "../assets/css/notFound.css";
const NotFound = () => {
  const navigate = useNavigate();

  const backToHomePage = () => {
    navigate("/", { replace: true });
  };

  return (
    <MainLayout>
      <div className="not__found__page">
        <h3>404 Not Found</h3>
        <button className="btn btn-info" onClick={backToHomePage}>
          back to home page
        </button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
