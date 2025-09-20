import { useState } from "react";
import { Container, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import FormItem from "./FormItem";
import FormButton from "./FormButton";
import API_CONFIG from "../../components/constant/apiConstants";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function Registration() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/registration`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status !== 200) {
        throw new Error("Registration failed");
      }

      navigate("/success");
      // Handle successful registration (e.g., redirect to login page)
      // history.push('/login');
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Show error message for user already exists
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("An error occurred during registration");
        // Handle other errors
        console.error("Error:", error.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthLayout>
      <Container className="p-5">
        <div className="form-wrapper pt-3">
          <header>
            <h1 style={{ fontSize: "30px" }}>Registration</h1>
          </header>
          <Form
            className="login rounded p-3 mt-3"
            method="POST"
            onSubmit={formSubmitHandler}
          >
            <FormItem
              className="mb-3"
              controlId="name"
              label="Full Name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
            />

            <FormItem
              className="mb-3"
              controlId="username"
              label="Username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />

            <FormItem
              className="mb-3"
              controlId="email"
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
            />

            <FormItem
              className="mb-3"
              controlId="password"
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            {errorMsg && <div className="text-danger mb-3">{errorMsg}</div>}

            <FormButton
              buttonText="Registration"
              sideText="Already have an account?"
              sideLinkText="Login Now"
              link="/login"
            />
          </Form>
        </div>
      </Container>
    </AuthLayout>
  );
}

export default Registration;
