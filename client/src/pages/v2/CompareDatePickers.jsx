import { useState } from 'react';
import { DatePicker, Space, Typography, Card } from 'antd';
import dayjs from 'dayjs';
import 'antd/dist/reset.css'; // Import Ant Design styles

const { RangePicker } = DatePicker;
const { Text } = Typography;

const CompareDatePickers = () => {
  const [currentRange, setCurrentRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [compareRange, setCompareRange] = useState([dayjs().subtract(14, 'day'), dayjs().subtract(7, 'day').subtract(1, 'day')]);

  // Function to disable dates for the "Compare" picker,
  // ensuring it doesn't overlap with the "Current" range
  const disabledCompareDate = (current) => {
    if (!currentRange || currentRange.length !== 2) {
      return false;
    }
    const [currentStart, currentEnd] = currentRange;

    // Disable dates that are within the current range or after the current end date
    return (
      (current.isAfter(currentStart, 'day') && current.isBefore(currentEnd, 'day')) ||
      current.isSame(currentStart, 'day') ||
      current.isSame(currentEnd, 'day') ||
      current.isAfter(currentEnd, 'day')
    );
  };

  const handleCurrentRangeChange = (dates) => {
    setCurrentRange(dates);
    // Optionally, adjust compare range based on current range change
    // For example, if current range changes, shift compare range by the same duration
    if (dates && dates.length === 2 && currentRange && currentRange.length === 2) {
      const oldDuration = currentRange[1].diff(currentRange[0], 'day');
      const newDuration = dates[1].diff(dates[0], 'day');

      if (oldDuration !== newDuration) {
        // If duration changes, reset compare range or adjust proportionally
        setCompareRange([dates[0].subtract(newDuration, 'day'), dates[0].subtract(1, 'day')]);
      } else {
        const diff = dates[0].diff(currentRange[0], 'day');
        setCompareRange([compareRange[0].add(diff, 'day'), compareRange[1].add(diff, 'day')]);
      }
    }
  };

  // Define some preset ranges for quick selection
  const commonRanges = {
    'Last 7 Days': [dayjs().subtract(7, 'day'), dayjs()],
    'Last 30 Days': [dayjs().subtract(30, 'day'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
  };

  return (
    <Card title="Date Range Comparison" style={{ width: 600, margin: '20px auto' }}>
      <Space direction="vertical" size={20}>
        <div>
          <Text strong>Current Date Range:</Text>
          <RangePicker
            value={currentRange}
            onChange={handleCurrentRangeChange}
            ranges={commonRanges}
            allowClear={false} // Often helpful to prevent clearing in comparison scenarios
          />
        </div>
        <div>
          <Text strong>Compare To:</Text>
          <RangePicker
            value={compareRange}
            onChange={setCompareRange}
            disabledDate={disabledCompareDate} // Disable dates that overlap with the current range
            allowClear={false}
          />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <Text>
            Selected Current Range: {currentRange ? `${currentRange[0].format('YYYY-MM-DD')} to ${currentRange[1].format('YYYY-MM-DD')}` : 'None'}
          </Text>
          <br />
          <Text>
            Selected Compare Range: {compareRange ? `${compareRange[0].format('YYYY-MM-DD')} to ${compareRange[1].format('YYYY-MM-DD')}` : 'None'}
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default CompareDatePickers;