import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { SearchIcon } from '../icons/Icons';

const MainLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Header - Static for all pages */}
      <div className="px-6 pt-4">
        <div className="flex justify-between items-center">
          <div style={{ marginLeft: "230px" }}>
            <h1 style={{ display: "inline" }} className="p_content">
              Hi Preetam,
            </h1>
            <p className="text-xl font-semibold text-gray-900">
              Welcome to MOA AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-4">
              <div style={{ width: "400px", marginBottom: "5px" }}>
                <Input
                  placeholder="Search..."
                  style={{ borderRadius: "20px", height: "40px" }}
                  prefix={<SearchOutlined style={{ color: "#aaa" }} />}
                  className="custom-search-input"
                />
              </div>
              <SearchIcon className="w-12 h-12"/>

              <img
                className="h-10 w-10 rounded-full mb-2"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User profile"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-10xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;

