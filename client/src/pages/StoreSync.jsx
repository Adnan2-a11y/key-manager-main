import { useEffect, useMemo, useState } from "react";
import "../assets/css/settings.css";
import MainLayout from "../components/layout/MainLayout";
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useParams } from "react-router-dom";
import { getStoreByID, startSync } from "../services/storeServices";
import debounce from "lodash.debounce";
import { Toaster, toast } from "sonner";


function StoreSync() {
  const { id } = useParams();
  const [storeData, setStoreData] = useState({});

  const [invoiceNo, setInvoiceNo] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStoreData = useMemo(() =>
          debounce(async (id) => {
              console.log("Debounced fetch:", id);
  
              const data = await getStoreByID(id);
              setStoreData(data.data)
          }, 300),
      [setStoreData]
      );

  useEffect(() => {
        fetchStoreData(id)
  }, [fetchStoreData, id]);

  const importSingleInvoice = async () => {
    console.log('Searching for invoice:', invoiceNo);
    toast.loading("Sync started");
    
    const result = await startSync('single', id, invoiceNo);
    if(result.success){
      toast.dismiss();
      toast.success(result.message);
    }else{
      toast.dismiss();
      toast.error(result.message);
    }
  };

  const handleDateSearch = async () => {
    console.log('Searching for date:', selectedDate);
    await startSync('latest', id, selectedDate);
  };

  const handleDateRangeSearch = async () => {
    console.log('Searching from:', startDate, 'to:', endDate);
    await startSync('range', id, {start: startDate, end: endDate});
  };
  
  return (
    <MainLayout>
      <div className="container">
        <h1>Import Missing Orders</h1>
        <h3>{storeData?.name ? `From ${storeData?.name}` : '' }</h3>
      </div>

      <Container className="mt-5">
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Import Order by Invoice Number</Card.Title>
                <Form.Group controlId="invoiceNo">
                  <Form.Label>Invoice Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter invoice number"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={importSingleInvoice} className="mt-2">
                  Import Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Import Latest Orders by Date</Card.Title>
                <Form.Group controlId="dateSelect">
                  <Form.Label>Select Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleDateSearch} className="mt-2">
                  Import Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Import Orders by Date Range</Card.Title>
                <Form.Group controlId="startDate">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="endDate" className="mt-2">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleDateRangeSearch} className="mt-2">
                  Import Now
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
    </Container>
    <Toaster position="top-right" />
    </MainLayout>
  );
}

export default StoreSync;
