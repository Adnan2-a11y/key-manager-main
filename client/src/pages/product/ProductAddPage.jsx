import MainLayout from "../../components/layout/MainLayout";
import ProductAddForm from "./ProductAddForm";
import "../../assets/css/productAddPage.css";

function ProductAddPage() {
  return (
    <MainLayout>
      <section className="container">
        <h1>Add New Product</h1>
        <div className="form-container">
          <ProductAddForm />
        </div>
      </section>
    </MainLayout>
  );
}

export default ProductAddPage;
