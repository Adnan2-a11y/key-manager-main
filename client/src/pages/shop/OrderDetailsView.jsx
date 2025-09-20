/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { getOrderDetails, updateOrderStatus } from "../../services/orderServices";
import { Alert, Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import moment from "moment";
import { useStore } from "../../store/store";
import { fetchSuppliers } from "../../services/productServices";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { CgArrowTopRightO } from "react-icons/cg";

const OrderDetailsView = ({transactionId, id}) => {

    const [ transaction, setTransaction ] = useState({});
    const { suppliers, setSuppliers } = useStore();

    useEffect(() => {
        (async() => {
            if(transactionId || id){
             const supplierData = await fetchSuppliers();
            //  console.log(supplierData);
             if (supplierData.suppliers.length> 0){
                setSuppliers(supplierData.suppliers)
             }
             const res = await getOrderDetails(transactionId || id);
             if(res.success){
                setTransaction(res.transaction)
             }
            }
        })();
    }, [transactionId, id, setSuppliers]);

    const handleOrderStatus = async (id, status) => {
            
        if(!id){
            throw new Error("Transaction ID is missing");
        }
        if(!status){
            throw new Error("Status is missing");
        }
        

        Swal.fire({
            title: "Are you sure?",
            text: "Are you sure that you want to change the status of this order?",
            icon: "warning",
            confirmButtonText: "Yes",
            showCancelButton: true,
            draggable: true,
          })
          .then( async (willChange) => {
            if (willChange.isConfirmed) {
                try {
                    const response = await updateOrderStatus(id, status);
                    console.log(response)
                    if(response.data.success){
                        Swal.fire("Complete!", "Order status has been changed", "success");
                    }else{
                        Swal.fire("Unchanged!", response.data.message, "info");

                    }
                } catch (error) {
                    console.error("Error changing order status:", error);
                    Swal.fire("Error!", "Error changing order status", "error");
                }
            }
          });
        }

    return (
        <>
        {/* {console.log(transaction)} */}
        <Container className="p-0">
            <Row>
                <Col>
                    <Alert variant={transaction.transactionStatus === "complete" ? "success" : "warning"}>
                        {transaction?.transactionStatus && <div>
                            Status: {transaction?.transactionStatus.charAt(0).toUpperCase() + transaction?.transactionStatus.slice(1)}
                        </div>}
                        <div>
                            Created at {moment(transaction.transaction_date).format('MMMM Do YYYY, h:mm:ss a')}
                        </div>
                    </Alert>
                </Col>
                {transaction.transactionStatus !=='complete' && <Col>
                    <Button variant="success" onClick={() => handleOrderStatus(transaction._id, 'complete')}>Mark as Complete</Button>
                </Col>}
            </Row>

            <Row className="mt-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Customer Information</Card.Title>
                            <h4>{transaction.customerId?.first_name} {transaction.customerId?.last_name}</h4>
                            <p className="m-0">{transaction.customerId?.email}</p>
                            <p>Country: {transaction.customerId?.country}</p>
                            <p>Website: {transaction.siteId?.name}</p>
                            
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col>
                    <Card>
                        <Card.Body>
                            <Card.Title>Order Information #{transaction?.invoice_no
                            }</Card.Title>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th className="text-start" colSpan={2}>Item</th>
                                        <th>Cost</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        transaction?.orderData && 
                                        transaction?.orderData.length > 0 && 
                                        transaction?.orderData.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td></td>
                                                    <td className="text-start">
                                                        <div>
                                                        {item?.op_id?.productName || item?.name}
                                                        </div>
                                                        <div className="p-3">
                                                            {item?.meta_data?._ac_remote_product &&
                                                            item?.meta_data._ac_remote_product.length > 0 && 
                                                            <Table striped bordered hover size="sm">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Product</th>
                                                                        <th className="text-start">Key</th>
                                                                        <th>Supplier</th>
                                                                        <th>Pur. Date</th>
                                                                        <th>Wrnty. Date</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {/* {console.log(item)} */}
                                                                    {item?.meta_data._ac_remote_product.map((keys, i) =>{
                                                                        const key = item?.serialKeys.find(el => keys.id === el.productId);
                                                                        // console.log(key)
                                                                        return (
                                                                            <tr key={i} data-id={keys.id}>
                                                                                <td className="text-start">{keys.text}</td>
                                                                                <td>
                                                                                    {key?.serialNumber ? (
                                                                                        <div className="d-flex flex-column align-items-center">
                                                                                            <span>{key?.serialNumber}</span>
                                                                                            <Button className="py-0 btn btn-warning btn-sm text-nowrap">
                                                                                                Replace Key
                                                                                            </Button>
                                                                                            {/* <div className="d-flex flex-column align-items-center gap-2">
                                                                                            </div> */}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="d-flex flex-column align-items-center gap-2">
                                                                                            <Link 
                                                                                                className="py-0 btn btn-info btn-sm text-nowrap" 
                                                                                                to={`/serial-numbers?productId=${keys.id}&page=1&status=available`} 
                                                                                                target="_blank" 
                                                                                                rel="noopener noreferrer">
                                                                                                Assign Key
                                                                                            </Link>
                                                                                            <CgArrowTopRightO />
                                                                                        </div>
                                                                                    )}
                                                                                </td>
                                                                                <td>{suppliers.find(el => key?.supplierId === el._id)?.name}</td>
                                                                                <td>{key?.purchaseDate}</td>
                                                                                <td>{key?.warrantyDate}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </Table>}
                                                        </div>
                                                        
                                                    </td>
                                                    <td>USD {item.amount}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>USD {item.amount * item.quantity}</td>
                                                </tr>
                                            );
                                        })
                                    }
                                    
                                </tbody>
                                </Table>
                            
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        </>
    );


}

export default OrderDetailsView;