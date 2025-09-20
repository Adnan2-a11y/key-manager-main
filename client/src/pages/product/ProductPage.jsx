import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

import "../../assets/css/productPage.css";
import MainLayout from "../../components/layout/MainLayout";
import ProductTable from "./ProductTable";

import API_CONFIG from "../../components/constant/apiConstants";
import { useStore } from "../../store/store";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../../services/productServices";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import ViewProductModal from "./ViewProductModal";
import { toast, Toaster } from "sonner";
import Swal from "sweetalert2";
import { fetchCategories } from "../../services/categoryServices";
import { fetchRoles } from "../../services/roleServices";
const BASE_URL = API_CONFIG.API_ENDPOINT;

function ProductPage() {
  const { products, setProducts, showEditModal, setShowEditModal, noticia, setCategories, setRoles } = useStore();
  const [ editProductId, setEditProductId ] = useState(null);
  const [ searchParams ] = useSearchParams();
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ pageLimit, setLimit ] = useState(10);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ category, setCategory ] = useState("");
  const [ productsCount, setProductsCount] = useState(0);
  const [ pageCount, setPageCount] = useState(0);

  useEffect(() => {
    setCurrentPage(searchParams.get("page") || 1);
    setLimit(searchParams.get("limit") || 10);
    setSearchQuery(searchParams.get("search") || "");
    setCategory(searchParams.get("cat") || "");
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const data = await fetchProducts({currentPage, pageLimit, category, searchQuery});
      if(data.success){
        setProducts(data.products);

        setPageCount(Math.ceil(data.counts / pageLimit));
        setProductsCount(data.counts);
      }else{
        setProducts([]);
        setPageCount(0);
        setProductsCount(0);
      }

      const cats = await fetchCategories();
      setCategories(cats);

      const roles = await fetchRoles();
      setRoles(roles);
    })()
  }, [currentPage, pageLimit, searchQuery, setProducts, category, setCategories, setRoles]);

  useEffect(() => {
    if (noticia.message) {
      toast.success(noticia.message);
    }
  }, [noticia]);

  const handleEdit = (productId) => {
    setEditProductId(productId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditProductId(null);
  };

  const handleDelete = async (productId) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "Are you sure that you want to delete this product?",
        icon: "warning",
        confirmButtonText: "Yes, Delete",
        showCancelButton: true,
        draggable: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const token = Cookies.get("accessToken");
          const headers = {
            Authorization: `Bearer ${token}`,
          };
    
          // Make DELETE request to delete the product
          await axios.delete(`${BASE_URL}/api/product/delete?id=${productId}`, {
            headers,
          });

          // Filter out the deleted product from the products array
          const updatedProducts = products.filter(
            (product) => product._id !== productId
          );

          // Update the products state with the filtered array
          setProducts(updatedProducts);
        }
      });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <MainLayout>
      <div className="header d-flex gap-3">
        <h1>Products</h1>
        <div className="d-flex align-items-center">
          <Button variant="primary" size="sm" as="a" href="/product/add">
            <FaPlus />
            {" "}
            Add New Product
          </Button>
        </div>
      </div>

      <div className="row mt-3 main_container_product_table">
        <ProductTable
          products={products}
          productsCount={productsCount}
          pageCount={pageCount}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ViewProductModal show={showEditModal} hide={handleCloseEditModal} productId={editProductId}/>
      <Toaster richColors position="top-right" />
    </MainLayout>
  );
}

export default ProductPage;
