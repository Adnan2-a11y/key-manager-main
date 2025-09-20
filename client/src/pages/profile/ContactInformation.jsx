/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";
function ContactInformation({ user, editedFields, handleChange }) {
  return (
    <Table responsive="sm">
      <thead>
        <tr>
          <th className="wrapper_title" colSpan={2}>
            Contact Details
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Phone Number</td>
          <td>
            <input
              type="number"
              value={editedFields.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="+1 (XXX) XXX XXXX"
            />
          </td>
        </tr>
        <tr>
          <td>Email</td>
          <td>{user && user.email}</td>
        </tr>
      </tbody>
    </Table>
  );
}

export default ContactInformation;
