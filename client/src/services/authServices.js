import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import API_CONFIG from "../components/constant/apiConstants";

// Set the base URL for the API

const BASE_URL = API_CONFIG.API_ENDPOINT;

const checkTokenValidity = (accessToken) => {
  if (!accessToken) {
    return false;
  }
  // Check if the access token is expired
  const decodedToken = decodeToken(accessToken);
  if (!decodedToken || decodedToken.exp < Date.now() / 1000) {
    // Token expired, handle refresh or logout
    return false;
  }
  // Token is valid
  return true;
};

// Decode JWT token
const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

const logout = async (type = 'logout') => {
  try {
    // Get the access token from cookies
    const accessToken = Cookies.get("accessToken");

    // Set the authorization header with the token
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    // Send a POST request to the logout endpoint with the authorization header
    const response = await axios.post(`${BASE_URL}/api/${type}`, null, config);

    // Clear token from cookies
    Cookies.remove("accessToken");

    return response; // Return the response from the logout request
  } catch (error) {
    console.error("Logout failed:", error);
    throw error; // Throw the error to be handled by the caller
  }
};

export { checkTokenValidity, logout };
