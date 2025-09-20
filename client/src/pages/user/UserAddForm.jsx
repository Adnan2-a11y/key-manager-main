import { Form, Button } from "react-bootstrap";
import { Formik } from "formik";
import { object, string } from "yup";
import axios from "axios";
import Cookies from "js-cookie";

import API_CONFIG from "../../components/constant/apiConstants";
import FormField from "../../components/common/form/FormField";
import { useNavigate } from "react-router-dom";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function UserAddForm() {
  const navigate = useNavigate();
  const validationSchema = object().shape({
    username: string().required("Username is required"),
    email: string().required("Email is required"),
    password: string().required("Password is required"),
  });

  const initialValues = {
    username: "",
    email: "",
    fullName: "",
    role: "admin",
    password: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
        console.log(values);
        try {
          const res = await axios.post(`${BASE_URL}/api/user/add`, values, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          });
          console.log(res);
          if (res.data.success) {
            // Reset the form
            resetForm();
            navigate("/user/all");
          }
        } catch (error) {
          console.error("Error adding user:", error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            // Set the specific error message sent by the server
            setErrors({ submit: error.response.data.message });
          } else {
            // Generic error message
            setErrors({
              submit: "Failed to add user. Please try again later.",
            });
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        handleChange,
        handleSubmit,
        isSubmitting,
        errors,
        touched,
      }) => (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Username"
              value={values.username}
              onChange={handleChange}
              isInvalid={touched.username && !!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter Your Email"
              value={values.email}
              onChange={handleChange}
              isInvalid={touched.email && !!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <FormField
            controlId="fullname"
            label="Full Name"
            name="fullName"
            type="text"
            placeholder="Enter Your Full Name"
            value={values.fullName}
            onChange={handleChange}
          />

          <FormField
            controlId="role"
            name="role"
            label="Role"
            type="select"
            value={values.role}
            onChange={handleChange}
            options={[
              { value: "user", label: "User" },
              { value: "admin", label: "Admin" },
            ]}
          />

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Password"
              value={values.password}
              onChange={handleChange}
              isInvalid={touched.password && !!errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>
          {errors.submit && (
            <div className="text-danger mt-2">{errors.submit}</div>
          )}
          <Button variant="primary" type="submit" className="mt-3">
            {isSubmitting ? "Adding user..." : "Add user"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default UserAddForm;
