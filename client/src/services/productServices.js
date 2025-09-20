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

const fetchProducts = async ({
  currentPage = 1,
  pageLimit = 10,
  category = "",
  searchQuery = "",
} = {}) => {
    try {
      const token = Cookies.get("accessToken");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`${BASE_URL}/api/product/get-all?limit=${pageLimit}&search=${searchQuery}&category=${category}&page=${currentPage}`, {
        headers,
      });
      return response.data || {};
    } catch (error) {
      console.error("Error fetching users:", error);
    }
};

const fetchProductsStock = async ({
  currentPage = 1,
  pageLimit = 10,
  category = "",
  searchQuery = "",
} = {}) => {
    try {
      const token = Cookies.get("accessToken");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`${BASE_URL}/api/product/stocks?limit=${pageLimit}&category=${category}&page=${currentPage}&search=${searchQuery}`, {
        headers,
      });
      return response.data || {};
    } catch (error) {
      console.error("Error fetching users:", error);
    }
};

const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/suppliers/all`, {
        headers: getAccessToken(),
      });
      return response.data || {};
    } catch (error) {
      console.error("Error fetching users:", error);
    }
};

const fetchProductCategories = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/product/categories`,
        { headers: getAccessToken() }
      );

      return response.data || {};
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
};

const updateSerialKey = async (values, actions) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/serial-numbers/edit/${values._id}`,
      values,
      { headers: getAccessToken() }
    );

    return response.data || {};
  } catch (error) {
    console.error("Error adding updating serial key:", error);
      actions.setSubmitting(false);

      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message === "Duplicate serial numbers"
      ) {
        // Handle duplication error
        console.error("Duplication error:", error.response.data);
        // Display the duplication error message to the user
        alert(
          `${
            error.response.data.duplicates.length
          } serial numbers (${error.response.data.duplicates.join(
            ", "
          )}) already exist. `
        );
      } else {
        // Handle other errors
        console.error("Other error:", error);
        // Display a generic error message to the user
        alert("Failed to add serial numbers. Please try again later.");
      }
  }
}

export { 
  getAccessToken, fetchProducts, fetchSuppliers,
  fetchProductCategories, updateSerialKey, fetchProductsStock
};