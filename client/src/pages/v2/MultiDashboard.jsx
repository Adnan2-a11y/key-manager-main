import {
    BellOutlined,
    // TableOutlined,
    // AppstoreOutlined,
    CloudDownloadOutlined,
    MoreOutlined,
    // MailOutlined,
    InfoCircleOutlined,
    // LineChartOutlined,
    ArrowLeftOutlined,
    // LinkOutlined,
    ShopOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
// eslint-disable-next-line no-unused-vars
import { Badge, Button, Card, Col, Flex, Input, Layout, List, Menu, Popover, Radio, Row, Space, theme, Tooltip } from 'antd';
import { useState } from 'react';
import '../../assets/css/newLayout.css';
import { Typography } from 'antd';
import { Link } from 'react-router-dom';
// import DateRangeSelector from './DateRangeSelector';
import DateRangeSelector2 from './DateRangeSelector2';
import { useEffect } from 'react';
import { useStore } from '../../store/store';
import multiDashService from '../../services/multiDashServices';
import API_CONFIG from '../../components/constant/apiConstants';
// import CompareDatePickers from './CompareDatePickers';
// eslint-disable-next-line no-unused-vars
const { Paragraph, Text, Title } = Typography;
const { Header, Content } = Layout;
const SITE_URL = API_CONFIG.SITE_URL;


const MultiDashboard = () => {
    const { selectedDateMultiDash } = useStore();
    // eslint-disable-next-line no-unused-vars
    // const [collapsed, setCollapsed] = useState(false);
    // const [revenueType, setRevenueType] = useState('Gross');
    // const [storeViewType, setStoreViewType] = useState('table');
    // eslint-disable-next-line no-unused-vars
    const [defaultCompareBtn, setDefaultCompareBtn] = useState(false);
    const [ stores, setStores ] = useState([]);
    const [ summaries, setSummaries ] = useState({});
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // const revenueOptions = [
    //     { label: 'Net', value: 'Net', className: 'label-1' },
    //     { label: 'Gross', value: 'Gross', className: 'label-2' },
    // ];
    // const storeViewOptions = [
    //     { label: <TableOutlined />, value: 'table', className: 'label-1', style:{fontSize: 20} },
    //     { label: <AppstoreOutlined />, value: 'box', className: 'label-2', style:{ fontSize: 20} },
    // ];
    // const onRevenueOptionsChange = ({ target: { value } }) => {
    //     setRevenueType(value);
    // };
    // const onStoreViewTypeChange = ({ target: { value } }) => {
    //     setStoreViewType(value);
    // };
    const getRandomColor = () => {
        // Generate a random pastel-like color
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 50%, 50%)`;
    };
    const getContrastTextColor = (bgColor) => {
        // Convert HSL to RGB
        const hsl = bgColor.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/);
        if (!hsl) return "#000"; // fallback

        const h = parseInt(hsl[1]) / 360;
        const s = parseInt(hsl[2]) / 100;
        const l = parseInt(hsl[3]) / 100;

        // HSL to RGB formula
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        // Calculate luminance
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance > 0.6 ? "#000" : "#fff"; // choose black or white
    };
    const CardTitleGen = (title) => {
        const firstLetter = title.charAt(0).toUpperCase();
        const backgroundColor = getRandomColor();
        const textColor = getContrastTextColor(backgroundColor);

        return (
            <Link to={`https://${title.toLowerCase()}`} target='_blank' className='flex align-items-center store-title'>
                <div className="store-photo tic-store-avatar">
                    <div className="avatar--wrapper" style={{ backgroundColor, color: textColor }}>
                        <span>{firstLetter}</span>
                    </div>
                </div>
                <Title level={3} style={{margin: 0}} className='name'>{title}</Title>
            </Link>
        );
    }
    // eslint-disable-next-line no-unused-vars
    const CardMorePopOverMenu = (name) => {
        const onClick = (item) => {
            const fullUrl = `https://${name}/${item.key}`;
            window.open(fullUrl, '_blank');
        };
        const items = [
            {
                key: 'wp-admin',
                label: 'Visit Dashboard',
                icon: <DashboardOutlined />,
            },
            {
                key: 'wp-admin/edit.php?post_type=shop_order',
                label: 'Orders',
                icon: <ShopOutlined />,
            }
        ];
        return (
            <Menu
                onClick={onClick}
                style={{ width: 256 }}
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                mode="inline"
                items={items}
                />
        );
    }
    const CardMorePopOver = (name) => {
        return (
            <Popover placement="left" content={CardMorePopOverMenu(name)} arrow={true}>
              <MoreOutlined style={{fontSize: 20, cursor: 'pointer'}}/>
            </Popover>
        );
    }
    const StoreDataAsList = (matchedSite) => {


        let data = {
                net_revenue: {
                    amount: 0,
                    label: 'Net Revenue',
                    currency: '$',
                    growth: 0,
                    tooltip: 'Gross sales less taxes, shipping, fees and refunds made in this period.'
                },
                orders: {
                    amount: 0,
                    label: 'Orders',
                    growth: 0,
                },
                items: {
                    amount: 0,
                    label: 'Items',
                    growth: 0,
                },
                // customers: {
                //     amount: 0,
                //     label: 'Customers',
                //     growth: 0,
                // },
                average_amount: {
                    amount: 0,
                    label: 'Average Order Net',
                    currency: '$',
                    growth: 0,
                },
                average_items: {
                    amount: 0,
                    label: 'Average Order Items',
                    growth: 0,
                }
            };

            if(matchedSite){
                data = {
                    net_revenue: {
                        amount: matchedSite?.netRevenue.toFixed(2),
                        label: 'Net Revenue',
                        currency: '$',
                        growth: 0,
                        tooltip: 'Gross sales less taxes, shipping, fees and refunds made in this period.'
                    },
                    orders: {
                        amount: matchedSite?.totalOrders,
                        label: 'Orders',
                        growth: 0,
                    },
                    items: {
                        amount: matchedSite?.totalItems,
                        label: 'Items',
                        growth: 0,
                    },
                    // customers: {
                    //     amount: matchedSite?.newCustomers,
                    //     label: 'Customers',
                    //     growth: 0,
                    // },
                    average_amount: {
                        amount: matchedSite?.averageOrderNet.toFixed(2),
                        label: 'Average Order Net',
                        currency: '$',
                        growth: 0,
                    },
                    average_items: {
                        amount: matchedSite?.averageOrderItems.toFixed(2),
                        label: 'Average Order Items',
                        growth: 0,
                    }
                };
            }

        const dataList = Object.values(data);
        return (
            <List
                size="small"
                dataSource={dataList}
                renderItem={(item) => (
                    <List.Item>
                            <div><strong>{item?.currency}{item.amount}</strong> {item.label} {item.tooltip && <Tooltip title={item.tooltip}><InfoCircleOutlined /></Tooltip>}</div>
                            {/* <div className='growth'>{item.growth}%</div> */}
                    </List.Item>
                )}
                />
        );
    }

    useEffect(()=>{
        (async() => {
            const result = await multiDashService.getSummary(selectedDateMultiDash);
            setStores(result?.stores);
            setSummaries(result?.summary);
        })()
    }, [selectedDateMultiDash])

    return (
        <Layout>
            <Layout className='beautify'>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Flex wrap gap="small" justify="space-between" align='center'>
                        <Link className='btn btn-danger' to={SITE_URL} style={{
                                fontSize: '16px',
                                width: 32,
                                height: 32,
                                padding: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 20,
                            }}>
                                
                            <ArrowLeftOutlined />
                        </Link>
                        <Flex gap="middle">
                            <div>
                                <Input placeholder="Search for something" style={{ minWidth: '400px' }} />
                            </div>
                            <Space size="middle" className='me-4'>
                                <Badge size="default" count={5}>
                                    <BellOutlined style={{ fontSize: '24px' }} />
                                </Badge>
                            </Space>
                        </Flex>
                    </Flex>
                </Header>
                <Content className='multistore-dashboard-page'
                    style={{
                        padding: 24,
                        minHeight: 280,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Row gutter={[16, 16]} align="middle" className='top-nav-wrapper'>
                        <Col span={8}>
                            <Title level={1} style={{ margin: 0 }}>
                                Multistore Dashboard
                            </Title>
                        </Col>
                        <Col span={8}>
                            <Input placeholder="Search for something" style={{ minWidth: '400px' }} />
                        </Col>
                        <Col span={8} className='flex justify-content-end'>
                            <Space>
                                {/* <div className="previous-date-picker">
                                    {defaultCompareBtn && 
                                        <Button 
                                            className='flex align-items-center' 
                                            onClick={() => (setDefaultCompareBtn(false))}
                                            >
                                                <LineChartOutlined /> <span>Compare Dates</span>
                                        </Button>
                                    }

                                    <Button 
                                        className='flex align-items-center' 
                                        onClick={() => ('')}
                                        >
                                            <span>Compare To:</span>
                                    </Button>
                                </div> */}
                                <div className="date-picker right-date-picker">
                                    <DateRangeSelector2 />
                                </div>

                            </Space>
                        </Col>
                    </Row>
                    <div className='overview'>
                        <div className='totals'>
                            <div className='heading-area'>
                                <Title level={4} style={{ margin: 0 }}>
                                    Totals for {stores.length} {stores.length > 1 ? 'Stores' : 'Store'}
                                </Title>
                                {/* <div className="right-side">
                                    <Radio.Group
                                        options={revenueOptions}
                                        onChange={onRevenueOptionsChange}
                                        value={revenueType}
                                        optionType="button"
                                        buttonStyle="solid"
                                    />
                                </div> */}
                            </div>
                            <Row gutter={[8, 16]}>
                                <Col span={12} sm={8} md={6} lg={4}>
                                    <Card className='total-stat card-base revenue' styles={{body: {padding: 12}}}>
                                        <div className='amount'>
                                            <span>${summaries?.summary?.netRevenue.toFixed(2)}</span>
                                            {/* <span className='growth'>0%</span> */}
                                        </div>
                                        <div className="stat">Net Revenue</div>
                                    </Card>
                                </Col>
                                <Col span={12} sm={8} md={6} lg={4}>
                                    <Card className='total-stat card-base revenue' styles={{body: {padding: 12}}}>
                                        <div className='amount'>
                                            <span>{summaries?.summary?.ordersCount}</span>
                                            {/* <span className='growth'>0%</span> */}
                                        </div>
                                        <div className="stat">Orders</div>
                                    </Card>
                                </Col>
                                <Col span={12} sm={8} md={6} lg={4}>
                                    <Card className='total-stat card-base revenue' styles={{body: {padding: 12}}}>
                                        <div className='amount'>
                                            <span>{summaries?.summary?.items}</span>
                                            {/* <span className='growth'>0%</span> */}
                                        </div>
                                        <div className="stat">Items</div>
                                    </Card>
                                </Col>
                                <Col span={12} sm={8} md={6} lg={4}>
                                    <Card className='total-stat card-base revenue' styles={{body: {padding: 12}}}>
                                        <div className='amount'>
                                            <span>${summaries?.summary?.averageOrderNet.toFixed(2)}</span>
                                            {/* <span className='growth'>0%</span> */}
                                        </div>
                                        <div className="stat">Average Order Net</div>
                                    </Card>
                                </Col>
                                <Col span={12} sm={8} md={6} lg={4}>
                                    <Card className='total-stat card-base revenue' styles={{body: {padding: 12}}}>
                                        <div className='amount'>
                                            <span>{summaries?.customer?.newCustomers}</span>
                                            {/* <span className='growth'>0%</span> */}
                                        </div>
                                        <div className="stat">New Customers</div>
                                    </Card>
                                </Col>
                                <Col span={12} sm={8} md={6} lg={4}>
                                    <Card className='total-stat card-base revenue' styles={{body: {padding: 12}}}>
                                        <div className='amount'>
                                            <span>{summaries?.summary?.averageItems.toFixed(2)}</span>
                                            {/* <span className='growth'>0%</span> */}
                                        </div>
                                        <div className="stat">Average Items</div>
                                    </Card>
                                </Col>
                                
                            </Row>
                        </div>
                    </div>

                    <div className="stores-list">
                        <div className='heading-area'>
                            <Title level={4}>
                                Stores
                            </Title>
                            <Button icon={<CloudDownloadOutlined />}> Export</Button>
                            {/* <div className="right-side">
                                <Radio.Group
                                    options={storeViewOptions}
                                    onChange={onStoreViewTypeChange}
                                    value={storeViewType}
                                    optionType="button"
                                    buttonStyle="outline"
                                />
                            </div> */}
                        </div>
                        <div>
                            <Row gutter={[8, 16]} className='store-row'>
                                    {stores.length > 0 && stores.map((item, i)=>{
                                        const matchedSite = summaries?.siteSummary.find(s => s?.siteId === item?._id);
                                        return (
                                            <Col key={i} span={24} sm={12} md={8} lg={6} order={matchedSite ? 0 : 1}>
                                                <Card title={CardTitleGen(item.name)} extra={CardMorePopOver(item.name)} className={`store card card-base`} styles={{body: {padding: 12}}}>
                                                    {StoreDataAsList(matchedSite)}
                                                </Card>
                                            </Col>
                                        );
                                    })}
                            </Row>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
        
    );
}

export default MultiDashboard