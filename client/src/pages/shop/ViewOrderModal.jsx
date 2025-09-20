/* eslint-disable react/prop-types */
import { Modal } from "react-bootstrap";
import OrderDetailsView from "./OrderDetailsView";

const ViewOrderModal = ({
    show,
    hide,
    transactionId
}) => {

    return (
        <Modal show={show} onHide={hide} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Order #{transactionId} details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <OrderDetailsView transactionId={transactionId} />
          </Modal.Body>
        </Modal>
      );
}

export default ViewOrderModal;