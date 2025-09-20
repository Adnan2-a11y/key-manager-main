/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import { Form, Button, Dropdown, Stack } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../../components/constant/apiConstants";
import "../../assets/css/serialNumberAddPage.css";

import { object, string } from "yup";
import debounce from "lodash.debounce";
import { useStore } from "../../store/store";
import { updateSerialKey } from "../../services/productServices";
import { fetchSerialKeys } from "../../services/serialNumberServices";
import { useSearchParams  } from "react-router-dom";
import Swal from "sweetalert2";

const BASE_URL = API_CONFIG.API_ENDPOINT;

const debouncedSearch = debounce(async (value, token, setProducts) => {
  if (value.length >= 3) {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${BASE_URL}/api/product/all?keyword=${value}`,
        { headers }
      );

      if(response.data.success){
        const filterData = response.data.products.map((item) => {
          // console.log(item)
          return {
            _id: item._id,
            productId: item.productId,
            name: item.productName
          }
        });
        setProducts(filterData);
      }
    } catch (error) {
      console.error("Error fetching product names:", error);
    }
  }
}, 500); // 300ms debounce delay

const keyStatus = ["available", "sold"];

function SerialNumberFormEdit({ initialValues, onClose }) {
  const [searchParams] = useSearchParams();
  const token = Cookies.get("accessToken");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [ productSuggestions, setProductSuggestions ] = useState([]);
  const {products, suppliers, setSerialNumbers} = useStore();

  const [focusInput, setFocusInput] = useState(false);
  const inputRef = useRef(null);

  // To focus input field of a dropdown(Product)
  useEffect(() => {
    if (focusInput && inputRef.current) {
      inputRef.current.focus();
      setFocusInput(false);
    }
  }, [focusInput]);

  useEffect(() =>{
    setProductSuggestions(products);
  }, [products])

  const handleDropdownClick = () => {
    setFocusInput(true);
    setProductSuggestions(products);
  };

  const handleSelectProduct = (product, setFieldValue) => {
    // Update the form values using setFieldValue
    setFieldValue("productId", product._id);
    setFieldValue("productName", product.name);

    // Reset other related state variables
    setShowProductDropdown(false);
    setProductSuggestions([]);
  };

  const handleInputChange = useCallback((value) => {
    setSearchKeyword(value);
    debouncedSearch(value, token, setProductSuggestions);
  }, [setProductSuggestions, token]);  


  // Cleanup debounce when component unmounts
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, []);

  const handleSubmit = async (values, actions) => {
    const res = await updateSerialKey( values, actions )
    console.log(res);
    if(res.success){

      const updatedParams = new URLSearchParams(searchParams);
      const currentPage = updatedParams.get("page");
      const searchQuery = updatedParams.get("search");
      const productId = updatedParams.get("productId");
      const data = await fetchSerialKeys(currentPage || 1, productId || "",  searchQuery || "");
      if(data.serialNumbers){
        setSerialNumbers(data.serialNumbers);
      }
      onClose();
      actions.setSubmitting(false);
      actions.resetForm();
    }else{
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.message,
      });
    }
  };

  const validationSchema = object().shape({
    productName: string().required("Product name is required"),
    serialNumber: string().required("Serial number is required"),
  });

  const initialFormValues = {
      activationGuide: initialValues.activationGuide || "",
      activationLimit: initialValues.activationLimit || 1,
      productId: initialValues.productId || "",
      productName: initialValues.productName || "",
      purchaseDate: initialValues.purchaseDate
        ? new Date(initialValues.purchaseDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      serialNumber: initialValues.serialNumber || "",
      serialNumberId: initialValues.serialNumberId || "",
      status: initialValues.status || 'available',
      supplierId: initialValues.supplierId || "",
      validity: (initialValues.validity === 'lifetime' ? 0 : initialValues.validity)  || 0,
      orderNumber: initialValues?.transactionId?.transactionId || "",
      warrantyDate: initialValues.warrantyDate
      ? new Date(initialValues.warrantyDate).toISOString().split("T")[0]
      : "",
      // user: 1,
      _id: initialValues._id
  }

  return (
    <Formik
      initialValues={initialFormValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
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
          <Form.Group controlId="productDropdown" className="mt-2">
            <Form.Label>Select Product</Form.Label>
            <Dropdown
              show={showProductDropdown}
              onToggle={(isOpen) => {
                setShowProductDropdown(isOpen);
                if (!isOpen) {
                  setSearchKeyword("");
                }
              }}
              onClick={handleDropdownClick}
              className="product-dropdown"
            >
              <Dropdown.Toggle
                className="bg-dark text-white product-dropdown"
                id="productDropdown"
              >
                {values.productName
                  ? values.productName
                  : "Search Product by Name"}
              </Dropdown.Toggle>
              <Dropdown.Menu className="product-dropdown-menu">
                <Form.Control
                  type="text"
                  placeholder="Search product by name"
                  className="form-control form-control-sm"
                  name="product"
                  value={searchKeyword}
                  onChange={(e) => handleInputChange(e.target.value)}
                  autoFocus
                  ref={inputRef}
                  isInvalid={!!errors.productName}
                />
                <div className="product-dropdown-wrapper">
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
                    {/* #{product.productId} - {product.name} */}
                    {product.name}
                  </Dropdown.Item>
                ))}
                </div>

              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>

          <Form.Group controlId="serialNumber" className="mt-2">
            <Form.Label>Serial Number</Form.Label>
            <Form.Control
              className="form-control form-control-sm"
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
              className="form-select form-select-sm"
              value={values.supplierId}
              onChange={handleChange}
            >
              <option value="">Select Supplier Name</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <div className="row">
          <div className="col">
          <Form.Group controlId="purchaseDate" className="mt-2">
            <Form.Label>Purchase Date</Form.Label>
            <Form.Control
                type="date"
                value={values.purchaseDate || ""}
                name="purchaseDate"
                className="form-control form-control-sm"
                onChange={handleChange}
            />
          </Form.Group>
          </div>
          <div className="col">
          <Form.Group controlId="warrantyDate" className="mt-2">
            <Form.Label>Expiration Date</Form.Label>
            <Form.Control
                  type="date"
                  value={values.warrantyDate || ""}
                  name="warrantyDate"
                  className="form-control form-control-sm"
                  onChange={handleChange}
                />
          </Form.Group>
          </div>
          </div>

          <div className="row">
          <div className="col">
          <Form.Group controlId="activationLimit" className="mt-2">
            <Form.Label>Activation Limit</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter activation limit"
              name="activationLimit"
              value={values.activationLimit}
              className="form-control form-control-sm"
              onChange={handleChange}
            />
          </Form.Group>
          </div>
          <div className="col">
          <Form.Group controlId="status" className="mt-2">
            <Form.Label>Status</Form.Label>
            <Form.Select
              as="select"
              name="status"
              value={values.status}
              className="form-select form-select-sm"
              onChange={handleChange}
            >
              <option value="">Select</option>
              {keyStatus.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          </div>          
          </div>

          <div className="row">
          <div className="col">
          <Form.Group controlId="validity" className="mt-2">
            <Form.Label>Validity (in days)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter validity in days"
              name="validity"
              value={values.validity}
              className="form-control form-control-sm"
              onChange={handleChange}
            />
          </Form.Group>
          </div>
          <div className="col">
          <Form.Group controlId="orderNumber" className="mt-2">
            <Form.Label>Order Number</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter order number"
              name="orderNumber"
              value={values.orderNumber}
              className="form-control form-control-sm"
              onChange={handleChange}
            />
          </Form.Group>
          </div>
          </div>
          

          
          
          

          

          

          <Form.Group controlId="activationGuide" className="mt-2">
            <Form.Label>Activation Guide</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="eg. https://example.com/activation-guide"
              name="activationGuide"
              value={values.activationGuide}
              onChange={handleChange}
              className="form-control form-control-sm"
              isInvalid={!!errors.activationGuide}
            />
          </Form.Group>

          

          
          
          <Stack direction="horizontal" gap={2} className="mt-3">
            <Button
              variant="danger"
              className="mt-3 btn-sm opacity-75"
              type="delete"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Delete"}
            </Button>
            <Button
              variant="success"
              className="mt-3 me-auto btn-sm opacity-75 hover:opacity-100"
              type="reset"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Make it Available"}
            </Button>
            <Button
              variant="secondary"
              className="mt-3 btn-sm"
              type="cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {"Cancel"}
            </Button>          
            <Button
              variant="primary"
              className="mt-3"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Update Serial Key"}
            </Button>          
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default SerialNumberFormEdit;
