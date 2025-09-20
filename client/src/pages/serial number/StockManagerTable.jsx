/* eslint-disable react/prop-types */
import { Table } from "antd";

function StockManagerTable({ products, columns, pagination }) {
  const totalProductsCount = products.length;

  // Custom footer for the table
  const tableFooter = () => (
    <div className="table-footer">
      <h1>Total Products: {totalProductsCount}</h1>
    </div>
  );

  return (
    <Table
      dataSource={products}
      columns={columns}
      pagination={pagination} // Disable pagination
      rowKey={(record) => record.productId}
      title={() => "Stock Manager"}
      footer={tableFooter}
      className="customTable"
    />
  );
}

export default StockManagerTable;
