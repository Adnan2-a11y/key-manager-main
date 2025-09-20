import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import SerialNumberForm from "./SerialNumberForm";

function AddSerialNumber() {
  const [activeForm, setActiveForm] = useState("single");

  const handleFormTypeChange = (value) => {
    setActiveForm(value);
  };

  return (
    <MainLayout>
      <div>
        <h1>Add Serial Number</h1>
        <div className="btn-container">
          <ToggleButtonGroup
            type="radio"
            name="options"
            value={activeForm}
            onChange={handleFormTypeChange}
            className="btn-group"
          >
            <ToggleButton
              variant={activeForm === "single" ? "light" : "outline-light"}
              id="tbg-radio-1"
              value="single"
            >
              Single
            </ToggleButton>
            <ToggleButton
              variant={activeForm === "volume" ? "light" : "outline-light"}
              id="tbg-radio-2"
              value="volume"
            >
              Volume
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
      <div className="w-50 mt-4">
        {activeForm === "single" && <SerialNumberForm formType="single" type="add" />}
        {activeForm === "volume" && <SerialNumberForm formType="volume" type="add" />}
      </div>
    </MainLayout>
  );
}

export default AddSerialNumber;
