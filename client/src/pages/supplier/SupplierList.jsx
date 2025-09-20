/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";
import { X, FilePenLine } from "lucide-react";

function SupplierList({ suppliers, onDelete, onEdit }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone Number</th>
          <th>Website</th>
          <th>Payment Method</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supplier, index) => (
          <tr key={index}>
            <td>{supplier.name}</td>
            <td>{supplier.email ? supplier.email : "-"}</td>
            <td>{supplier.phoneNumber ? supplier.phoneNumber : "-"}</td>
            <td>{supplier.website ? supplier.website : "-"}</td>
            <td>{supplier.paymentMethod ? supplier.paymentMethod : "-"}</td>
            <td>
              <FilePenLine
                size={20}
                color="#2db1d2"
                className="action-button"
                onClick={() => onEdit(supplier)}
              />
              <X
                size={20}
                color="#fc0303"
                className="action-button"
                onClick={() => onDelete(supplier._id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default SupplierList;
