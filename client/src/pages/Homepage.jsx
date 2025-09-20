import { Button } from "antd";
import "../assets/css/homepage.css";
import MainLayout from "../components/layout/MainLayout";

function Homepage() {
  return (
    <MainLayout>
      <div className="container">
        <h1>Dashboard</h1>
        <Button href="/multi">Visit Our New Dashboard</Button>
      </div>
    </MainLayout>
  );
}

export default Homepage;
