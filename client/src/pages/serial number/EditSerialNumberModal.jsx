/* eslint-disable react/prop-types */
import { Modal } from "react-bootstrap";

import { useEffect, useState } from "react";
import axios from "axios";
import API_CONFIG from "../../components/constant/apiConstants";
import Cookies from "js-cookie";
import SerialNumberFormEdit from "./SerialNumberFormEdit";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function EditSerialNumberModal({
  show,
  hide,
  serialNumber,
}) {
  const [ editableKey, setEditableKey ] = useState({});
  const token = Cookies.get("accessToken");


  useEffect(() => {
    (async function () {
      if (serialNumber) {
        const headers = {
          Authorization: `Bearer ${token}`,
        }
        const res = await axios.get(`${BASE_URL}/api/serial-numbers/view/${serialNumber}`, { headers: headers });  
        if (res.data) {
          setEditableKey(res.data);
        }
      }
    })()
  }, [serialNumber, token]);


  return (
    <Modal show={show} onHide={hide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Serial Number</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <SerialNumberFormEdit initialValues={editableKey} onClose={hide} />
      </Modal.Body>
    </Modal>
  );
}

export default EditSerialNumberModal;
