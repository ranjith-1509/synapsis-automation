import React, { useState } from 'react';
import { Button, message, Popconfirm, Table, Tooltip, Upload, Input, Form } from 'antd';
import DataSource from '../JSON/medicalDocument.json';
import MainLayout from '../components/Layout/MainLayout';
import { ChevronRightIcon, FolderIcon } from '../components/icons/Icons';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import NoDataIcon from '../components/icons/noDataIcon';
import './AdminDocument.css';
import ReferalModal from '../Modals/ReferalModal';

const EditableCell = ({ 
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const MedicalDocument = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource ] = useState(DataSource);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      category: '',
      tags: '',
      reason: '',
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
    form.resetFields();
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);
      
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setDataSource(newData);
        setEditingKey('');
        message.success('Record updated successfully');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const handleCellClick = (record, columnKey) => {
    const editableColumns = ['category', 'tags', 'reason'];
    if (editableColumns.includes(columnKey) && editingKey !== record.key) {
      edit(record);
    }
  };

  const handleDelete = (record) => {
    setDataSource((prev) => prev.filter((item) => item.key !== record.key));
    message.success("File removed from list");
    try {
      const updated = dataSource.filter((item) => item.key !== record.key);
      localStorage.setItem("moa-ai-dataSource", JSON.stringify(updated));
    } catch (e) {
      // ignore persistence errors
    }
  };
  const handleViewPdf = () => {
    window.open("/static/media/SampleReport.c9816094713b54396c84.pdf", "_blank", "noopener,noreferrer");
  };
  
  const handleRowClick = (record) => {
    if (!isEditing(record)) {
      setSelectedFile(record);
      setIsModalOpen(true);
    }
  };

  const getRowClassName = (record) => {
    if (isEditing(record)) return '';
    
    switch(record.severityLevel) {
      case 'High':
        return 'severity-high';
      case 'Medium':
        return 'severity-medium';
      case 'Low':
        return '';
      case 'None':
        return '';
      default:
        return '';
    }
  };

  return (
    <MainLayout>
    <div
          className="max-w-7xl  h-full mx-auto  sm:px-6 lg:px-8 "
          style={{ marginLeft: "200px" }}
        >
          <div
            style={{ borderRadius: "24px" }}
            className="bg-white border border-gray-200  overflow-hidden shadow-sm"
          >
            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-gray-200">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Medical Document   
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your medical   documents
                </p>
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
              <Form form={form} component={false}>
                <Table
                  components={{
                    body: {
                      cell: EditableCell,
                    },
                  }}
                  columns={[
                    {
                      title: "File Name",
                      dataIndex: "fileName",
                      key: "fileName",
                      render: (text) => (
                        <span className="text-[14px] font-normal text-[#667085]">
                          {text}
                        </span>
                      ),
                      onCell: (record) => ({
                        onClick: () => handleRowClick(record),
                        style: { cursor: 'pointer' },
                      }),
                    },
                    {
                      title: "Category",
                      dataIndex: "category",
                      key: "category",
                      editable: true,
                      render: (text) => (
                        <span className="text-[14px] font-normal text-[#667085]" style={{ cursor: 'pointer' }}>
                          {text}
                        </span>
                      ),
                    },
                    {
                      title: "Tag",
                      dataIndex: "tags",
                      key: "tags",
                      editable: true,
                      render: (tags) => {
                        if (!tags) return null;
                        // Split the string by comma, trim spaces, filter out empty strings
                        const tagsArray = tags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean);

                        return (
                          <div className="flex gap-1" style={{ cursor: 'pointer' }}>
                            {tagsArray.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[14px] font-normal text-[#667085]"
                              >
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
                      editable: true,
                      render: (text) => (
                        <span className="text-[14px] font-normal text-[#4b5563]" style={{ cursor: 'pointer' }}>
                          {text}
                        </span>
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
                      render: (_, record) => {
                        const editable = isEditing(record);
                        return editable ? (
                          <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Button
                              type="link"
                              onClick={() => save(record.key)}
                              style={{ padding: 0, color: '#1890ff' }}
                            >
                              Save
                            </Button>
                            <Button
                              type="link"
                              onClick={cancel}
                              style={{ padding: 0, color: '#666' }}
                            >
                              Cancel
                            </Button>
                          </span>
                        ) : (
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
                        );
                      },
                    },
                  ].map((col) => {
                    if (!col.editable) {
                      return col;
                    }
                    const { onCell: originalOnCell, ...restCol } = col;
                    return {
                      ...restCol,
                      onCell: (record) => ({
                        record,
                        inputType: 'text',
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: isEditing(record),
                        onClick: () => handleCellClick(record, col.dataIndex),
                      }),
                    };
                  })}
                  dataSource={dataSource}
                  pagination={false}
                  className="custom-table"
                  rowClassName={getRowClassName}
                  onRow={(record) => ({
                    style: { cursor: isEditing(record) ? "default" : "pointer" },
                  })}
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
              </Form>
              
            </div>
          </div>
        </div>
        
        {isModalOpen && <ReferalModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Referral Extractor Review"
        data={selectedFile.referralInfo}
        score={selectedFile.confidence}
      />}
    </MainLayout>
  );
};

export default MedicalDocument;

