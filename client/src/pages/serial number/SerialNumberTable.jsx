/* eslint-disable react/prop-types */
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { Eye, EyeOff, X, FilePenLine } from "lucide-react";
import { useEffect, useState } from "react";
import "../../assets/css/serialNumber.css";
import { LuCopy } from "react-icons/lu";
import copy from 'copy-to-clipboard';
import { fetchProducts } from "../../services/productServices";
import { useStore } from "../../store/store";
import DropdownFilter from "../../components/common/DropdownFilter";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainPagination from "../../components/common/MainPagination";
import moment from 'moment';

function SerialNumberTable({ serialNumbers, pageCount, onEdit, onDelete, totalCount }) {
  const [ showKey, setShowKey ] = useState({});
  const [ copiedId, setCopiedId ] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [ limit, setLimit ] = useState(10);
  const { setProducts } = useStore();
  const [searchParams] = useSearchParams();
  const [ currentPage, setCurrentPage ] = useState(1);
  const navigate = useNavigate();

  const toggleShowKey = (id) => {
    setShowKey({ ...showKey, [id]: !showKey[id] });
  };

  useEffect(() =>{
      const page = searchParams.get("page") || 1;
      setCurrentPage(page);
      const limit = searchParams.get("limit") || 10;
      setLimit(limit);
    }, [searchParams, setLimit]);

  useEffect(() => {

    (async () => {
      const res = await fetchProducts({ pageLimit: 0 });
      if (res.success){
        const filterData = res.products.map((product) => {
          return {
            _id: product._id,
            name: product.productName,
          };
        });
        setProducts(filterData);
      }
    })();
  }, [setProducts]);

  const handleDropdownChange = (productId) => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.set("productId", productId);
    updatedParams.set("page", 1);
    navigate(`?${updatedParams.toString()}`);
  };

  const resetFilter = () => {
    const updatedParams = new URLSearchParams(searchParams);
    updatedParams.delete("productId");
    updatedParams.delete("search");
    updatedParams.set("page", 1);
    navigate(`?${updatedParams.toString()}`);
  };

  return (
    
    <>
    <Container>
      <Row>
        <Col md={8} className="mb-3">
        
        <DropdownFilter 
          onChange={handleDropdownChange}
        />
        </Col>
        <Col md={{ span: 4 }} className="mb-3">
          <div className="d-flex gap-2 justify-content-end">
            <Button variant="danger" className="float-end" onClick={resetFilter}>Reset Filter</Button>
          </div>
        </Col>
      </Row>
    </Container>
    <Table responsive striped bordered hover className="main-table">
      <thead>
        <tr>
          <th>ID</th>
          <th className="th-key">Key</th>
          <th>Product</th>
          <th>Invoice System/Remote</th>
          <th>Customer</th>
          <th className="text-nowrap">Date</th>
          <th className="text-nowrap">Purchase Date</th>
          <th className="text-nowrap">Warranty Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {serialNumbers.map((serialNumber) => (
          <tr key={serialNumber._id} data-id={serialNumber._id}>
            <td>
              {serialNumber.serialNumberId}
            </td>
            <td className="text-nowrap" style={{"minWidth": "150px"}}>
              <div className="key-wrapper pb-3">

                <div className="key-value">
                  {showKey[serialNumber._id] ? serialNumber.serialNumber : ""}
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  {showKey[serialNumber._id] ? (
                    <EyeOff
                      className="icon"
                      size={20}
                      onClick={() => toggleShowKey(serialNumber._id)}
                    />
                  ) : (
                    <Eye
                      className="icon"
                      size={20}
                      onClick={() => toggleShowKey(serialNumber._id)}
                    />
                  )}
                  <LuCopy
                    className="icon"
                    size={20}
                    onClick={() => copy(serialNumber.serialNumber, {
                      debug: true,
                      message: "Copy to clipboard: #{key}, Enter", 
                      format: "text/plain",
                      onCopy: (clipboardData) => {
                        setCopiedId(serialNumber._id);
                        return clipboardData
                      }
                    })}
                  />
                </div>
                {copiedId === serialNumber._id && <span className="copy-notice w-100 d-flex justify-content-center" style={{ color: "green" }}>✅ Copied!</span>}
              </div>
            </td>
            <td className="text-start text-nowrap">{serialNumber.product.productName || "-"}</td>
            <td>{
            (serialNumber?.transaction?.transactionId || serialNumber?.transaction?.invoice_no) 
            ? serialNumber?.transaction?.transactionId + "/" + serialNumber?.transaction?.invoice_no 
            : "-"
            }</td>
            <td>
              <div>
                <div>
                    {(serialNumber?.customer && serialNumber?.customer?.first_name && serialNumber?.customer?.last_name && serialNumber?.customer?.first_name + " " + serialNumber?.customer?.last_name) || "-"}
                </div>
                {serialNumber?.customer && <div>{serialNumber?.customer?.email}</div>}
                {serialNumber?.customer && <div>{serialNumber?.site?.name}</div>}
              </div>
              </td>
            <td>{(serialNumber.updatedAt ? moment(serialNumber.updatedAt).format('DD/MM/YYYY HH:mm a') :  "-")}</td>
            <td>{(serialNumber.purchaseDate ? moment(serialNumber.purchaseDate).format('DD/MM/YYYY') :  "-")}</td>
            <td>{(serialNumber.warrantyDate ? moment(serialNumber.warrantyDate).format('DD/MM/YYYY') :  "-")}</td>
            <td>{serialNumber.status.charAt(0).toUpperCase() + serialNumber.status.slice(1) || "-"}</td>
            <td>
              <FilePenLine
                size={20}
                color="#2db1d2"
                className="action-button"
                onClick={() => onEdit(serialNumber._id)}
              />
              <X
                size={20}
                color="#fc0303"
                className="action-button"
                onClick={() => onDelete(serialNumber._id)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    {totalCount && (
      <Container className="mb-4 mt-4">
      <Row>
        <Col md={8} className="sm:mb-3">
          {currentPage && <MainPagination totalPages={pageCount} currentPage={currentPage} />}
        </Col>
        <Col md={4} className="sm:mb-3 d-flex align-items-center justify-content-end">
          <p className="text-end m-0">Total {totalCount} keys found</p>
        </Col>
        </Row>
      </Container>
    )}
    </>
  );
}


export default SerialNumberTable;
