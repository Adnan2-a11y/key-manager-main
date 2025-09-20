import { useState } from "react";
import { useStore } from "../../store/store";
import "../../assets/css/profilePage.css";
import PersonalInformation from "./PersonalInformation";
import Address from "./Address";
import ContactInformation from "./ContactInformation";
import { Button } from "react-bootstrap";
import axios from "axios";
import API_CONFIG from "../../components/constant/apiConstants";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function ProfilePage() {
  const { user } = useStore();
  const [editedFields, setEditedFields] = useState({
    fullName: user ? user?.profile?.fullName : "",
    birthDate: user ? user?.profile?.birthDate : "",
    phoneNumber: user ? user?.phone_number : "",
    city: user ? (user.profile ? user.profile?.address?.city : "") : "",
    post: user ? (user.profile ? user.profile?.address?.zipCode : "") : "",
    country: user
      ? user.profile
        ? user.profile?.address?.country
        : ""
      : "Bangladesh",
    gender: user ? user.profile?.gender : "Male",
  });

  console.log(user._id);

  const handleChange = (fieldName, value) => {
    setEditedFields({
      ...editedFields,
      [fieldName]: value,
    });
  };

  const handleUpdateProfile = async () => {
    try {
      const userId = user._id;

      const response = await axios.patch(
        `${BASE_URL}/api/user/update?id=${userId}`,
        editedFields
      );
      if (response.data.success) {
        // Profile updated successfully
        console.log("Profile updated successfully"); // Exit editing mode
      } else {
        // Handle error response
        console.error("Failed to update profile:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <>
      <div className="row mt-3">
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-6">
              <PersonalInformation
                user={user}
                handleChange={handleChange}
                editedFields={editedFields}
              />
            </div>
            <div className="col-md-6">
              <ContactInformation
                user={user}
                handleChange={handleChange}
                editedFields={editedFields}
              />
              <Address
                user={user}
                handleChange={handleChange}
                editedFields={editedFields}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Button variant="secondary" onClick={handleUpdateProfile}>
          Update
        </Button>
      </div>
    </>
  );
}

export default ProfilePage;
