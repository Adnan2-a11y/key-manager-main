import { useCallback, useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import "../../assets/css/serialNumber.css";
import SerialNumberTable from "./SerialNumberTable";
import EditSerialNumberModal from "./EditSerialNumberModal";
import { useStore } from "../../store/store";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchSuppliers } from "../../services/productServices";
import { deleteSerialNumber, fetchSerialKeys } from "../../services/serialNumberServices";
import Swal from 'sweetalert2';
import { Toaster, toast } from 'sonner';
import debounce from "lodash/debounce";

function SerialNumberPage() {
  const { showEditModal, setShowEditModal, serialNumbers, setSerialNumbers, setProducts, suppliers, setSuppliers } = useStore();
  const [ editedSerialNumber, setEditedSerialNumber ] = useState(null);
  const [ serialNumbersCount, setSerialNumbersCount ] = useState(0);
  const [ searchParams ] = useSearchParams();
  const [ currentPage, setCurrentPage ] = useState(1);
  const [ pageLimit, setLimit ] = useState(10);
  const [ searchQuery, setSearchQuery ] = useState("");
  const [ keyStatus, setKeyStatus ] = useState("");
  const [ productId, setProductId ] = useState("");
  const [ deletedId, setDeletedId ] = useState('');
  const [ pageCount, setPageCount] = useState(0);

  useEffect(() => {
    setCurrentPage(searchParams.get("page") || 1);
    setLimit(searchParams.get("limit") || 10);
    setSearchQuery(searchParams.get("search") || "");
    setProductId(searchParams.get("productId") || "");
    setKeyStatus(searchParams.get("status") || "");
  }, [searchParams]);

  const fetchSerialKeysDebounced = useCallback(
    debounce(async (currentPage, productId, searchQuery, keyStatus, pageLimit, setSerialNumbers, setSerialNumbersCount, setPageCount) => {
      console.log("Debounced fetch:", currentPage, productId, searchQuery, keyStatus, pageLimit);

      const serialData = await fetchSerialKeys(currentPage, productId, searchQuery, keyStatus, pageLimit);
      if (serialData.serialNumbers) {
        setSerialNumbers(serialData.serialNumbers);
        setSerialNumbersCount(serialData.count);
        setPageCount(Math.ceil(serialData.count / pageLimit));
      } else {
        setSerialNumbers([]);
        setSerialNumbersCount(0);
        setPageCount(0);
      }
    }, 300),
    []
  );
  
  const fetchOthersDebounced = useCallback(
    debounce(async (setProducts, setSuppliers) => {
      
      const [ productsData, suppliersData ] = await Promise.all([
          await fetchProducts(),
          await fetchSuppliers()
        ]);
        console.log("others fetched", productsData, suppliersData )
        if(productsData.success){
          const filterData = productsData.products.map((item) => {
            return {
              _id: item._id,
              productId: item.productId,
              name: item.productName
            }
          })

          setProducts(filterData)
        }
        if(suppliersData){
          setSuppliers(suppliersData.suppliers);
        }
    }, 300),
    []
  );

    useEffect(() => {
      fetchOthersDebounced(setProducts, setSuppliers);
    }, [fetchOthersDebounced, setProducts, setSuppliers]);

    useEffect(() => {
      fetchSerialKeysDebounced(
        currentPage,
        productId,
        searchQuery,
        keyStatus,
        pageLimit,
        setSerialNumbers,
        setSerialNumbersCount,
        setPageCount
      );
    }, [currentPage, productId, searchQuery, keyStatus, pageLimit, setSerialNumbers, setSerialNumbersCount, setPageCount, fetchSerialKeysDebounced]);

  const handleEdit = (serialNumber) => {
    setEditedSerialNumber(serialNumber);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditedSerialNumber(null);
  };

  const handleDelete = async (serialnumberId) => {
    try {

      // new Swal
      Swal.fire({
        title: "Are you sure?",
        text: "Are you sure that you want to delete this serial number?",
        icon: "warning",
        confirmButtonText: "Yes, Delete",
        showCancelButton: true,
        draggable: true,
      }).then(async (willDelete) => {
        if (willDelete.isConfirmed) {
          const response = await deleteSerialNumber(serialnumberId);
          if(response.success){
            setSerialNumbers(
              serialNumbers.filter(
                (serialNumber) => serialNumber._id !== serialnumberId
              )
            );
            setDeletedId(serialnumberId);
            
            toast.success(response.message);
          }else{
            toast.error(response.message);
          }
        }
      });

      // const response = await deleteSerialNumber(serialnumberId);
      // if(response.success){
      //   setSerialNumbers(
      //     serialNumbers.filter(
      //       (serialNumber) => serialNumber._id !== serialnumberId
      //     )
      //   );
      // }
    } catch (err) {
      console.error("Error removing serial number: ", err);
    }
  };

  return (
    <MainLayout>
      <div className="header d-flex gap-3">
        <h1>Serial Numbers</h1>
        <div className="d-flex align-items-center">
          <Button variant="primary" size="sm" as="a" href="/serial-numbers/add">
              <FaPlus />
              {" "}
              Add New Serial Key 
          </Button>
        </div>
      </div>
      
      <div className="row mt-3 serial-number-container">
        <SerialNumberTable
          serialNumbers={serialNumbers}
          suppliers={suppliers}
          pageCount={pageCount}
          onDelete={handleDelete}
          onEdit={handleEdit}
          totalCount={serialNumbersCount}
        />
      </div>

      <EditSerialNumberModal
        show={showEditModal}
        hide={handleCloseEditModal}
        serialNumber={editedSerialNumber}
      />
      <Toaster richColors position="top-right" />
    </MainLayout>
  );
}

export default SerialNumberPage;
