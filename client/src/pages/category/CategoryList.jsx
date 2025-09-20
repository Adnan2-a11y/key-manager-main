/* eslint-disable react/prop-types */
import { X, FilePenLine } from "lucide-react";
import { Table } from "react-bootstrap";

import API_CONFIG from "../../components/constant/apiConstants";
const BASE_URL = API_CONFIG.API_ENDPOINT;

function CategoryList({ categories, onDelete, onEdit }) {
  return (
    <div className="mt-3">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>S/L</th>
            <th>Image</th>
            <th className="text-start">Name</th>
            <th className="text-start">Parent</th>
            <th>Description</th>
            <th>Slug</th>
            <th>Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => {
            return (
              <tr key={category._id}>
                <td>{index + 1}</td>
                <td>
                  {category.thumbnail && (
                    <img
                      src={`${BASE_URL}/api/${category.thumbnail.replace(
                        /\\/g,
                        "/"
                      )}`}
                      alt={category.name}
                      style={{ width: 50 }}
                    />
                  )}
                </td>
                <td className="text-start">
                  {category.level ? Array.from({ length: category.level }).map(() => "—").join("") : ""}
                  {" "}
                  {category ? category.name : ""}
                </td>
                <td className="text-start">{category.parentCategory ? category.parentCategory.name : ""}</td>
                <td>{category ? category.description : ""}</td>
                <td>{category ? category.slug : "-"}</td>
                <td>{category ? category.productCount : ""}</td>
                <td>
                  <FilePenLine
                    size={20}
                    color="#2db1d2"
                    className="action-button"
                    onClick={() => onEdit(category)}
                  />
                  <X
                    size={20}
                    color="#fc0303"
                    className="action-button"
                    onClick={() => onDelete(category._id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default CategoryList;
