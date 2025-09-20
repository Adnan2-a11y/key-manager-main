import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../components/constant/apiConstants";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import Swal from 'sweetalert2';
const BASE_URL = API_CONFIG.API_ENDPOINT;

export default function ApiKeyAddPageV2() {
    const navigate = useNavigate();
    const token = Cookies.get("accessToken");
    const [formData, setFormData] = useState({
        store_url: "",
        // consumer_key: "",
        // consumer_secret: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(formData);

        try {
            const headers = {
                authorization: `Bearer ${token}`,
            }
            const res = await axios.post(`${BASE_URL}/api/integration/connect-store`, formData, { headers: headers });
            if (res.data.success) {
                window.location.href = res.data.authorized_url;
            }
        } catch (error) {
            console.log(error.response.data.message);
            const message = error.response.data.message || "Error creating the API Key";
            Swal.fire("Error!", message, "error");

        }

    };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Create New API Key V2</h2>
            <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="https://example.com"
                        name="store_url"
                        value={formData.store_url}
                        onChange={handleChange}
                        required
                    />
                    <Form.Text className="text-warning">
                        Website name must be like e.g. https://example.com
                    </Form.Text>
                </Form.Group>

                {/* <Form.Group className="mb-3">
                    <Form.Label>Consumer key</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter Consumer key"
                        name="consumer_key"
                        value={formData.consumer_key || ""}
                        onChange={handleChange}
                    />
                    <Form.Text className="text-warning">
                        This could be found in your Woccomerce {">"} settings {">"} Advanced {">"} REST API {">"} Add New page.
                    </Form.Text>
                </Form.Group> */}

                {/* <Form.Group className="mb-3">
                    <Form.Label>Consumer secret</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter Consumer secret"
                        name="consumer_secret"
                        value={formData.consumer_secret || ""}
                        onChange={handleChange}
                    />
                    <Form.Text className="text-warning">
                        This could be found in your Woccomerce {">"} settings {">"} Advanced {">"} REST API {">"} Add New page.
                    </Form.Text>
                </Form.Group> */}

                {/* <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleChange}>
                        <option value="live">Live</option>
                        <option value="disabled">Disabled</option>
                    </Form.Select>
                </Form.Group> */}

                <Stack gap={2} direction="horizontal">
                    <Button variant="primary" type="submit">
                        Add Website
                    </Button>
                    <Button variant="danger" type="delete" className="ms-auto" onClick={() => navigate("/api-keys")}>
                        Cancel
                    </Button>
                </Stack>
            </Form>
        </Container>
    )
}