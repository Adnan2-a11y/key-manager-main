import MainLayout from "../../components/layout/MainLayout";
import { useStore } from "../../store/store";
import Cookies from "js-cookie";
import axios from "axios";
import API_CONFIG from "../../components/constant/apiConstants";
const BASE_URL = API_CONFIG.API_ENDPOINT;
import Swal from 'sweetalert2';
import ViewOrderModal from "./ViewOrderModal";
import { useEffect, useMemo, useState } from "react";
import "../../assets/css/orders.css";
import { useSearchParams } from "react-router-dom";
import { fetchOrders } from "../../services/orderServices";
import OrderTable from "./OrderTable";
import { Toaster } from "sonner";
import { useCallback } from "react";
import debounce from "lodash.debounce";

const OrderPage = () => {
    const { orders } = useStore();
    const [ transactionId, setTransactionId ] = useState(null);
    const { showEditModal, setShowEditModal, setOrders } = useStore();
    const [ searchParams ] = useSearchParams();

    const [ currentPage, setCurrentPage ] = useState(1);
    const [ pageLimit, setLimit ] = useState(10);
    const [ searchQuery, setSearchQuery ] = useState("");
    const [ type, setType ] = useState("");
    const [ pageCount, setPageCount] = useState(0);
    const [ ordersCount, setOrdersCount] = useState(0);

    const [filters, setFilters] = useState(new Map());

    const token = Cookies.get("accessToken");

    const fetchOrdersDebounced = useMemo(() =>
        debounce(async (filters) => {
            console.log("Debounced fetch:", filters);

            const data = await fetchOrders(filters);
            if (data.orders && data.orders.length > 0) {
                setOrders(data.orders);
                setPageCount(Math.ceil(data.counts / pageLimit));
                setOrdersCount(data.counts);
            } else {
                setOrders(0);
                setPageCount(0);
                setOrdersCount(0);
            }
        }, 300),
    [pageLimit, setOrders, setPageCount, setOrdersCount]
    );

    useEffect(() => {
        const newFilters = new Map();
        for (const [key, value] of searchParams.entries()) {
            newFilters.set(key, value);
        }
        setFilters(newFilters);
      }, [searchParams]);

    useEffect(() => {
          fetchOrdersDebounced(filters)
    }, [fetchOrdersDebounced, filters]);

    
    const handleEdit = (transactionId) => {
        setTransactionId(transactionId);
        setShowEditModal(true);
    };

    const handleDelete = async (transactionId) => {
        Swal.fire({
            title: "Delete?",
            text: "Are you sure that you want to delete?",
            icon: "error",
            confirmButtonText: "Yes, Delete",
            showCancelButton: true,
            draggable: true,
        }).then( async (data) => {
            if (data.isConfirmed) {
                try {
                    const headers = {
                        authorization: `Bearer ${token}`,
                    }
                    const response = await axios.delete(`${BASE_URL}/api/shop/order/delete/${transactionId}`, {headers: headers});
                    console.log(response);
                    if(response.data.success){
                        Swal.fire("Complete!", "Order has been deleted", "success");
                        const data = await fetchOrders(currentPage, type, pageLimit, searchQuery);
                        if(data.orders && data.orders.length > 0){
                            setOrders(data.orders);
                            setPageCount(Math.ceil(data.counts / pageLimit));
                            setOrdersCount(data.counts);
                        }else{
                            setOrders(0);
                            setPageCount(0);
                            setOrdersCount(0);
                        }
                    }
                } catch (error) {
                    console.error("Error deleting the API Key:", error);
                    Swal.fire("Error!", "Error deleting the API Key", "error");
                }
            }
        }).then(() => {
            // navigate("/api-keys");
        });
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setTransactionId(null);
    };

    return (
        <MainLayout>
            <div className="header d-flex gap-3">
                    <h1>Orders</h1>
            </div>
            <div className="wrap">
                {/* <Stack direction="horizontal" gap={3} className="mb-4">
                    
                    <Nav className="justify-content-end" activeKey="/orders/all">
                        <Nav.Item>
                            <Link to="/orders/all" className="text-white nav-link">All</Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/orders/all?type=complete" className="text-white nav-link">Completed</Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/orders/all?type=partial" className="text-white nav-link">Partial</Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/orders/all?type=processing" className="text-white nav-link">Processing</Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/orders/all?type=pending" className="text-white nav-link">Pending</Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Link to="/orders/all?type=failed" className="text-white nav-link">Failed</Link>
                        </Nav.Item>
                        
                    </Nav>
                </Stack> */}

                <OrderTable
                    data={orders}
                    totalCount={ordersCount}
                    pageCount={pageCount}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSetLimit={setLimit}
                />
                
            </div>

            <ViewOrderModal show={showEditModal} hide={handleCloseEditModal} transactionId={transactionId} />
            <Toaster richColors position="top-right" />
        </MainLayout>
    );
}

export default OrderPage