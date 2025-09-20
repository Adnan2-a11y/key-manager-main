import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import SupplierAddForm from "./SupplierAddForm";
import SupplierEditForm from "./SupplierEditForm";
import "../../assets/css/supplier.css";
import Cookies from "js-cookie";
import axios from "axios";

import API_CONFIG from "../../components/constant/apiConstants";
import SupplierList from "./SupplierList";
import Swal from "sweetalert2";
const BASE_URL = API_CONFIG.API_ENDPOINT;

const fetchSuppliers = async (setSuppliers, token) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const res = await axios.get(`${BASE_URL}/api/suppliers/all`, {
      headers: headers,
    });

    setSuppliers(res.data.suppliers); // Assuming the response data is an array of suppliers
  } catch (error) {
    console.error("Error fetching suppliers:", error);
  }
};

function Supplier() {
  const token = Cookies.get("accessToken");
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierAddForm, setShowSupplierAddForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [showSupplierEditForm, setShowSupplierEditForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);

  const handleEditForm = (supplier) => {
    setEditSupplier(supplier);
    setShowSupplierEditForm(true);
  };

  const handleEditSupplier = async (editedSupplier) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const res = await axios.patch(
        `${BASE_URL}/api/suppliers/edit?id=${editedSupplier._id}`,
        editedSupplier,
        {
          headers: headers,
        }
      );
      console.log(res.data);
      setShowSupplierEditForm(false);
      fetchSuppliers(setSuppliers, token);
    } catch (err) {
      console.error("Error editing supplier:", err);
    }
  };

  const handleCloseForm = () => {
    setShowSupplierAddForm(false);
  };

  useEffect(() => {
    fetchSuppliers(setSuppliers, token);
  }, [token]);

  const addSupplier = async (newSupplier) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log("newSupplier: ", newSupplier);

    const res = await axios.post(`${BASE_URL}/api/suppliers/add`, newSupplier, {
      headers: headers,
    });

    fetchSuppliers(setSuppliers, token);

    setMsg(res.data.message);
  };

  const handleDelete = async (supplierId) => {
    try {

      Swal.fire({
        title: "Are you sure?",
        text: "Are you sure that you want to delete this supplier?",
        icon: "warning",
        confirmButtonText: "Yes, Delete",
        showCancelButton: true,
        draggable: true,
      }).then(async (willDelete) => {
        if (willDelete.isConfirmed) {
          const header = {
            Authorization: `Bearer ${token}`,
          };
    
          // Send a DELETE request to the backend API to delete the supplier
          await axios.delete(`${BASE_URL}/api/suppliers/delete?id=${supplierId}`, {
            headers: header,
          });
    
          // After successful deletion, update the suppliers list by refetching the data
          fetchSuppliers(setSuppliers, token);
        }
      })
      
    } catch (err) {
      console.error("Error deleting supplier:", err);
      // You can handle errors as per your application requirements
      setMsg("Error deleting supplier");
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="d-flex  align-items-center">
          <h1>Suppliers</h1>
          <Button
            onClick={() => setShowSupplierAddForm(true)}
            variant="primary"
            size="sm"
            className="ms-4 mt-1"
          >
            Add Supplier
          </Button>
        </div>
        <SupplierList
          suppliers={suppliers}
          onDelete={handleDelete}
          onEdit={handleEditForm}
        />

        <SupplierAddForm
          show={showSupplierAddForm}
          onHide={handleCloseForm}
          onSupplierAdd={addSupplier}
          msg={msg}
          setMsg={setMsg}
        />

        <SupplierEditForm
          show={showSupplierEditForm}
          onHide={() => setShowSupplierEditForm(false)}
          onEditSupplier={handleEditSupplier} // Pass the editSupplier to the onSupplierEdit function
          msg={msg}
          setMsg={setMsg}
          supplier={editSupplier}
        />
      </div>
    </MainLayout>
  );
}

export default Supplier;
