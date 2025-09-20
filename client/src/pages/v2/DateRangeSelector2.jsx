import { useState } from 'react';
import { Button, DatePicker, Dropdown, Input, Space } from 'antd';
import { DownOutlined, MenuOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useStore } from '../../store/store';

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

const DateRangeSelector2 = () => {
  // eslint-disable-next-line no-unused-vars
  const { selectedDateMultiDash, setSelectedDateMultiDash } = useStore();
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
      setSelectedDateMultiDash(presetRanges[key]);
      setCustomVisible(false);
    }
  };
  const rangePresets = [
    { label: 'Today', value: [dayjs(), dayjs()] },
    { label: 'Yesterday', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
    { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'Last Week', value: [dayjs().subtract(1, 'week').startOf('week'), dayjs().subtract(1, 'week').endOf('week')] },
    { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Year To Date', value: [dayjs().startOf('year'), dayjs()] },
    { label: 'All Time', value: [dayjs('2000-01-01'), dayjs()] }
  ];

  return (
    <Space>
      {!customVisible ? (
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={['click']}
        >
          <span>
            <Space.Compact className='mmm' block>
                <Input
                readOnly
                value={`${selectedDateMultiDash[0].format('MMM D, YYYY')} - ${selectedDateMultiDash[1].format('MMM D, YYYY')}`}
                suffix={<DownOutlined />}
                style={{ width: 250, cursor: 'pointer' }}
                />
                <Button className='flex align-items-center'><MenuOutlined /></Button>
            </Space.Compact>
          </span>
        </Dropdown>
      ) : (
            <RangePicker
              presets={rangePresets}
              value={selectedDateMultiDash}
              onChange={values => {
                setSelectedDateMultiDash(values);
                setCustomVisible(false);
              }}
              defaultOpen={true}
              allowClear={false}
            />            
      )}
    </Space>
  );
};

export default DateRangeSelector2;
