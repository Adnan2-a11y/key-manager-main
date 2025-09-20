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

const fetchSerialKeys = async (currentPage = 1, productId = "", searchQuery = "", keyStatus = "", pageLimit = 10) => {
    try {
      console.log("fetching all serial keys");
      const response = await axios.get(`${BASE_URL}/api/serial-numbers?limit=${pageLimit}&search=${searchQuery}&status=${keyStatus}&productId=${productId}&page=${currentPage}`, {
        headers: getAccessToken(),
      });
      return response.data || {};
    } catch (error) {
      console.error("Error fetching users:", error);
    }
};

const deleteSerialNumber = async (id) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/serial-numbers/delete?id=${id}`,
        { headers: getAccessToken() }
      );

      return response.data || {};
    } catch (error) {
      console.error("Error deleting key:", error);
    }
};

export { 
  fetchSerialKeys,
  deleteSerialNumber
};