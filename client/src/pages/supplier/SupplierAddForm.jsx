/* eslint-disable react/prop-types */
import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

// eslint-disable-next-line no-unused-vars
function SupplierAddForm({ show, onHide, onSupplierAdd, msg, setMsg }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    website: "",
    paymentMethod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSupplierAdd(formData);
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        website: "",
        paymentMethod: "",
      });
      onHide();
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
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
          Add Supplier
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formName">
            <Form.Label>Supplier Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter supplier name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEmail" className="form-group">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formPhoneNumber" className="form-group">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="number"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formWebsite" className="form-group">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="url"
              name="website"
              placeholder="Enter website"
              value={formData.website}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formPaymentMethod" className="form-group">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control
              as="select"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="">Select payment method</option>
              <option value="Paypal">Paypal</option>
              <option value="Payoneer">Payoneer</option>
              <option value="Wise">Wise</option>
              <option value="Other">Other</option>
              {/* Add more payment methods as needed */}
            </Form.Control>
          </Form.Group>
        </Form>
        {msg ? <p>{msg}</p> : ""}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit}>Add</Button>
        <Button variant="danger" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SupplierAddForm;
