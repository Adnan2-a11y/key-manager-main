import { Modal } from "react-bootstrap";
import EditProductForm from "./EditProductForm";

/* eslint-disable react/prop-types */
const ViewProductModal = ({ show,
    hide,
    productId }) => {
    return (
        <Modal show={show} onHide={hide} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Product Update</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <EditProductForm
                productId={productId}
                onClose={hide}
                />
          </Modal.Body>
        </Modal>
    );
}

export default ViewProductModal;