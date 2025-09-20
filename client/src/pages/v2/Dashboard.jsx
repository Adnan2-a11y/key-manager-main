import Icon, {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    UserOutlined,
    KeyOutlined,
    ProductOutlined,
    BarcodeOutlined,
    EuroOutlined,
    SettingOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { Badge, Button, Card, Col, Flex, Input, Layout, Menu, Row, Space, theme } from 'antd';
import { useState } from 'react';
import '../../assets/css/layout.css';
import FirstSalesOverview from '../../components/dashboard/FirstSalesOverview';
const { Header, Sider, Content } = Layout;


const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const siderStyle = {
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
    };

    const logoStyle = {
        textAlign: "center",
        fontSize: '24px',
        fontWeight: '700',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
    }

    const CashSVG = () => (
        <svg viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5882 4.77778V2.88889C14.5882 2.38792 14.384 1.90748 14.0207 1.55324C13.6573 1.19901 13.1645 1 12.6506 1H2.96293C2.44906 1 1.95624 1.19901 1.59288 1.55324C1.22952 1.90748 1.02539 2.38792 1.02539 2.88889V8.55555C1.02539 9.05652 1.22952 9.53696 1.59288 9.8912C1.95624 10.2454 4.3866 10.1538 4.90047 10.1538M6.83801 14.2222H16.5257C17.0396 14.2222 17.5324 14.0232 17.8958 13.669C18.2591 13.3147 18.4632 12.8343 18.4632 12.3333V6.66667C18.4632 6.1657 18.2591 5.68526 17.8958 5.33102C17.5324 4.97679 17.0396 4.77778 16.5257 4.77778H6.83801C6.32414 4.77778 5.83132 4.97679 5.46796 5.33102C5.1046 5.68526 4.90047 6.1657 4.90047 6.66667V12.3333C4.90047 12.8343 5.1046 13.3147 5.46796 13.669C5.83132 14.0232 6.32414 14.2222 6.83801 14.2222ZM13.6194 9.5C13.6194 10.001 13.4153 10.4814 13.0519 10.8356C12.6885 11.1899 12.1957 11.3889 11.6819 11.3889C11.168 11.3889 10.6752 11.1899 10.3118 10.8356C9.94845 10.4814 9.74432 10.001 9.74432 9.5C9.74432 8.99903 9.94845 8.51859 10.3118 8.16435C10.6752 7.81012 11.168 7.61111 11.6819 7.61111C12.1957 7.61111 12.6885 7.81012 13.0519 8.16435C13.4153 8.51859 13.6194 8.99903 13.6194 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    );
    const CashIcon = props => <Icon component={CashSVG} {...props} />;
    function getItem(label, key, icon, children) {
        return {
            key,
            icon,
            children,
            label,
        };
    }

    return (
        <Layout>
            <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
                <div className="demo-logo-vertical" style={logoStyle}>Key {!collapsed && <span>Manager</span>}</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['dashboard']}
                    items={[
                        {
                            key: 'dashboard',
                            icon: <HomeOutlined />,
                            label: 'Dashboard',
                        },
                        {
                            key: '1',
                            icon: <KeyOutlined />,
                            label: 'API Keys',
                            children: [
                                getItem('All API Keys', 'api-keys'),
                                getItem('Add New Key', 'add-new-api'),
                            ],
                        },
                        {
                            key: '2',
                            icon: <ProductOutlined />,
                            label: 'Products',
                            children: [
                                getItem('All Products', 'products'),
                                getItem('Add New', 'add-new'),
                                getItem('Category', 'category'),
                                getItem('Tags', 'tags'),
                            ],
                        },
                        {
                            key: '3',
                            icon: <BarcodeOutlined />,
                            label: 'Serial Keys',
                            children: [
                                getItem('All Keys', 'serial-keys'),
                                getItem('Add New', 'add-new-keys'),
                                getItem('Suppliers', 'suppliers'),
                                getItem('Stock Manager', 'stock-manager'),
                            ],
                        },
                        {
                            key: '4',
                            icon: <EuroOutlined />,
                            label: 'Orders',
                            children: [
                                getItem('All Orders', 'orders'),
                                getItem('Completed', 'completed'),
                                getItem('Pending', 'pending'),
                                getItem('Partial', 'partial'),
                                getItem('Failed', 'failed'),
                                getItem('Cancelled', 'cancelled'),
                            ],
                        },
                        {
                            key: '5',
                            icon: <UserOutlined />,
                            label: 'Users',
                            children: [
                                getItem('All Users', 'users'),
                                getItem('Add New', 'add-new-user'),
                            ],
                        },
                        {
                            key: 'settings',
                            icon: <SettingOutlined />,
                            label: 'Settings',
                        },
                    ]}
                />
            </Sider>
            <Layout className='beautify'>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Flex wrap gap="small" justify="space-between">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
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
                <Content className='mmm'
                    style={{
                        padding: 24,
                        minHeight: 280,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Row gutter={[16, 16]} align="middle">
                        <Col span={16}>
                            <Row align="middle">
                                <Col span={6}>
                                    <h1>Pulse</h1>
                                </Col>
                                <Col span={18}>
                                    <p className='m-0'>4 sales • $325.03 and0 refund • $0 since your last visit.</p>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={8} >
                            <Flex wrap gap="small" justify="space-between">
                                <h4 className='flex gap-2'>
                                    <CashIcon style={{ width: '1rem', height: '1rem' }} />
                                    <span>Account balance</span>
                                </h4>
                                <a>$1,223,331.00</a>
                            </Flex>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col span={9}>
                            <FirstSalesOverview />
                        </Col>
                        <Col span={9}>
                            <Card title="Default size card" extra={<a href="#">More</a>}>
                                <p>Card content</p>
                                <p>Card content</p>
                                <p>Card content</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Default size card" extra={<a href="#">More</a>}>
                                <p>Card content</p>
                                <p>Card content</p>
                                <p>Card content</p>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
        
    );
}

export default Dashboard