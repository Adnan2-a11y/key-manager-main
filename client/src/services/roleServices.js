import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../components/constant/apiConstants";
const BASE_URL = API_CONFIG.API_ENDPOINT;

const getAccessToken = () => {
  const token = Cookies.get("accessToken");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  return headers;
};

const fetchRoles = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/role/all`, {
      headers: getAccessToken(),
    });
    return response.data.roles || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export { fetchRoles };