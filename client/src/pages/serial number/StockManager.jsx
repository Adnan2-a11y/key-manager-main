import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import "../../assets/css/stockManager.css";
import { Col, Container, Form, Row, Table } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { useStore } from "../../store/store";
import TableSkeleton from "../../components/common/skeleton/TableSkeleton";
import ProductDropdownFilter from "../../components/common/ProductDropdownFilter";
import SearchForm from "../../components/common/SearchForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchProductsStock } from "../../services/productServices";
import { fetchCategories } from "../../services/categoryServices";
import MainPagination from "../../components/common/MainPagination";

function StockManager() {
  const { categories, setCategories } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [ limit, setLimit ] = useState(10);

  const [ selectedCategory, setSelectedCategory ] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ productsCount, setProductsCount] = useState(0);
  const [ pageCount, setPageCount] = useState(0);
  const [ searchQuery, setSearchQuery ] = useState("");

  useEffect(() => {
      setCurrentPage(searchParams.get("page") || 1);
      setLimit(searchParams.get("limit") || 10);
      setSelectedCategory(searchParams.get("cat") || "");
      setSearchQuery(searchParams.get("search") || "");
    }, [searchParams]);

  
  useEffect(() => {
    (async () => {
      const data = await fetchProductsStock({currentPage, pageLimit: limit, category: selectedCategory, searchQuery});
      console.log("sadasd", data);
      if(data.success){
        setProducts(data.products);

        setPageCount(Math.ceil(data.counts / limit));
        setProductsCount(data.counts);
      }else{
        setProducts([]);
        setPageCount(0);
        setProductsCount(0);
      }

      const cats = await fetchCategories();
      setCategories(cats);

    })()
  }, [currentPage, setProducts, limit, selectedCategory, setCategories, searchQuery]);

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
    <MainLayout>
      <div className="header d-flex gap-3">
        <h1>Stock Manager</h1>
      </div>
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
            variant="success"
            placeholder="Search by Product Name"
            onSubmit={handleSearch}
          />
        </Col>
      </Row>
    </Container>
      <div className="table-responsive">
        { products.length > 0 ?
          (<>
            <Table striped bordered hover variant="dark">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Available</th>
                  <th>Sold</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => {

                  const txtColor = item.availableKeys > 5 ? 'text-success' : (item.availableKeys === 0 ? 'text-danger': 'text-warning');

                  return (
                    <tr key={index.toString()} className={`}`}>
                      <td className={`text-start`}>
                        <a href={`/serial-numbers?productId=${item._id}&page=1`} target="_blank" className={`product-link ${txtColor}`}>{item.productName}</a>
                      </td>
                      <td className={txtColor}>{item.availableKeys}</td>
                      <td>{item.soldKeys}</td>
                      <td>
                        <div className="action d-flex justify-content-center">
                          <a className="btn btn-primary btn-sm ms-2" target="_blank" href={`/serial-numbers?productId=${item._id}&page=1`}><FaEye /></a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            {productsCount > 0 && (
                <Container className="mb-4">
                <Row>
                <Col xs lg="1">
                  <Form.Select aria-label="Display per page" onChange={(e) => setLimit(e.target.value)}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Form.Select>
                </Col>
                  <Col md={8} className="sm:mb-3">
                    {currentPage && <MainPagination totalPages={pageCount} currentPage={currentPage} />}
                  </Col>
                  <Col md={3} className="sm:mb-3">
                    <p className="text-end">Total {productsCount} products found</p>
                  </Col>
                  </Row>
                </Container>
              )}
          </>)
          : <TableSkeleton count={15} />
        }
      </div>
    </MainLayout>
  );
}

export default StockManager;
