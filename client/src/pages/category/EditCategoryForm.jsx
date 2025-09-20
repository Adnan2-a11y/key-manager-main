/* eslint-disable react/prop-types */
import { Modal, Form, Button, Row, Col, Stack } from "react-bootstrap";
import FormField from "../../components/common/form/FormField";
import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

function EditCategoryForm({ show, onHide, categories, editCategory, onCategoryEdited }) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    parentCategory: "",
    description: "",
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editCategory) {
      setFormData({
        id: editCategory._id || "",
        name: editCategory.name || "",
        slug: editCategory.slug || "",
        parenteditCategory: editCategory.parentCategory || "",
        description: editCategory.description || "",
      });
    }
  }, [editCategory]);

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await onCategoryEdited(formData);
    if(response.data.success) {
      setFormData({
        name: "",
        slug: "",
        parentCategory: "",
        description: "",
      });    
      onHide();
      setTimeout(() => {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
        });
      }, 300);
      
    }else{
      onHide();
      setTimeout(() => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message,
        });
      }, 300);
      
    }

    fileInputRef.current.value = null;
    
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Edit Category
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
              <Form.Group controlId="category">
                <Form.Label>Parent Category</Form.Label>
                <Form.Select
                  name="parentCategory"
                  defaultValue={formData?.parenteditCategory?._id || ""}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category._id}>
                      {category.level ? Array.from({ length: category.level }).map(() => "—").join("") : ""}
                      {" "}
                      {category ? category.name : ""}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
            <FormField
              controlId="description"
              name="description"
              label="Description"
              type="textarea"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />
            </Col>
          </Row>
          <Row>
            <Col>
            <FormField
              controlId="categoryImage"
              name="categoryImage"
              label="Category Image"
              type="file"
              refValue={fileInputRef}
              onChange={handleFileChange}
            />
            </Col>
          </Row>         
          
          <hr />
          <Stack direction="horizontal" gap={2} className="mb-3">
            <Button variant="danger" onClick={onHide}>
              Close
            </Button>
            <Button variant="primary" type="submit" className="ms-auto">
              Update
            </Button>          
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditCategoryForm;
