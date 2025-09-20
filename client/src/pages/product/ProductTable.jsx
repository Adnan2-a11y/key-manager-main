/* eslint-disable react/prop-types */
import { FaImage } from "react-icons/fa";
import { X, FilePenLine } from "lucide-react";
import { Col, Container, Row, Table } from "react-bootstrap";
import moment from "moment";

import { useEffect, useState } from "react";
import MainPagination from "../../components/common/MainPagination";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchForm from "../../components/common/SearchForm";
import API_CONFIG from "../../components/constant/apiConstants";
import { useStore } from "../../store/store";
import ProductDropdownFilter from "../../components/common/ProductDropdownFilter";
const BASE_URL = API_CONFIG.API_ENDPOINT;

function ProductTable({ products, productsCount, pageCount, onEdit, onDelete }) {
  const [ selectedCategory, setSelectedCategory ] = useState("");
  const [ searchQuery, setSearchQuery ] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [ limit, setLimit ] = useState(10);
  const [ currentPage, setCurrentPage ] = useState(1);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { categories } = useStore();


  useEffect(() =>{
    const page = searchParams.get("page") || 1;
    setCurrentPage(page);
    const limit = searchParams.get("limit") || 10;
    setLimit(limit);
    const search = searchParams.get("search") || "";
    setSearchQuery(search);
    const cat = searchParams.get("cat") || "";
    setSelectedCategory(cat);
  }, [searchParams, setLimit]);

  const handleDropdownChange = (e) => {  
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set("cat", e.target.value);
    navigate(`?${updatedParams.toString()}`);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();  
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set("search", e.target[0].value);
    navigate(`?${updatedParams.toString()}`);
  };

  return (
    <>
    
    <Container className="mb-4">
      <Row>
        <Col md={4} className="sm:mb-3">
        
        <ProductDropdownFilter 
          data={categories}
          value={selectedCategory}
          label="Filter by Category"
          onChange={handleDropdownChange}
        />
        </Col>
        <Col md={{ span: 4, offset: 4 }}>
          <SearchForm
            label="Search"
            value={searchQuery}
            variant="success"
            placeholder="Search by Product Name"
            onSubmit={handleSearch}
          />
        </Col>
      </Row>
    </Container>
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>
            <FaImage />
          </th>
          <th>Name</th>
          <th>Stock</th>
          <th colSpan={3} style={{paddingTop: "0px", paddingBottom: "7px"}}>
          <Table borderless className="mb-0">
              <thead>
                <tr>
                  <th colSpan={3} style={{minWidth: "100px", border: "none",}} className="p-0">Price</th>
                </tr>
                <tr>
                  <th style={{minWidth: "70px"}} className="p-0">Purchase</th>
                  <th style={{minWidth: "60px"}} className="p-0">Regular</th>
                  <th style={{minWidth: "40px"}} className="p-0">Sale</th>
                </tr>
              </thead>
          </Table>
          </th>
          <th>Categories</th>
          <th>Publish Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {products.length > 0 ? (
            products.map((product) => (
              <tr key={product._id} data-id={product._id}>
                <td>{product ? product.productId : ""}</td>
                <td>
                  {(product.productImg === "null" || product.productImg === null || product.productImg === "")  ? (
                    <FaImage size={30} color="#ccc" />                      
                  ) : (
                    <img
                      src={`${BASE_URL}/api/${product.productImg}`}
                      alt={product.productName}
                      style={{ width: "70px", height: "50px" }}
                    />
                  )}
                </td>
                <td className="text-start">{product ? product.productName : ""}</td>
                <td>{product && product.availableKeys ? product.availableKeys : "0"}</td>
                <td style={{minWidth: "70px"}}>{product && product.purchasePrice ? `$${product.purchasePrice}` : "0"}</td>
                <td style={{minWidth: "50px"}}>{product && product.sellPrice ? `$${product.sellPrice}` : "0"}</td>
                <td style={{minWidth: "40px"}}>{product && product.sellPrice ? `$${product.sellPrice}` : "0"}</td>
                <td>{product && product.category ? product.category.name : ""}</td>
                <td>
                  {product
                    ? moment(product.createdAt).format("DD MMM YYYY")
                    : ""}
                </td>
                <td>
                  <FilePenLine
                    size={20}
                    color="#2db1d2"
                    className="action-button"
                    onClick={() => onEdit(product._id)}
                  />
                  <X
                    size={20}
                    color="#fc0303"
                    className="action-button"
                    onClick={() => onDelete(product._id)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10}>No products found</td>
            </tr>
          )          
        }
      </tbody>
    </Table>
    {productsCount > 0 && (
      <Container className="mb-4">
      <Row>
        <Col md={8} className="sm:mb-3">
          {currentPage && <MainPagination totalPages={pageCount} currentPage={currentPage} />}
        </Col>
        <Col md={4} className="sm:mb-3">
          <p className="text-end">Total {productsCount} products found</p>
        </Col>
        </Row>
      </Container>
    )}
    </>
  );
}

export default ProductTable;
