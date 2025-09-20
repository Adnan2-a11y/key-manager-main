import { Button, Col, Container, Form, Row } from "react-bootstrap"
import SiteDropdownSearch from "../../components/common/SiteDropdownSearch"
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

const OrderFilters = () => {
    const [filters, setFilters] = useState(new Map());
    const navigate = useNavigate();

    const handleChange = (key, value) => {
        console.log(key, value);
        setFilters(prev => {
        const newMap = new Map(prev);
        if (value === "" || value === null) {
            newMap.delete(key); // Remove if empty
        } else {
            newMap.set(key, value); // Set or update
        }
        return newMap;
        });
    };

    const handleSearch = async () => {
        console.log("searching", filters)
        const queryString = new URLSearchParams(Object.fromEntries(filters)).toString();
        navigate(`?${queryString}`);
    }

    const resetHandler = async() => {
        setFilters(new Map());
        navigate("?");
    }

    return (
        <>
        <Container className="bg-white p-2">
            <Row>
                    <Col md={2} className="sm:mb-3">
                    <SiteDropdownSearch 
                        placeholder="Select Store" 
                        onChange={(e) => handleChange('store', e)}
                    />
                    </Col>
                    <Col md={2} className="sm:mb-3">
                        <Form.Select className="py-0" onChange={(e) => handleChange('status', e.target.value)}>
                            <option value="">Select Type</option>
                            <option value="complete">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="failed">Failed</option>
                            <option value="on-hold">On Hold</option>
                        </Form.Select>
                    </Col>
                    <Col md={2} className="sm:mb-3">
                        <Form.Control type="text" className="py-0"  placeholder="Order no or name"  onChange={(e) => handleChange('query', e.target.value)} />
                    </Col>
                    <Col md={2} className="sm:mb-3">
                        <DatePicker 
                            placeholderText="Start Date"
                            selected={filters.get('startDate')}
                            onChange={(date) => handleChange('startDate', moment(date).format('MM-DD-YYYY'))}
                            dateFormat="MM-dd-yyyy"
                            className="py-0 form-control"
                        />
                    </Col>
                    <Col md={2} className="sm:mb-3">
                        <DatePicker 
                            placeholderText="End Date"
                            selected={filters.get('endDate')}
                            onChange={(date) => handleChange('endDate', moment(date).format('MM-DD-YYYY'))}
                            dateFormat="MM-dd-yyyy"
                            className="py-0 form-control"
                        />
                    </Col>
                    
                    
                    <Col md={2} className="sm:mb-3 d-flex gap-2 align-items-center">
                    <Button type="submit" variant={"primary"} className="py-0" onClick={handleSearch}>Search</Button>
                    <Button type="submit" variant={"danger"} className="py-0" onClick={resetHandler}>Reset</Button>
                    </Col>
            </Row>
        </Container>
        </>
    )
}

export default OrderFilters