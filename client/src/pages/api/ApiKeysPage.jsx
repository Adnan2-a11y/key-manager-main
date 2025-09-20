import { Table } from "react-bootstrap";
import { useStore } from "../../store/store";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect } from "react";
import API_CONFIG from "../../components/constant/apiConstants";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { Cog, Eye } from "lucide-react";
const BASE_URL = API_CONFIG.API_ENDPOINT;

export default function ApiKeysPage() {
    const { apiKeys, setApiKeys } = useStore();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const token = Cookies.get("accessToken");

    useEffect(() => {
        (async () => {
          try {
            const headers = {
              authorization: `Bearer ${token}`,
            };
            // let typeString = type ? `&type=${type}` : "";
    
    
            const response = await axios.get(`${BASE_URL}/api/integration/list`, { headers: headers });
            console.log(response);
            if(response.data.apiKeys){
                setApiKeys(response?.data?.apiKeys);
            }
          } catch (error){
            console.log(error)
          }
        })();
      }, [setApiKeys, token, type]);

    return (
        <div className="wrap">
                <h1>API Keys</h1>
                {apiKeys ? (
                    <>
                    <Table responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Creation Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {apiKeys.map((item, index) => 
                                <tr key={item._id}>
                                    <td> {index + 1}</td>
                                    <td className="text-start">{item.name}</td>
                                    <td className="text-start">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') + " " + new Date(item.createdAt).toLocaleTimeString('en-GB').replace(/\//g, '-')}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <a href={`/api-key/edit/${item._id}`}>
                                                <Eye 
                                                size={20}
                                                color="green"
                                                className="action-button"/>
                                            </a>
                                            <a href={`/store/sync/${item._id}`}>
                                                <Cog 
                                                    size={20}
                                                    color="black"
                                                    className="action-button"/>
                                            </a>
                                        </div>
                                        
                                        
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    </>
                ) : (
                    <p>No API keys found</p>
                )}
        </div>
    )
}