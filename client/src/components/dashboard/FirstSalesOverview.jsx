import { Card, Row, Col, Typography, Progress } from 'antd';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const { Title, Text } = Typography;

const FirstSalesOverview = () => {
    const lineData = {
        labels: [
        '01/05/2025', '02/05/2025', '05/05/2025', '08/05/2025', '10/05/2025',
        '13/05/2025', '15/05/2025', '18/05/2025', '20/05/2025', '23/05/2025', '25/05/2025'
        ],
        datasets: [
        {
            label: 'Net Sales',
            data: [200, 800, 600, 450, 700, 950, 800, 1100, 900, 243.30, 500],
            borderColor: '#00B7C7',
            backgroundColor: 'rgba(0, 183, 199, 0.1)',
            tension: 0,
            fill: true,
        },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                grid: {
                    display: false, // 🔹 Hide X-axis grid
                    // drawBorder: false,
                },
                ticks: { 
                    callback: value => `$${value}`
                },
                border: {
                    display: false,       // ✅ Hide X-axis line itself
                },
            },
            x: {
                grid: {
                    display: false, // 🔹 Hide X-axis grid
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 4, // Show only up to 6 X-axis labels
                },
                border: {
                    display: false,       // ✅ Hide X-axis line itself
                },
            }
        },
    };
    return (
        <Card style={{ padding: 0 }} styles={{body: { padding: 16 }}}>
            <Row justify="space-between" align="top">
                <Col>
                    <Text type="secondary">May 2025 Sales so far...</Text>
                    <Title level={2} className='m-0'>$12,980.58</Title>
                </Col>
                <Col>
                    <Text type="secondary">Today</Text>
                    <Title level={4} className='m-0'>$37.80</Title>
                </Col>
                <Col>
                    <Text type="secondary">Yesterday</Text>
                    <Title level={4} className='m-0'>$305.50</Title>
                </Col>
            </Row>

            <Row>
                <Col span={18}>
                    <Line data={lineData} options={options} height="150px" />
                </Col>
                <Col span={6}>
                    <div style={{ marginTop: 16 }}>
                        <Text type="secondary">Daily Average</Text>
                        <div><Title level={5}>$530.32</Title></div>

                        <Text type="secondary">MRR</Text>
                        <div><Title level={5}>$1,144.97</Title></div>
                    </div>
                </Col>
            </Row>


            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={12}>
                    <Text>Sales target</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Title level={4} style={{ margin: 0 }}>$3,000</Title>
                        <a>Edit</a>
                    </div>
                    <Progress percent={432.69} showInfo={false} strokeColor="#00B7C7" />
                </Col>

                <Col span={12}>
                    <Text>
                        🟧 Forecast: <strong>$16.91k - $58.89k</strong>
                    </Text>
                </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
                <Text>Apr 2025: $19.87k</Text><br />
                <Text>May 2024: $6,675.84</Text><br />
                <Text>Apr 2024: $3,189.21</Text>
            </div>
        </Card>
    );
}

export default FirstSalesOverview