import { useState } from 'react';
import { Button, DatePicker, Dropdown, Input, Space } from 'antd';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const presetRanges = {
  Today: [dayjs(), dayjs()],
  Yesterday: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
  'This Week': [dayjs().startOf('week'), dayjs().endOf('week')],
  'Last Week': [
    dayjs().subtract(1, 'week').startOf('week'),
    dayjs().subtract(1, 'week').endOf('week')
  ],
  'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
  'Year To Date': [dayjs().startOf('year'), dayjs()],
  'All Time': [dayjs('2000-01-01'), dayjs()],
};

const DateRangeSelector = () => {
  const [selectedRange, setSelectedRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [customVisible, setCustomVisible] = useState(false);

  const menuItems = [
    ...Object.keys(presetRanges).map(label => ({
      key: label,
      label,
    })),
    { type: 'divider' },
    {
      key: 'Custom Range',
      label: <strong>Custom Range</strong>,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'Custom Range') {
      setCustomVisible(true);
    } else {
      setSelectedRange(presetRanges[key]);
      setCustomVisible(false);
    }
  };

  return (
    <Space>
      {!customVisible ? (
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={['click']}
        >
            <Space.Compact>
                <Input
                readOnly
                value={`${selectedRange[0].format('MMM D, YYYY')} - ${selectedRange[1].format('MMM D, YYYY')}`}
                suffix={<DownOutlined />}
                style={{ width: 250, cursor: 'pointer' }}
                />
                <Button className='flex align-items-center'><MenuOutlined /></Button>
            </Space.Compact>
        </Dropdown>
      ) : (
        <RangePicker
          value={selectedRange}
          onChange={values => {
            setSelectedRange(values);
            setCustomVisible(false);
          }}
          open
          allowClear={false}
        />
      )}
    </Space>
  );
};

export default DateRangeSelector;
