import { useNavigate, useParams } from "react-router-dom";
import API_CONFIG from "../../components/constant/apiConstants";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import { useStore } from "../../store/store";
import Swal from 'sweetalert2';
import '../../assets/css/apikey.css';

const BASE_URL = API_CONFIG.API_ENDPOINT;

export default function ApiKeyEditPage() {
    const { id } = useParams();
    const { setApiKeys } = useStore();
    const navigate = useNavigate();
    // const [ apiData, setApiData ] = useState({});
    const token = Cookies.get("accessToken");
    const [syncStatus, setSyncStatus] = useState({status: "pending", message: ""});
    const [syncStarted, setSyncStarted] = useState(false);
    const [formData, setFormData] = useState({
        key: "",
        name: "",
        status: "",
        auth_key: ""
      });

    useEffect(() => {    
        (async () => {
            try {
                const headers = {
                    authorization: `Bearer ${token}`,
                }
                const res = await axios.get(`${BASE_URL}/api/integration/api-key/${id}`, {headers: headers});
                // console.log(res.data);
                if (res.data.apiKey) {
                    // setApiData(res.data.apiKey);
                    setFormData({
                        key: res.data.apiKey.key,
                        name: res.data.apiKey.name,
                        status: res.data.apiKey.status,
                        auth_key: res.data.apiKey.webhook_key
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })();
    }, [id, token]);

    useEffect(() => {
        const fetchStatus = async () => {
            const headers = {
                authorization: `Bearer ${token}`,
            };
            const res = await axios.get(`${BASE_URL}/api/integration/sync-status?storeId=${id}`, { headers });
            console.log(res.data, "Initial status fetch");
    
            if (res.data.success) {
                if (res.data.message.status === 'pending') {
                    setSyncStarted(true); // This will trigger the second useEffect
                }
                setSyncStatus(res.data.message);
            }
        };
    
        fetchStatus();
    }, [id, token]);

    useEffect(() => {
        if (!syncStarted) return;
    
        const interval = setInterval(async () => {
            const headers = {
                authorization: `Bearer ${token}`,
            };
            const res = await axios.get(`${BASE_URL}/api/integration/sync-status?storeId=${id}`, { headers });
    
            console.log(res.data, "Polling...");
            if (res.data.success) {
                setSyncStatus(res.data.message);
    
                if (res.data.message.status === 'live') {
                    clearInterval(interval);
                    setSyncStatus({ status: "live", message: "✅ All data import finished" });
                    setSyncStarted(false);
                }
            }
        }, 5000);
    
        return () => clearInterval(interval);
    }, [syncStarted, id, token]);

    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure that you want to change the status of this order?",
            icon: "success",
            confirmButtonText: "Yes, Update",
            showCancelButton: true,
            draggable: true,
            })
            .then( async (willUpdate) => {
                if (willUpdate.isConfirmed) {
                    try {
                        const headers = {
                            authorization: `Bearer ${token}`,
                        }
                        const response = await axios.patch(`${BASE_URL}/api/integration/update/${id}`, formData, {headers: headers});
                        
                        if(response.statusText === "OK"){
                            
                            const response = await axios.get(`${BASE_URL}/api/integration/list`, { headers: headers });
                            if(response.data.apiKeys){
                                setApiKeys(response?.data?.apiKeys);
                            }
                            Swal.fire("Complete!", "API Key has been updated", "success").then(() => {
                                navigate("/api-keys");
                            });
                        }
                    } catch (error) {
                        console.error(error)
                        Swal.fire("Error!", "Error updating the API Key", "error");
                    }
                }
            });
      };

    const handleDelete = async (event, id) => {
        event.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure that you want to delete?",
            icon: "warning",
            confirmButtonText: "Yes, Delete",
            showCancelButton: true,
            draggable: true,
            })
            .then( async (willDelete) => {
                if (willDelete.isConfirmed) {
                    try {
                        const headers = {
                            authorization: `Bearer ${token}`,
                        }
                        const data = {apiKeyId: id};
                        const response = await axios.post(`${BASE_URL}/api/integration/delete`, data, {headers: headers});
                        console.log(response.success);
                        if(response.success){
                            
                            const response = await axios.get(`${BASE_URL}/api/integration/list`, { headers: headers });
                            if(response.data.apiKeys){
                                setApiKeys(response?.data?.apiKeys);
                            }
                        }
                        Swal.fire("Complete!", "API Key has been deleted", "success").then(() => {
                            navigate("/api-keys");
                        });
                    } catch (error) {
                        console.error("Error deleting the API Key:", error);
                        Swal.fire("Error!", "Error deleting the API Key", "error");
                    }
                }
            });
    };

    const handleSync = async (event, id) => {
        event.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: "All customers, orders and coupons data will import here.",
            icon: "info",
            confirmButtonText: "Yes, Sync All Data",
            showCancelButton: true,
            draggable: true,
            }).then( async (willSync) => {
                if (willSync.isConfirmed) {
                    setSyncStarted(true);
                    
                    try {
                        const headers = {
                            authorization: `Bearer ${token}`,
                        }
                        const response = await axios.get(`${BASE_URL}/api/integration/start-sync?store=${id}`, {headers: headers});
                        console.log(response);
                        
                    } catch(err) {
                        setSyncStarted(false);
                        console.error("Error sync:", err);
                        Swal.fire("Error!", "Error sync", "error");

                    }
                }
            })
    }

    return (
        <Container className="mt-4">
            <Stack gap={2} direction="horizontal">
                <h2 className="me-auto">Update API Key</h2>
                <Stack gap={2} direction="horizontal">
                <span className="fade-message">{syncStatus.message}</span>
                <Button variant="warning" className="btn-sm" type="cancel" onClick={(event) => handleSync(event, id)}>
                    Sync Shop Data
                </Button>
                </Stack>
            </Stack>
            <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Key</Form.Label>
                <p>{formData.key}</p>
                </Form.Group>        

                <Form.Group className="mb-3">
                <Form.Label>Webhook Auth Key</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter Webhook Auth Key"
                    name="auth_key"
                    value={formData.auth_key || ""}
                    onChange={handleChange}
                />
                <Form.Text className="text-warning">
                    You must be update this field to use this API Key
                </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="live">Live</option>
                    <option value="disabled">Disabled</option>
                </Form.Select>
                </Form.Group>
                <Stack gap={2} direction="horizontal">
                <Button variant="secondary" type="cancel" onClick={() => navigate("/api-keys")}>
                Go back
                </Button>
                <Button variant="primary" type="submit">
                Save Chnages
                </Button>
                <Button variant="danger" type="delete" className="ms-auto" onClick={(event) => handleDelete(event, id)}>
                Delete
                </Button>
                </Stack>
            </Form>
        </Container>
    )
}