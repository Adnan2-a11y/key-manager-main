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

const fetchOrders = async (filters) => {
    const data = Object.fromEntries(filters);
    try {
      const token = Cookies.get("accessToken");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const queryString = new URLSearchParams(data).toString();
      const response = await axios.get(`${BASE_URL}/api/shop/all-orders?${queryString}`, { headers: headers });

      return response.data || {};
    } catch (error) {
      console.error("Error fetching users:", error);
    }
};

const getOrderDetails = async (id) => {
    try {
        if (!id){
            throw new Error("Order ID is missing")
        }
        const response = await axios.get(`${BASE_URL}/api/shop/order/view/${id}`, {
          headers: getAccessToken(),
        });
        return response.data || {};
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

const updateOrderStatus = async (id, status) => {
    try {
        if (!id){
            throw new Error("Order id is missing")
        }
        if (!status){
            throw new Error("Order status is missing")
        }
        const response = await axios.post(`${BASE_URL}/api/serial-numbers/update/${id}`,{
            status: status
        },
        {
          headers: getAccessToken(),
        });
        return  response;
    } catch (error) {
        console.error("Error updating order:", error);
    }
}

export {
    fetchOrders,
    getOrderDetails,
    updateOrderStatus
}