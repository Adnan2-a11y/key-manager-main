import { useState, useRef } from "react";
import axios from "axios";
import "../assets/css/settings.css";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "react-bootstrap";
import { FaCircle } from "react-icons/fa";
import API_CONFIG from "../components/constant/apiConstants";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function Settings() {
  const [logoFile, setLogoFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleLogoUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      // Send logo file to server
      await axios.post(
        `${BASE_URL}/api/upload/logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLogoFile(null);
      setUploadMessage("Logo uploaded successfully.");
      setTimeout(() => {
        setUploadMessage("");
      }, 3000);
      fileInputRef.current.value = null;
    } catch (error) {
      console.error("Error uploading logo:", error);
      setUploadMessage("Error uploading logo. Please try again.");
    }
  };

  return (
    <MainLayout>
      <div className="container">
        <h1>Settings</h1>
      </div>

      <section className="settings-container">
        <div className="logo_container">
          <div className="logo-heading">
            <FaCircle className="logo-icon" />
            <h2 className="logo-title">Change Logo</h2>
          </div>
          <div className="logo_input">
            <input type="file" onChange={handleLogoChange} ref={fileInputRef} />
            <Button variant="secondary" onClick={handleLogoUpload}>
              Update Logo
            </Button>
            {uploadMessage && <p>{uploadMessage}</p>}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Settings;
