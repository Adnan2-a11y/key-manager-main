import { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";
import { useStore } from "../../store/store";

import API_CONFIG from "../../components/constant/apiConstants";
import debounce from "lodash.debounce";
import axios from "axios";
import Cookies from "js-cookie";
import { useSearchParams } from "react-router-dom";

const BASE_URL = API_CONFIG.API_ENDPOINT;
const debouncedSearch = debounce(async (value, token, setProducts) => {
  if (value.length >= 3) {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${BASE_URL}/api/product/all?keyword=${value}`,
        { headers }
      );

      if(response.data.success){
        const filterData = response.data.products.map((item) => {
          // console.log(item)
          return {
            _id: item._id,
            productId: item.productId,
            name: item.productName
          }
        });
        setProducts(filterData);
      }
    } catch (error) {
      console.error("Error fetching product names:", error);
    }
  }
}, 500);

/* eslint-disable react/prop-types */
const DropdownFilter = ({onChange}) => {

    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [focusInput, setFocusInput] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState({});
    const {products} = useStore();
    const inputRef = useRef(null);
    const [searchParams] = useSearchParams();

    const token = Cookies.get("accessToken");

    useEffect(() => {
        if (focusInput && inputRef.current) {
          inputRef.current.focus();
          setFocusInput(false);
        }
      }, [focusInput]);

    useEffect(() =>{
        const productId = searchParams.get("productId") || "";
        if(productId == ""){
            setSelectedProduct({});
            setProductSuggestions(products);
        }
    }, [products, searchParams]);

    const handleSelectProduct = (product) => {

        setSelectedProduct(product);
        onChange(product._id);
    
        // Reset other related state variables
        setShowProductDropdown(false);
        setProductSuggestions([]);
    };

    const handleDropdownClick = () => {
        setFocusInput(true);
        if("" === searchKeyword){
            setProductSuggestions(products);
        }
    };

    const handleInputChange = useCallback((value) => {
        setSearchKeyword(value);
        debouncedSearch(value, token, setProductSuggestions);
      }, [setProductSuggestions, token]);  

    return (
        <Dropdown
            show={showProductDropdown}
            onToggle={(isOpen) => {
            setShowProductDropdown(isOpen);
            if (!isOpen) {
                setSearchKeyword("");
            }
            }}
            onClick={handleDropdownClick}
            className="product-dropdown"
        >
            <Dropdown.Toggle
            className="bg-white text-black product-dropdown"
            id="productDropdown"
            >
            {selectedProduct && Object.keys(selectedProduct).length > 0
                ? selectedProduct.name
                : "Search Product by Name"}
            </Dropdown.Toggle>
            <Dropdown.Menu className="product-dropdown-menu">
                <Form.Control
                    type="text"
                    placeholder="Search product by name"
                    className="form-control form-control-sm"
                    name="product"
                    value={searchKeyword}
                    onChange={(e) => handleInputChange(e.target.value)}
                    autoFocus
                    ref={inputRef}
                />
                <div className="product-dropdown-wrapper">
                    
                    {productSuggestions.map((product) => (
                        <Dropdown.Item
                            key={product._id}
                            onClick={() => handleSelectProduct(product)}
                            >
                            {product.name}
                        </Dropdown.Item>
                    ))}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    )
};

export default DropdownFilter