import { Form, Button, Row, Col } from "react-bootstrap";
import axios from "axios";
import FormField from "../../components/common/form/FormField";
import Cookies from "js-cookie";
import API_CONFIG from "../../components/constant/apiConstants";
import { Formik } from "formik";
import { object, string, number } from "yup";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { useEffect } from "react";
import { fetchCategories } from "../../services/categoryServices";
import { fetchRoles } from "../../services/roleServices";
import Swal from "sweetalert2";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function ProductAddForm() {
  const token = Cookies.get("accessToken");
  const { categories, roles, setCategories, setRoles } = useStore();

  const navigate = useNavigate();

  const productTypeOptions = [
    { label: "Physical", value: "physical" },
    { label: "Download", value: "download" },
    { label: "Subscription", value: "subscription" },
  ];

  const schema = object().shape({
    productName: string().required("Product name is required!"),
    regularPrice: number().required("Regular price is required!"),
  });

  useEffect(() => {
    (async () => {
      const cats = await fetchCategories();
      setCategories(cats);
      const roles = await fetchRoles();
      setRoles(roles);
    })();
  }
  , [setCategories, setRoles]);

  return (
    <Formik
      initialValues={{
        productName: "",
        dynamicUrl: "",
        purchasePrice: "",
        regularPrice: "",
        sellPrice: "",
        productType: "Download",
        longDescription: "",
        shortDescription: "",
        tag: "",
        category: "",
        created_by: "admin",
        permission: "",
      }}
      validationSchema={schema}
      onSubmit={async (values, { resetForm }) => {
        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          };

          const formDataToSend = new FormData();

          for (const key in values) {
            formDataToSend.append(key, values[key]);
          }

          const res = await axios.post(
            `${BASE_URL}/api/product/add`,
            formDataToSend,
            {
              headers: headers,
            }
          );

          // Clear form data after successfully submission
          if(res.data.success){
            Swal.fire({
              title: "Success",
              text: res.data.message,
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              resetForm();
              navigate("/product/all");
            });
          }else{
            Swal.fire({
              title: "Error",
              text: res.data.message,
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } catch (error) {
          console.log(error);
          Swal.fire({
            title: "Error",
            text: "An error occurred while adding the product.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }}
    >
      {({ handleSubmit, handleChange, values, setFieldValue, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Form.Group controlId="productName">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Product Name"
              value={values.productName}
              onChange={handleChange}
              isInvalid={!!errors.productName}
            />

            <Form.Control.Feedback type="invalid">
              {errors.productName}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mt-2">
            <Col xs={6}>
              <FormField
                controlId="dynamicUrl"
                name="dynamicUrl"
                label="Dynamic URL"
                type="text"
                placeholder="Dynamic URL"
                value={values.dynamicUrl}
                onChange={handleChange}
              />
            </Col>
            <Col xs={6}>
              <Form.Group controlId="purchasePrice">
                <Form.Label>Purchase Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Purchase Price"
                  value={values.purchasePrice}
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
            <Col xs={6}>
              <Form.Group controlId="regularPrice">
                <Form.Label>Regular Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Regular Price"
                  value={values.regularPrice}
                  onChange={handleChange}
                  isInvalid={!!errors.regularPrice}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.regularPrice}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <FormField
                controlId="sellPrice"
                name="sellPrice"
                label="Sell Price"
                type="number"
                placeholder="Sell Price"
                value={values.sellPrice}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <FormField
            controlId="shortDescription"
            name="shortDescription"
            label="Product short Description"
            type="textarea"
            value={values.shortDescription}
            onChange={handleChange}
          />

          <FormField
            controlId="longDescription"
            name="longDescription"
            label="Product Long Description"
            type="textarea"
            placeholder="Add product description "
            value={values.longDescription}
            onChange={handleChange}
            rows={3}
          />

          <Row>
            <Col xs={6}>
              <FormField
                controlId="productType"
                name="productType"
                label="Product Type"
                type="select"
                options={productTypeOptions}
                value={values.productType}
                onChange={handleChange}
              />
            </Col>

            <Col xs={6}>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
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
                value={values.permission}
                onChange={handleChange}
              />
            </Col>
          </Row>

          {resMsg && <p className="resMsg text-danger ">{resMsg}</p>}

          <Button variant="primary" type="submit" className="mt-3">
            Add Product
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default ProductAddForm;
