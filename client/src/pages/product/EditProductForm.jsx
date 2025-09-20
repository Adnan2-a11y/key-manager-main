/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import API_CONFIG from "../../components/constant/apiConstants";
import { Form, Row, Col, Button, Stack } from "react-bootstrap";
import FormField from "../../components/common/form/FormField";
import { Formik } from "formik";
import { object, string, number } from "yup";
import { useStore } from "../../store/store";
import { fetchProducts } from "../../services/productServices";
import { useSearchParams  } from "react-router-dom";

const BASE_URL = API_CONFIG.API_ENDPOINT;

const EditProductForm = ({ productId, onClose, onEdit }) => {
  const [productData, setProductData] = useState(null);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("accessToken");
  const { setNoticia, setProducts, categories, roles } = useStore();
  const productTypeOptions = [
    { label: "Physical", value: "physical" },
    { label: "Download", value: "download" },
    { label: "Subscription", value: "subscription" },
  ];

  // Fetching product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(
          `${BASE_URL}/api/product/details?id=${productId}`,
          { headers }
        );
        setProductData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId, token]);

  const validationSchema = object().shape({
    productName: string().required("Product name is required!"),
    regularPrice: number().required("Regular price is required!"),
  });
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!productData) {
    return <div>Failed to load product data</div>;
  }
  return (
    <Formik
      initialValues={productData}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          };

          const formDataToSend = new FormData();

          for (const key in values) {
            formDataToSend.append(key, values[key]);
          }


          const res = await axios.patch(
            `${BASE_URL}/api/product/edit?id=${productId}`,
            formDataToSend,
            { headers }
          );
          if(res.data.success) {
            setNoticia({message: res.data.message, type: "success"});
            const updatedParams = new URLSearchParams(searchParams);
            const cat = updatedParams.get("cat");
            const currentPage = updatedParams.get("page");
            const searchQuery = updatedParams.get("search");
            const data = await fetchProducts({currentPage: currentPage || 1, category: cat || "", searchQuery: searchQuery || ""});
            if(data.success){
              setProducts(data.products);
            }
            onClose();
          }
        }catch (error) {
          console.error("Error updating product:", error);
        }
      }}
    >
      {({ handleSubmit, handleChange, values: productData, setFieldValue, errors, isSubmitting }) => (
        <Form onSubmit={handleSubmit} >
        <Row>
          <Col>
            <FormField
              controlId="productName"
              name="productName"
              label="Product Name"
              type="text"
              placeholder="Product Name"
              value={productData.productName}
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Row className="mt-2">
        <Col xs={6}>
            <FormField
              controlId="dynamicUrl"
              name="dynamicUrl"
              label="Dynamic URL"
              type="text"
              placeholder="Dynamic URL"
              value={productData.dynamicUrl}
              onChange={handleChange}
            />
          </Col>
          <Col xs={6}>
            <Form.Group controlId="purchasePrice">
              <Form.Label>Purchase Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Purchase Price"
                value={productData.purchasePrice}
                onChange={handleChange}
                isInvalid={!!errors.purchasePrice}
              />
              <Form.Control.Feedback type="invalid">
                {errors.purchasePrice}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormField
              controlId="shortDescription"
              name="shortDescription"
              label="Product short Description"
              type="textarea"
              value={productData.shortDescription}
              onChange={handleChange}
            />
          </Col>
          <Col xs={3}>
            <FormField
              controlId="regularPrice"
              name="regularPrice"
              label="Regular Price"
              type="number"
              placeholder="Regular Price"
              value={productData.regularPrice}
              step="0.01"
              onChange={handleChange}
            />
          </Col>
          <Col xs={3}>
            <FormField
              controlId="sellPrice"
              name="sellPrice"
              label="Sell Price"
              type="number"
              placeholder="Sell Price"
              step="0.01"
              value={productData.sellPrice}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <FormField
          controlId="longDescription"
          name="longDescription"
          label="Product Long Description"
          type="textarea"
          placeholder="Add product description "
          value={productData.longDescription}
          onChange={handleChange}
          rows={3}
        />

        <Row className="mt-3">
          <Col xs={6}>
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={productData.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>                
                {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.level ? Array.from({ length: category.level }).map(() => "—").join("") : ""}
                      {" "}
                      {category ? category.name : ""}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={6}>
            <FormField
              controlId="productType"
              name="productType"
              label="Product Type"
              type="select"
              options={productTypeOptions}
              value={productData.productType}
              onChange={handleChange}
            />
          </Col>
        </Row>
        <Row className="mt-2">
            <Col xs={6}>
              <FormField
                controlId="productImg"
                name="productImg"
                label="Product Image"
                type="file"
                onChange={(e) => {
                  setFieldValue("productImg", e.currentTarget.files[0]);
                }}
              />
            </Col>
            <Col xs={6}>
              <FormField
                controlId="permission"
                name="permission"
                label="Permission"
                type="select"
                options={roles.map((role) => ({
                  label: role.title,
                  value: role.slug,
                }))}
                value={productData.permission}
                onChange={handleChange}
              />
            </Col>
          </Row>

        <Stack gap={2} direction="horizontal" className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Product"}
          </Button>
          
          <Button type="button" variant="secondary" onClick={onClose} className="ms-auto">
            Cancel
          </Button>
          </Stack>
        
      </Form>
      )}
    </Formik>
  );
};

export default EditProductForm;
