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
const multiDashService = {
    getSummary: async(dateRanges) => {
        try {
          const startDate = dateRanges[0].format('YYYY-MM-DD');
          const endDate = dateRanges[1].format('YYYY-MM-DD');
          const response = await axios.get(`${BASE_URL}/api/v2/multi-dashboard/summary?start=${startDate}&end=${endDate}`, {
              headers: getAccessToken()
          }, dateRanges);

          if(response.data.success){
            return response.data.result;
          }else{
            return [];
          }
        } catch (error) {
          console.log(error.message);
          return false;
        }
    },

};

export default multiDashService;