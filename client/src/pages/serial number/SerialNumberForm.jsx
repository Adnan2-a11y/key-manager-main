/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import { Form, Button, Dropdown } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../../components/constant/apiConstants";
import "../../assets/css/serialNumberAddPage.css";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function SerialNumberForm({ formType, initialValues }) {
  const navigate = useNavigate();
  const token = Cookies.get("accessToken");
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);

  const [focusInput, setFocusInput] = useState(false); // State variable to trigger focus
  const inputRef = useRef(null);

  // To focus input field of a dropdown(Product)
  useEffect(() => {
    if (focusInput && inputRef.current) {
      inputRef.current.focus();
      setFocusInput(false); // Reset the state variable after focusing
    }
  }, [focusInput]);

  // Fetch Supplier
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await axios.get(`${BASE_URL}/api/suppliers/all`, {
          headers: headers,
        });
        setSupplierSuggestions(response.data.suppliers);
      } catch (err) {
        console.error("Error fetching supplier names:", err);
      }
    };

    fetchSupplier();
  }, [token]);

  const handleDropdownClick = () => {
    setFocusInput(true);
  };

  const handleSelectProduct = (product, setFieldValue) => {
    // Update the form values using setFieldValue
    setFieldValue("productId", product._id);
    setFieldValue("productName", product.productName);

    // Reset other related state variables
    setShowProductDropdown(false);
    setProductSuggestions([]);
  };

  const handleSearchInputChange = async (value) => {
    setSearchKeyword(value);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      if (value.length >= 3) {
        const response = await axios.get(
          `${BASE_URL}/api/product/all?keyword=${value}`,
          {
            headers: headers,
          }
        );

        setProductSuggestions(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching product names:", error);
    }
  };

  const handleSubmit = async (values, actions) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      await axios.post(
        `${BASE_URL}/api/serial-numbers/add`,
        values,
        {
          headers: headers,
        }
      );

      console.log("values: ", values);

      actions.setSubmitting(false);
      actions.resetForm();
      navigate("/serial-numbers");
    } catch (error) {
      console.error("Error adding serial number:", error);
      actions.setSubmitting(false);

      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data &&
        error.response.data.message === "Duplicate serial numbers"
      ) {
        // Handle duplication error
        console.error("Duplication error:", error.response.data);
        // Display the duplication error message to the user
        alert(
          `${
            error.response.data.duplicates.length
          } serial numbers (${error.response.data.duplicates.join(
            ", "
          )}) already exist. `
        );
      } else {
        // Handle other errors
        console.error("Other error:", error);
        // Display a generic error message to the user
        alert("Failed to add serial numbers. Please try again later.");
      }
    }
  };

  const validationSchema = object().shape({
    productName: string().required("Product name is required"),
    serialNumber: string().required("Serial number is required"),
  });

  return (
    <Formik
      initialValues={{
        productName: "",
        serialNumber: "",
        supplierId: "",
        activationLimit: 1,
        validity: "",
        type: formType,
        user: 1, // Add user field
        activationGuide: "",
        ...initialValues,
      }}
      validationSchema={validationSchema} // Pass the validation schema to Formik
      onSubmit={handleSubmit}
    >
      {({
        handleSubmit,
        handleChange,
        values,
        errors,
        touched,
        isSubmitting,
        setFieldValue,
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          {values.type === "volume" && (
            <Form.Group controlId="user" className="mt-2">
              <Form.Label>User</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter number of users"
                name="user"
                min={1}
                value={values.user}
                onChange={handleChange}
                isInvalid={!!errors.user}
              />
              <Form.Control.Feedback type="invalid">
                {errors.user}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          <Form.Group controlId="productDropdown" className="mt-2">
            <Form.Label>Select Product</Form.Label>
            <Dropdown
              show={showProductDropdown}
              onToggle={(isOpen) => {
                setShowProductDropdown(isOpen);
                if (!isOpen) {
                  setSearchKeyword("");
                  setProductSuggestions([]);
                }
              }}
              onClick={handleDropdownClick}
              className="product-dropdown"
            >
              <Dropdown.Toggle
                className="bg-light product-dropdown"
                id="product-dropdown"
              >
                {values.productName
                  ? values.productName
                  : "Search Product by Name"}
              </Dropdown.Toggle>
              <Dropdown.Menu className="product-dropdown-menu">
                <Form.Control
                  type="text"
                  placeholder="Search product by name"
                  name="product"
                  value={searchKeyword}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  autoFocus
                  ref={inputRef}
                  isInvalid={!!errors.product}
                />
                {touched.productName && errors.productName && (
                  <Form.Control.Feedback type="invalid">
                    {errors.productName}
                  </Form.Control.Feedback>
                )}

                {productSuggestions.map((product) => (
                  <Dropdown.Item
                    key={product._id}
                    onClick={() => handleSelectProduct(product, setFieldValue)}
                  >
                    #{product.productId} - {product.productName}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>

          <Form.Group controlId="serialNumber" className="mt-2">
            <Form.Label>Serial Number</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter serial numbers (one per line)"
              name="serialNumber"
              value={values.serialNumber}
              onChange={handleChange}
              isInvalid={!!errors.serialNumber}
            />
            <Form.Control.Feedback type="invalid">
              {errors.serialNumber}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="supplier" className="mt-2">
            <Form.Label>Supplier Name</Form.Label>
            <Form.Select
              as="select"
              name="supplierId"
              value={values.supplier}
              onChange={handleChange}
            >
              <option value="">Select Supplier Name</option>
              {supplierSuggestions.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="activationLimit" className="mt-2">
            <Form.Label>Activation Limit</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter activation limit"
              name="activationLimit"
              value={values.activationLimit}
              onChange={handleChange}
            />
          </Form.Group>

            <Form.Group controlId="activationGuide" className="mt-2">
              <Form.Label>Activation Guide</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="eg. https://example.com/activation-guide"
                name="activationGuide"
                value={values.activationGuide}
                onChange={handleChange}
                isInvalid={!!errors.activationGuide}
              />
            </Form.Group>
          {/* {values.type === "volume" && (
          )} */}

          <Form.Group controlId="validity" className="mt-2">
            <Form.Label>Validity (in days)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter validity in days"
              name="validity"
              value={values.validity}
              onChange={handleChange}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="mt-3"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Add Serial Number"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default SerialNumberForm;
