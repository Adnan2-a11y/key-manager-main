/* eslint-disable react/prop-types */
import { Table } from "react-bootstrap";

function Address({ handleChange, editedFields }) {
  return (
    <Table responsive="sm">
      <thead>
        <tr>
          <th className="wrapper_title" colSpan={2}>
            Address
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Town/City</td>
          <td>
            <input
              type="text"
              value={editedFields.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
            />
          </td>
        </tr>
        <tr>
          <td>Post</td>
          <td>
            <input
              type="text"
              value={editedFields.post}
              onChange={(e) => handleChange("post", e.target.value)}
              placeholder="Post"
            />
          </td>
        </tr>

        <tr>
          <td>Country</td>
          <td>
            <input
              type="text"
              value={editedFields.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="Country"
            />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}

export default Address;
