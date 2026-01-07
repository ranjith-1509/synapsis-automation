import React, { useState, useEffect } from "react";
import { Button, message, Table, Upload, Input, Form, Popconfirm } from "antd";
import MainLayout from "../components/Layout/MainLayout";
import NoDataIcon from "../components/icons/noDataIcon";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import AddLabelModal from "../Modals/AddLabelModal";
import { getLabels, createLabel, updateLabel, deleteLabel } from "../services/labelsApi";

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

const DiagnosisCatalog = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const data = await getLabels();
      setDataSource(data);
    } catch (error) {
      message.error("Failed to load labels");
    } finally {
      setLoading(false);
    }
  };

  const isEditing = (record) => (record.id || record.key) === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ name: record.name });
    setEditingKey(record.id || record.key);
  };

  const cancel = () => {
    setEditingKey("");
    form.resetFields();
  };
  const handleDelete = async (record) => {
    try {
      await deleteLabel(record.id || record.key);
      await fetchLabels();
      message.success("Label deleted successfully");
    } catch (error) {
      message.error("Failed to delete label");
    }
  };

  const save = async (id) => {
    try {
      const { name } = await form.validateFields();
      await updateLabel(id, name);
      setEditingKey("");
      await fetchLabels();
      message.success("Label updated successfully");
    } catch (error) {
      if (error.errorFields) return;
      message.error("Failed to update label");
    }
  };

  const handleCellClick = (record, columnKey) => {
    const editableColumns = ["name"];
    const recordId = record.id || record.key;
    if (editableColumns.includes(columnKey) && editingKey !== recordId) {
      edit(record);
    }
  };

  const handleAddLabels = async (labels) => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const keys = dataSource.map((item) => parseInt(item.key || item.id || 0));
      const maxKey = keys.length > 0 ? Math.max(...keys) : 0;

      const labelData = labels.map((name, index) => ({
        key: String(maxKey + index + 1),
        name,
        createdAt: today,
      }));

      console.log("Sending label data:", labelData); // Debug log
      await createLabel(labelData);
      await fetchLabels();
      message.success(`Successfully added ${labels.length} label(s)`);
    } catch (error) {
      message.error("Failed to add labels");
    } finally {
      setSaving(false);
    }
  };

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
              <h1 className="text-lg font-semibold text-gray-900">Diagnosis Catalog</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your diagnosis catalog</p>
            </div>
            <div className="flex gap-3">
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Label
              </Button>
            </div>
          </div>

          {/* Table directly under header, no extra border */}
          <div style={{ minHeight: "30rem" }}>
            <Form form={form} component={false}>
              <Table
                loading={loading}
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                rowKey={(record) => record.id || record.key}
                columns={[
                  {
                    title: "SNO",
                    key: "sno",
                    width: 80,
                    render: (_, __, index) => (
                      <span className="text-[14px] font-normal text-[#667085]">{index + 1}</span>
                    ),
                  },
                  {
                    title: "Name",
                    dataIndex: "name",
                    key: "name",
                    editable: true,
                    render: (text) => (
                      <span
                        className="text-[14px] font-normal text-[#667085]"
                        style={{ cursor: "pointer" }}
                      >
                        {text}
                      </span>
                    ),
                  },

                  {
                    title: "Created At",
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (date) => (
                      <span className="text-[14px] font-normal text-[#667085]">
                        {date || "N/A"}
                      </span>
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
                            onClick={() => save(record.id || record.key)}
                            style={{ padding: 0, color: "#1890ff" }}
                          >
                            Save
                          </Button>
                          <Button
                            type="link"
                            onClick={cancel}
                            style={{ padding: 0, color: "#666" }}
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
                          <Popconfirm
                            title="Delete label?"
                            description="Do you want to remove this label from the list?"
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
                      inputType: "text",
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

      <AddLabelModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLabels}
        loading={saving}
      />
    </MainLayout>
  );
};

export default DiagnosisCatalog;
