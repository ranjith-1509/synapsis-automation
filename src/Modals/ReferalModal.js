import { useState } from "react";
import { Modal, Drawer, Button, Tag, Input, Card, Space, Divider, Typography, Tooltip } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  CalendarOutlined,
  SendOutlined,
  CloseOutlined,
  SafetyOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import "./ReferalModal.css";

const { TextArea } = Input;
const { Text, Title } = Typography;

// Utility for confidential score color logic
const getTagColor = (score) => {
  if (score >= 70) {
    return {
      bg: "#E6F4EA",
      text: "#0F5132",
      dot: "#198754",
      label: "High (Safe)",
    };
  } else if (score >= 40) {
    return {
      bg: "#FFF8E1",
      text: "#664D03",
      dot: "#FFC107",
      label: "Medium (Caution)",
    };
  } else {
    return {
      bg: "#F8D7DA",
      text: "#842029",
      dot: "#DC3545",
      label: "Low (Risk)",
    };
  }
};

// Data masking utilities
const maskName = (name) => {
  const parts = name.split(" ");
  return parts
    .map((part, idx) => {
      if (idx === 0) return part;
      const firstChar = part[0];
      const masked = firstChar + "***";
      return masked;
    })
    .join(" ");
};

const maskPatientId = (id) => {
  if (id.length <= 4) return id;
  const first = id.substring(0, 2);
  const last = id.substring(id.length - 2);
  return `${first}•••${last}`;
};

const maskPhone = (phone) => {
  const cleaned = phone.replace(/\s/g, "");
  if (cleaned.length < 8) return phone;
  const prefix = cleaned.substring(0, 6);
  const suffix = cleaned.substring(cleaned.length - 2);
  return `${prefix}••• ${suffix}••`;
};

const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (local.length <= 3) return email;
  const masked = local.substring(0, 3) + "***";
  return `${masked}@${domain}`;
};

const ReferalModal = ({
  open,
  onClose,
  title = "Referral Extractor Review",
  data = [],
  onPrimaryAction,
  primaryLabel = "Respond",
  secondaryLabel = "Dismiss",
  width = 900,
  score = 80,
}) => {
  const { bg, text, dot, label } = getTagColor(score);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messagetobeSent, setMessage] = useState("");

  // Dummy Patient Info
  const patientDetails = {
    name: "Mr. Prakash Nair",
    patientId: "459871",
    contact: "+91 98765 43210",
    email: "prakash.nair@example.com",
    age: "45",
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    //alert("Copied!");
  };

  const InfoField = ({ icon, label, value, masked = false }) => (
    <div className="info-field-row">
      <div className="info-field-icon-wrapper">{icon}</div>
      <div className="info-field-content">
        <Text className="info-field-label">{label}</Text>
        <div className="info-field-value-row">
          <Text strong className="info-field-value">
            {value}
          </Text>
          <div className="info-field-actions">
            {masked && <SafetyOutlined className="info-field-shield" />}
            <Tooltip title="Copy">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(value, label)}
                className="copy-button"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Referral Review Modal */}
      <Modal
        title={
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{title}</span>
              <Tag
                style={{
                  backgroundColor: bg,
                  border: "none",
                  borderRadius: "10px",
                  padding: "4px 10px",
                }}
                className="ml-3 flex items-center gap-2"
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: dot,
                    borderRadius: "50%",
                  }}
                ></div>
                <span style={{ color: text, fontWeight: 500 }}>
                  Confidential Score - {score}% ({label})
                </span>
              </Tag>
            </div>

            <Button
              type="primary"
              className="bg-[#0066EF] hover:bg-[#0052CC] rounded-lg"
              onClick={() => setDrawerOpen(true)}
            >
              Contact Patient
            </Button>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} className="rounded-lg">
              {secondaryLabel}
            </Button>
            <Button
              type="primary"
              className="bg-[#0066EF] hover:bg-[#0052CC] rounded-lg"
              onClick={onPrimaryAction}
            >
              {primaryLabel}
            </Button>
          </div>
        }
        width={width}
        closable={false}
        className="custom-modal"
      >
        {Array.isArray(data) && data.length > 0 ? (
          <div
            className="p-4 m-4"
            style={{
              border: "2px solid #EAECF0",
              borderRadius: "10px",
              backgroundColor: "#F9FAFB",
            }}
          >
            <ul className="list-decimal ml-6 mt-2 space-y-1 font-medium">
              {data.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-gray-500 text-sm mt-2">No data available.</div>
        )}
      </Modal>

      {/* Enhanced Contact Drawer */}
      <Drawer
        title={
          <div className="drawer-header-content">
            <div className="drawer-title-wrapper">
              <div className="drawer-title-accent"></div>
              <div>
                <Title level={4} className="drawer-title">
                  Contact Patient
                </Title>
                <Text className="drawer-subtitle">Reach out to the patient securely</Text>
              </div>
            </div>
          </div>
        }
        placement="right"
        closable={false}
        closeIcon={<CloseOutlined className="drawer-close-icon" />}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={440}
        className="patient-contact-drawer"
      >
        {/* Drawer Body - No Scroll */}
        <div className="drawer-body-content">
          {/* Patient Info Card */}
          <Card className="patient-info-card" bordered={false}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <InfoField
                icon={<UserOutlined />}
                label="Patient Name"
                value={maskName(patientDetails.name)}
                masked={true}
              />

              <InfoField
                icon={<IdcardOutlined />}
                label="Patient ID"
                value={maskPatientId(patientDetails.patientId)}
                masked={true}
              />

              <InfoField
                icon={<PhoneOutlined />}
                label="Contact"
                value={maskPhone(patientDetails.contact)}
                masked={true}
              />

              <InfoField
                icon={<MailOutlined />}
                label="Email"
                value={maskEmail(patientDetails.email)}
                masked={true}
              />

              <InfoField
                icon={<CalendarOutlined />}
                label="Age"
                value={`${patientDetails.age} years`}
                masked={false}
              />
            </Space>
          </Card>

          {/* Security Notice */}
          <div className="security-notice">
            <SafetyOutlined className="security-icon" />
            <Text className="security-text">All data is encrypted and HIPAA compliant</Text>
          </div>

          {/* Message Section */}
          <div className="message-section">
            <div className="message-header">
              <Text className="message-label">Your Message</Text>
              <Tag className="optional-tag">Optional</Tag>
            </div>
            <TextArea
              placeholder="Type your secure message here..."
              value={messagetobeSent}
              onChange={(e) => setMessage(e.target.value)}
              className="message-textarea"
              maxLength={500}
              showCount
              style={{ height: "100%" }}
            />
          </div>

          {/* Action Buttons */}
          <div className="drawer-actions">
            <Button
              size="large"
              onClick={() => {
                setDrawerOpen(false);
                setMessage("");
              }}
              className="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              className="send-btn"
              onClick={() => {
                console.log("Message sent:", messagetobeSent);
                setDrawerOpen(false);
                setMessage("");
              }}
            >
              Send Message
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ReferalModal;
