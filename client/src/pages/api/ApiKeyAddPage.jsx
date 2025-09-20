import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../components/constant/apiConstants";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import Swal from 'sweetalert2';
const BASE_URL = API_CONFIG.API_ENDPOINT;

export default function ApiKeyAddPage() {
    const navigate = useNavigate();
    const token = Cookies.get("accessToken");
    const [formData, setFormData] = useState({
        name: "",
        status: "",
        auth_key: ""
      });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };

    const handleSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure that you want to change the status of this order?",
            icon: "success",
            confirmButtonText: "Yes, Publish",
            showCancelButton: true,
            draggable: true,
            })
            .then( async (data) => {
                if (data.isConfirmed) {
                    try {
                        const headers = {
                            authorization: `Bearer ${token}`,
                        }
                        const res = await axios.post(`${BASE_URL}/api/integration/create`, formData, {headers: headers});
                        if (res.data.success) {
                            Swal.fire("Created!", "API Key has been created", "success").then(() => {
                                navigate("/api-keys");
                            });
                        }
                    } catch (error) {
                        console.log(error.response.data.message);
                        const message = error.response.data.message || "Error creating the API Key";
                        Swal.fire("Error!", message, "error");

                    }
                }
            });
      };

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Create New API Key</h2>
            <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="website name e.g. example.com"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <Form.Text className="text-warning">
                    Website name must be like e.g. example.com without http:// or https://
                </Form.Text>
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
                    This could be found in your plugins settings page.
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
                <Button variant="primary" type="submit">
                Publish
                </Button>
                <Button variant="danger" type="delete" className="ms-auto" onClick={() => navigate("/api-keys")}>
                Cancel
                </Button>
                </Stack>
            </Form>
        </Container>
    )
}