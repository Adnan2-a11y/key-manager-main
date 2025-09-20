import { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import Table from "react-bootstrap/Table";
import "../../assets/css/userPage.css";
import { X, FilePenLine } from "lucide-react";
import Cookies from "js-cookie";

import API_CONFIG from "../../components/constant/apiConstants";
import Swal from "sweetalert2";

const BASE_URL = API_CONFIG.API_ENDPOINT;

function UserPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user/all`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    console.log("userId:", userId)
  };

  const handleDelete = async (userId) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "Are you sure that you want to delete this user?",
        icon: "warning",
        confirmButtonText: "Yes, Delete",
        showCancelButton: true,
        draggable: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`${BASE_URL}/api/user/delete?id=${userId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          });
          // Remove the deleted user from the local state
          setUsers(users.filter((user) => user._id !== userId));
        }
      })
      
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <MainLayout>
      <div className="row mt-3 main_container_user_table">
        <div className="col-md-12 mt-3">
          <Table responsive="md">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.userId}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.profile && user.profile.fullName
                      ? user.profile.fullName
                      : "-"}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <FilePenLine
                      size={20}
                      color="#2db1d2"
                      className="action-button"
                      onClick={() => handleEdit(user._id)}
                    />
                    <X
                      size={20}
                      color="#fc0303"
                      className="action-button"
                      onClick={() => handleDelete(user._id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}

export default UserPage;
