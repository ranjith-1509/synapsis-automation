import React from "react";
import { Upload } from "antd";
import MainLayout from "../components/Layout/MainLayout";
import { ChevronRightIcon, FolderIcon } from "../components/icons/Icons";
import WorkFlow from "../components/icons/WorkFlow";

const AdminDocument = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl  h-full mx-auto  sm:px-6 lg:px-8 " style={{ marginLeft: "200px" }}>
        <div
          style={{ borderRadius: "24px" }}
          className="bg-white border border-gray-200  overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">MOA AI Work Flow</h1>
              <p className="text-sm text-gray-500 mt-1">Upload your medical documents </p>
            </div>
            <div className="flex gap-3">
              <Upload
                directory
                accept=".pdf"
                showUploadList={false}
                // beforeUpload={handleBeforeUpload}
                // onRemove={(file) =>
                //   setFileList(fileList.filter((f) => f.uid !== file.uid))
                // }
              >
                <div className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                  <FolderIcon className="h-8 w-8 text-blue-500" fill="#000" />
                  Select Folder
                </div>
              </Upload>

              <button
                //onClick={openNotification}
                className="px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2"
              >
                <ChevronRightIcon className="h-8 w-8 text-blue-500" />
                Move File
              </button>
            </div>
          </div>

          {/* Table directly under header, no extra border */}
          <div style={{ minHeight: "30rem" }}>
            <WorkFlow />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDocument;
