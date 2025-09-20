/* eslint-disable react/prop-types */
import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";

const SupplierEditForm = ({ show, onHide, onEditSupplier, supplier }) => {
  const [editedSupplier, setEditedSupplier] = useState({});
  useEffect(() => {
    if (supplier) {
      setEditedSupplier(supplier);
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSupplier({ ...editedSupplier, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditSupplier(editedSupplier);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Supplier</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formName">
            <Form.Label>Supplier Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter supplier name"
              name="name"
              value={editedSupplier.name}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formEmail" className="form-group">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter email"
              value={editedSupplier.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formPhoneNumber" className="form-group">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="number"
              name="phoneNumber"
              placeholder="Enter phone number"
              value={editedSupplier.phoneNumber}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formWebsite" className="form-group">
            <Form.Label>Website</Form.Label>
            <Form.Control
              type="url"
              name="website"
              placeholder="Enter website"
              value={editedSupplier.website}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formPaymentMethod" className="form-group">
            <Form.Label>Payment Method</Form.Label>
            <Form.Control
              as="select"
              name="paymentMethod"
              value={editedSupplier.paymentMethod}
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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit}>Save</Button>
        <Button variant="danger" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SupplierEditForm;
