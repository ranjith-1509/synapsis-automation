import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Form, message } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const AddLabelModal = ({ open, onClose, onSave, loading }) => {
  const [form] = Form.useForm();
  const [inputFields, setInputFields] = useState([{ id: 1, value: "" }]);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setInputFields([{ id: 1, value: "" }]);
      form.resetFields();
    }
  }, [open, form]);

  const handleAddField = () => {
    const newId = Math.max(...inputFields.map((f) => f.id), 0) + 1;
    setInputFields([...inputFields, { id: newId, value: "" }]);
  };

  const handleRemoveField = (id) => {
    if (inputFields.length > 1) {
      setInputFields(inputFields.filter((field) => field.id !== id));
      // Also remove from form
      const fieldName = `label_${id}`;
      form.setFieldValue(fieldName, undefined);
    } else {
      message.warning("At least one input field must be present");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Extract all label values
      const labels = inputFields
        .map((field) => {
          const fieldName = `label_${field.id}`;
          return values[fieldName]?.trim();
        })
        .filter((label) => label && label.length > 0);

      // Validate: no empty strings
      if (labels.length === 0) {
        message.error("Please enter at least one valid label name");
        return;
      }

      const uniqueLabels = [...new Set(labels)];
      if (uniqueLabels.length !== labels.length) {
        message.warning("Duplicate labels will be ignored");
      }

      await onSave(uniqueLabels);
      setInputFields([{ id: 1, value: "" }]);
      form.resetFields();
      onClose();
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setInputFields([{ id: 1, value: "" }]);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Add New Labels"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      className="add-label-modal"
    >
      <Form form={form} layout="vertical">
        <div style={{ marginBottom: 24 }}>
          {inputFields.map((field, index) => (
            <Form.Item
              key={field.id}
              name={`label_${field.id}`}
              rules={[
                {
                  required: true,
                  message: "Please enter a label name",
                },
                {
                  whitespace: true,
                  message: "Label name cannot be empty",
                },
              ]}
              style={{ marginBottom: 16 }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Input
                  placeholder={`Label ${index + 1}`}
                  style={{ flex: 1 }}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    if (index === inputFields.length - 1) {
                      handleAddField();
                    }
                  }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddField}
                  title="Add another field"
                />
                {inputFields.length > 1 && (
                  <Button
                    type="default"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleRemoveField(field.id)}
                    title="Remove this field"
                  />
                )}
              </div>
            </Form.Item>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSave} loading={loading}>
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddLabelModal;
