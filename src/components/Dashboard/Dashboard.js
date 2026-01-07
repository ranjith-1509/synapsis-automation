import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Upload, message, Tooltip, Popconfirm, Input, App } from "antd";
import "antd/dist/reset.css";
import { ChevronRightIcon, FolderIcon, InfoCircle } from "../icons/Icons";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import NoDataIcon from "../icons/noDataIcon";
import DataSource from "../../JSON/dataSource.json";
import Lottie from "lottie-react";
import LottieLoading from "../../images/lottieLoading.json";
import ProcessingLoader from "../ProcessingLoader/ProcessingLoader";
import MainLayout from "../Layout/MainLayout";
import ReferalModal from "../../Modals/ReferalModal";

const Dashboard = ({ onProcessingChange }) => {
  const { notification } = App.useApp(); // ✅ access notification instance

  const [dataSource, setDataSource] = useState(DataSource);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [data, setData] = useState(() => {
    // Load data from localStorage on component mount
    const savedData = localStorage.getItem("moa-ai-table-data");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [fileList, setFileList] = useState([]);

  const referralInfo = [
    "Specialist Name: Dr. Emily Turner",
    "Receiving Physician: Dr. Michael Clark",
    "Patient Name: Mr. David Lee",
    "Patient ID: 484211",
    "Main Medical Problem: Mild knee pain from sports injury",
    "Consultation Type: Physiotherapy referral",
    "Outcome Indicated: Recommended strengthening exercises",
  ];
  const handleBeforeUpload = (file) => {
    setFileList((prevList) => [...prevList, file]);
    // Prevent automatic upload
    return false;
  };
  console.log(fileList.length, "ter");
  const handleRowClick = (record) => {
    setSelectedFile(record);
    setIsModalOpen(true);
  };

  const handleViewPdf = () => {
    window.open(
      "/static/media/SampleReport.c9816094713b54396c84.pdf",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDelete = (record) => {
    setDataSource((prev) => prev.filter((item) => item.key !== record.key));
    // Also remove from the processed data
    const updatedData = data.filter((item) => item.key !== record.key);
    setData(updatedData);
    // Update localStorage
    localStorage.setItem("moa-ai-table-data", JSON.stringify(updatedData));
    message.success("File removed from list");
    try {
      const updated = dataSource.filter((item) => item.key !== record.key);
      localStorage.setItem("moa-ai-dataSource", JSON.stringify(updated));
    } catch (e) {
      // ignore persistence errors
    }
  };

  const addAuditLog = (logData) => {
    const auditLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      ...logData,
    };

    const existingLogs = JSON.parse(localStorage.getItem("moa-ai-audit-logs") || "[]");
    existingLogs.unshift(auditLog);
    localStorage.setItem("moa-ai-audit-logs", JSON.stringify(existingLogs));
  };

  const handleUploadClick = async () => {
    if (fileList.length === 0) {
      message.error("Please select files first.");
      return;
    }

    // Get current user info from localStorage
    const currentUser = JSON.parse(localStorage.getItem("moa-ai-audit-logs") || "[]")[0];
    const userEmail = currentUser?.userId || "demo@moa-ai.com";
    const userRole = currentUser?.role || "Intake Clerk";

    // Add audit log for upload initiation
    addAuditLog({
      role: userRole,
      roleColor:
        userRole === "Intake Clerk" ? "blue" : userRole === "Privacy Officer" ? "purple" : "red",
      message: `${userEmail} initiated upload of ${fileList.length} document(s) to AI Smart Sorter`,
      action: "upload_start",
      fileCount: fileList.length,
      userId: userEmail,
    });

    setLoading(true);
    if (onProcessingChange) onProcessingChange(true); // Start processing animation

    const formData = new FormData();
    fileList.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("http://127.0.0.1:8085/process-folder/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setData(data?.results);
      // Save data to localStorage for persistence
      localStorage.setItem("moa-ai-table-data", JSON.stringify(data?.results || []));
      message.success("Upload successful!");
      console.log(data);

      // Add audit log for successful processing
      addAuditLog({
        role: "Smart Sorter",
        roleColor: "cyan",
        message: `AI successfully processed ${fileList.length} document(s) for ${userEmail} - classification completed`,
        action: "ai_processing_complete",
        fileCount: fileList.length,
        userId: userEmail,
      });

      // Add audit log for AI classification results
      if (data?.results && data.results.length > 0) {
        data.results.forEach((result, index) => {
          setTimeout(
            () => {
              addAuditLog({
                role: "Smart Sorter",
                roleColor: "cyan",
                message: `auto-classified document as ${result.category || "Medical"} (${result.severity || "Medium"} severity)`,
                action: "ai_classification",
                fileName: result.fileName || `document_${index + 1}.pdf`,
              });
            },
            (index + 1) * 1000
          ); // Stagger the logs
        });
      }

      setTimeout(() => {
        setLoading(false);
        if (onProcessingChange) onProcessingChange(false); // Stop processing animation
      }, 5000);
      setFileList([]);
    } catch (error) {
      message.error("Upload failed");

      // Add audit log for failed processing
      addAuditLog({
        role: "System",
        roleColor: "red",
        message: `upload failed for ${userEmail} - ${fileList.length} document(s) could not be processed`,
        action: "upload_failed",
        fileCount: fileList.length,
        userId: userEmail,
      });

      setLoading(false);
      if (onProcessingChange) onProcessingChange(false); // Stop processing animation
      setFileList([]);
    } finally {
      setLoading(false);
      if (onProcessingChange) onProcessingChange(false); // Stop processing animation
      setFileList([]);
    }
  };

  const openNotification = () => {
    notification.open({
      message: <div style={{ fontWeight: 600, color: "#1d4ed8" }}>Sensitive Data</div>,
      description: (
        <div className="toast_typo" style={{ fontSize: 14, color: "#475569" }}>
          Routed + Redacted in 2 Seconds
          <div style={{ marginTop: 8 }}>
            <a
              href="#"
              style={{
                color: "#6c7d7d",
                fontWeight: 500,
                marginRight: 12,
              }}
            >
              Learn more
            </a>
            <a
              href="#"
              style={{
                color: "#2563eb",
                fontWeight: 500,
              }}
            >
              Dismiss
            </a>
          </div>
        </div>
      ),
      placement: "bottomRight",
      icon: <InfoCircle style={{ color: "#2563eb" }} />,
      duration: 0, // stays until dismissed
      style: {
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        padding: "12px 16px",
      },
    });
  };
  return (
    <MainLayout>
      {/* Card Section — Header + Table unified */}
      <div className="max-w-7xl  h-full mx-auto  sm:px-6 lg:px-8 " style={{ marginLeft: "200px" }}>
        <div
          style={{ borderRadius: "24px" }}
          className="bg-white border border-gray-200  overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-gray-200">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Smart PDF Sorter</h1>
              <p className="text-sm text-gray-500 mt-1">Upload your medical documents</p>
            </div>
            <div className="flex gap-3">
              {fileList.length > 0 ? (
                <button
                  onClick={handleUploadClick}
                  className="px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2"
                >
                  <FolderIcon className="h-8 w-8 " fill="#fff" />
                  Process Folder
                </button>
              ) : (
                <Upload
                  directory
                  accept=".pdf"
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  fileList={fileList}
                  onRemove={(file) => setFileList(fileList.filter((f) => f.uid !== file.uid))}
                >
                  <div className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                    <FolderIcon className="h-8 w-8 text-blue-500" fill="#000" />
                    Select Folder
                  </div>
                </Upload>
              )}

              <button
                onClick={openNotification}
                className="px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2"
              >
                <ChevronRightIcon className="h-8 w-8 text-blue-500" />
                Move File
              </button>
            </div>
          </div>

          {/* Table directly under header, no extra border */}
          <div style={{ minHeight: "30rem" }}>
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="flex flex-col items-center">
                  <Lottie
                    style={{
                      width: "45rem",
                      height: "25rem",
                      marginBottom: "0px",
                    }}
                    animationData={LottieLoading}
                    loop={true}
                  />
                  <div className="-mt-2">
                    <ProcessingLoader processed={2} total={fileList?.length} />
                  </div>
                </div>
              </div>
            ) : (
              <Table
                style={{ opacity: loading ? 0.5 : 1 }}
                columns={[
                  {
                    title: "File Name",
                    dataIndex: "fileName",
                    key: "fileName",
                    render: (text) => (
                      <span className="text-[14px] font-normal text-[#667085]">{text}</span>
                    ),
                  },
                  {
                    title: "Category",
                    dataIndex: "category",
                    key: "category",
                    render: (text) => (
                      <span className="text-[14px] font-normal text-[#667085]">{text}</span>
                    ),
                  },
                  {
                    title: "Tag",
                    dataIndex: "tags",
                    key: "tags",
                    render: (tags) => {
                      // Split the string by comma, trim spaces, filter out empty strings
                      const tagsArray = tags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean);

                      return (
                        <div className="flex gap-1">
                          {tagsArray.map((tag) => (
                            <span key={tag} className="text-[14px] font-normal text-[#667085]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      );
                    },
                  },
                  {
                    title: "Reasoning",
                    dataIndex: "reason",
                    key: "reason",
                    render: (text) => (
                      <span className="text-[14px] font-normal text-[#4b5563]">{text}</span>
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
                          Processed
                        </span>
                      </div>
                    ),
                  },
                  {
                    title: "Action",
                    key: "action",
                    render: (_, record) => (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                        }}
                      >
                        <Tooltip title="View Report">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPdf();
                            }}
                          />
                        </Tooltip>

                        <Popconfirm
                          title="Delete file?"
                          description="Do you want to remove this file from the list?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={(e) => {
                            if (e) e.stopPropagation();
                            handleDelete(record);
                          }}
                          onCancel={(e) => {
                            if (e) e.stopPropagation();
                          }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </div>
                    ),
                  },
                ]}
                dataSource={data}
                pagination={false}
                className="custom-table"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  style: { cursor: "pointer" },
                })}
                // loading={{
                //   spinning: loading, // <-- Ant Design built-in spinner
                //   indicator: (
                //     <div className="flex justify-center items-center">
                //       <div className="w-10 h-32">
                //         <Lottie animationData={LottieLoading} loop={true} />
                //       </div>
                //     </div>
                //   ),
                // }}
                locale={{
                  emptyText: (
                    <div className="flex flex-col items-center justify-center">
                      <div className="cursor-pointer">
                        <Upload>
                          <NoDataIcon />
                        </Upload>
                      </div>
                    </div>
                  ),
                }}
              />
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <ReferalModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Referral Extractor Review"
          data={referralInfo}
          score={selectedFile.confidence}
        />
      )}
    </MainLayout>
  );
};

export default Dashboard;
