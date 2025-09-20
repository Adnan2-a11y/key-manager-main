import MainLayout from "../../components/layout/MainLayout";
import UserAddForm from "./UserAddForm";

function AddUser() {
  return (
    <MainLayout>
      <div className="container">
        <h1>Add User</h1>
        <UserAddForm />
      </div>
    </MainLayout>
  );
}

export default AddUser;
