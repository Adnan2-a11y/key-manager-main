import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import "../../assets/css/authStyle.css";
import AuthLayout from "../../components/layout/AuthLayout";
import axios from "axios";
import Cookies from "js-cookie";
import FormButton from "./FormButton";
import FormItem from "./FormItem";
import API_CONFIG from "../../components/constant/apiConstants";
import { useStore } from "../../store/store";

const BASE_URL = API_CONFIG.API_ENDPOINT;

const LoginForm = () => {
  const { setIsLoggedIn, setUser, setIsSidebarCollapsed } = useStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/login`, formData);
      const { accessToken, user } = res.data;
      if (res.status === 200) {
        const cookieOption = {
          expires: new Date(Date.now() + 24 * 7 * 60 * 60 * 1000),
        };
        Cookies.set("accessToken", accessToken, cookieOption);
        setIsLoggedIn(true);
        setUser(user);
        setIsSidebarCollapsed(false);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthLayout>
      <Container className="p-5 ">
        <div className="form-wrapper pt-3">
          <header>
            <h1 style={{ fontSize: "30px" }}>Login</h1>
          </header>

          <Form className="login rounded p-3 mt-3" onSubmit={handleSubmit}>
            <FormItem
              className="mb-3"
              controlId="username"
              label="Username or email"
              type="text"
              name="usernameOrEmail"
              placeholder="Enter your username or email"
              value={formData.usernameOrEmail}
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

            <FormButton
              buttonText="Login"
              sideText="Don't have any account?"
              sideLinkText="Register Now"
              link="/registration"
            />
          </Form>
        </div>
      </Container>
    </AuthLayout>
  );
};

export default LoginForm;
