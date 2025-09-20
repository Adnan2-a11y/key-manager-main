/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";

function PersonalInformation({ user, editedFields, handleChange }) {
  return (
    <Table responsive="sm">
      <thead>
        <tr>
          <th className="wrapper_title" colSpan={3}>
            Personal Information
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Full Name</td>
          <td>
            <input
              type="text"
              value={editedFields.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </td>
        </tr>
        <tr>
          <td>Username</td>
          <td>{user && user.username}</td>
        </tr>

        <tr>
          <td>Gender</td>
          <td>
            <select
              id="gender"
              value={editedFields.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </td>
        </tr>

        <tr>
          <td>Birthdate</td>
          <td>
            <input
              type="date"
              value={editedFields.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </td>
        </tr>

        <tr>
          <td>Role</td>
          <td>{user && user.role}</td>
        </tr>
        {/* Add more rows as needed */}
      </tbody>
    </Table>
  );
}

export default PersonalInformation;
