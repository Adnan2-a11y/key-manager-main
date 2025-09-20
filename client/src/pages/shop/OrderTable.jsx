/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { X } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { Col, Container, Row, Table, Form } from "react-bootstrap";
import { FiEye } from "react-icons/fi";
import { TfiNewWindow } from "react-icons/tfi";

import { useNavigate, useSearchParams } from "react-router-dom";
import MainPagination from "../../components/common/MainPagination";
import OrderFilters from "./OrderFilters";
import { LogViewer } from "../../utils/helper";


function OrderTable({data, totalCount, pageCount, onEdit, onDelete, onSetLimit}) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ limit, setLimit ] = useState(10);
    const [ searchQuery, setSearchQuery ] = useState("");
    const [ selectedCategory, setSelectedCategory ] = useState("");

    useEffect(() =>{
        const page = searchParams.get("page") || 1;
        setCurrentPage(page);
        const search = searchParams.get("search") || "";
        setSearchQuery(search);
        const cat = searchParams.get("cat") || "";
        setSelectedCategory(cat);
        const limit = searchParams.get("limit") || 10;
        setLimit(limit);
        onSetLimit(limit);
      }, [onSetLimit, searchParams]);

    const handleLimitSet = (e) => {
        const updatedParams = new URLSearchParams(searchParams);
        updatedParams.set("limit", e.target.value);
        navigate(`?${updatedParams.toString()}`);
    };

    return (
        <>
        <OrderFilters />
        <Table striped bordered hover responsive>
            <thead>
                <tr>
                    <th>#</th>
                    <th className="text-start">Order</th>
                    <th className="text-start">Date</th>
                    <th className="text-start">Site</th>
                    <th className="text-start">Payment</th>
                    <th className="text-start">Status</th>
                    <th className="text-end">Total</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {data && data.map((order, index) => 
                    <tr key={order._id} onClick={() => LogViewer(order)}>
                        <td> {(limit * (currentPage - 1)) + index + 1}</td>
                        <td className="text-start">
                            {order?.customer?.first_name && order?.customer?.last_name && 
                                <p className="m-0">{order?.customer?.first_name + " " + order?.customer?.last_name}</p>
                            }
                            <p className="m-0">{order?.customer?.email}</p>
                        </td>
                        <td className="text-start">{moment(order.transaction_date).fromNow()}<br/><small style={{opacity: 0.5}}>{moment(order.transaction_date).format("L LTS")}</small></td>
                        <td className="text-start">
                        <TfiNewWindow /> <a href={"https://" + order?.site?.name + "/wp-admin/post.php?post=" + order.invoice_no + "&action=edit"} title={"Order #" + order.invoice_no} target="_blank" rel="noopener noreferrer">
                            {order.site.name}
                            </a>
                        </td>
                        <td className="text-start text-wrap" style={{maxWidth: "200px"}}>
                            <small>
                                {order?.payment_method_title && order?.payment_method_title !== '' ? 'via ' + order?.payment_method_title : '' }
                                {' '}
                                {order?.payment_method && order?.payment_method !== '' ? 'by ' + order?.payment_method : '' }
                            </small></td>
                        
                        <td className="text-start">{order.transactionStatus.charAt(0).toUpperCase() + order.transactionStatus.slice(1)}</td>
                        <td className="text-end">
                            <div className="d-flex flex-column">
                                <small>{order.currency} {order.total}</small>
                            </div>
                        </td>
                        <td>
                            <FiEye
                                size={20}
                                color="#2db1d2"
                                className="action-button"
                                onClick={() => onEdit(order.transactionId)}
                                />
                            <X
                                size={20}
                                color="#fc0303"
                                className="action-button"
                                onClick={() => onDelete(order.transactionId)}
                                />
                        
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>

        {/* Pagination */}
        {totalCount > 0 && (
            <Container className="mb-4">
            <Row>
                <Col xs lg="1">
                    <Form.Select aria-label="Display per page" onChange={handleLimitSet} value={limit}>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </Form.Select>
                </Col>
                <Col md={7} className="sm:mb-3">
                    {currentPage && <MainPagination totalPages={pageCount} currentPage={currentPage} />}
                </Col>
                <Col md={4} className="sm:mb-3">
                    <p className="text-end">Total {totalCount} products found</p>
                </Col>
            </Row>
            </Container>
        )}
        </>
    );
}

export default OrderTable