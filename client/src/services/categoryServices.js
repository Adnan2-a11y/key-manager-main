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
const getAccessTokenAndType = () => {
  const token = Cookies.get("accessToken");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  };

  return headers;
};

const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/product/categories`, {
      headers: getAccessToken(),
    });
    // console.log("fetching category Done");
    return response.data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

const deleteCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/product/category/delete?id=${categoryId}`, {
      headers: getAccessToken(),
    });
    // console.log("fetching category Done");
    return response.data.success || false;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return false;
  }
};

const updateCategory = async (updateCategory) => {
  try {
    // if(name === "") {
    //   return {data:{ success: false, message: "Category name is required" }};
    // }
    const res = await axios.patch(`${BASE_URL}/api/product/category/edit`, updateCategory, {
      headers: getAccessTokenAndType(),
    });
    return res
  } catch (error) {
    console.error("Error fetching categories:", error);
    return false;
  }
};

const createCategory = async (newCategory) => {
  try {
    const { name } = newCategory;
    if(name === "") {
      return {data:{ success: false, message: "Category name is required" }};
    }
    const res = await axios.post(
      `${BASE_URL}/api/product/category/add`,
      newCategory,
      {
        headers: getAccessTokenAndType(),
      }
    );
    return res;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {data:{ success: false, message: error.message }};
  }
  

};
export { fetchCategories, deleteCategory, updateCategory, createCategory };