import React, { useState } from 'react';
import { Table } from 'antd';
import DataSource from '../JSON/dataSource.json';
import MainLayout from '../components/Layout/MainLayout';

const SearchDataTransfer = () => {
  const [dataSource] = useState(DataSource);

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text) => (
        <span className="text-[14px] font-normal text-[#667085]">
          {text}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text) => (
        <span className="text-[14px] font-normal text-[#667085]">
          {text}
        </span>
      ),
    },
    {
      title: "Matched Tag",
      dataIndex: "matchedTag",
      key: "matchedTag",
      render: (tags) => (
        <div className="flex gap-1">
          {tags && tags.map((tag) => (
            <span
              key={tag}
              className="text-[14px] font-normal text-[#667085]"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => (
        <div className="flex items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#ECFDF3] text-[#027A48]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] mr-2"></span>
            Completed
          </span>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Search Data Transfer</h2>
          <p className="text-sm text-gray-500 mt-1">Search and transfer data across systems</p>
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          className="custom-table"
        />
      </div>
    </MainLayout>
  );
};

export default SearchDataTransfer;

