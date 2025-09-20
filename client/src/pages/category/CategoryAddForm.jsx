/* eslint-disable react/prop-types */
import { Form, Button, Row, Col } from "react-bootstrap";
import FormField from "../../components/common/form/FormField";
import { useState, useRef } from "react";
import Swal from "sweetalert2";

function CategoryAddForm({ categories, onCategoryAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentCategory: "",
    description: "",
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        categoryImage: file,
      });
    }

    console.log(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await onCategoryAdded(formData);
      if(response.data.success) {
        setFormData({
          name: "",
          slug: "",
          parentCategory: "",
          description: "",
        });
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
        });
      }else{
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message,
        });
      }
      // Reset file input value
      fileInputRef.current.value = null;
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField
        controlId="name"
        name="name"
        label="Category Name"
        type="text"
        placeholder="Category Name"
        value={formData.name}
        onChange={handleChange}
      />
      <Row>
        <Col xs={6}>
          <FormField
            controlId="slug"
            name="slug"
            label="Slug"
            type="text"
            placeholder="Slug"
            value={formData.slug}
            onChange={handleChange}
          />
        </Col>
        <Col xs={6}>
          <Form.Group controlId="parentCategory">
            <Form.Label>Parent Category</Form.Label>
            <Form.Select
              name="parentCategory"
              value={formData.parentCategory}
              onChange={handleChange}
            >
              <option value="">Select category...</option>
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

      <FormField
        controlId="description"
        name="description"
        label="Description"
        type="textarea"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <FormField
        controlId="categoryImage"
        name="categoryImage"
        label="Category Image"
        type="file"
        refValue={fileInputRef}
        onChange={handleFileChange}
      />

      <Button variant="primary mt-3" type="submit">
        Add Category
      </Button>
    </Form>
  );
}

export default CategoryAddForm;
