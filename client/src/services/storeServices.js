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
const getStoreByID = async ( id ) => {
    try {
        if (!id){
            return {
                success: false,
                message: "Invoice number is required"
            }
        }
        const res = await axios.get(`${BASE_URL}/api/store/getStoreById/${id}`, {
            headers: getAccessToken(),
        });
        return res.data;
    } catch (error) {
        console.log(error.message);
    }
}

const startSync = async (type, id, data) => {
    try {
        switch(type){
            case 'single': {
                try {
                    const res = await axios.get(`${BASE_URL}/api/store/startSync/?storeId=${id}&invoice=${data}`, {
                        headers: getAccessToken(),
                    });
                    return res.data;
                } catch (error) {
                    return { success: false, message: "Something went wrong"};
                }
                
            }
            case 'latest': {
                try {
                    const res = await axios.get(`${BASE_URL}/api/store/startSync/?storeId=${id}&date=${data}`, {
                        headers: getAccessToken(),
                    });
                    return res.data;
                } catch (error) {
                    return { success: false, message: "Something went wrong"};
                }
            }
            case 'range': {
                try {
                    const res = await axios.get(`${BASE_URL}/api/store/startSync/?storeId=${id}&range=${JSON.stringify(data)}`, {
                        headers: getAccessToken(),
                    });
                    return res.data;
                } catch (error) {
                    return { success: false, message: "Something went wrong"};
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}
export { getStoreByID, startSync };