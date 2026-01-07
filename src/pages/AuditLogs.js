import React, { useState, useEffect } from "react";
import { Tag, Card, Button, Space } from "antd";
import { ReloadOutlined, ClearOutlined } from "@ant-design/icons";
import MainLayout from "../components/Layout/MainLayout";
import "./AuditLogs.css";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default dummy logs for initial display
  const defaultLogs = [
    {
      id: 1,
      timestamp: "2025-10-23 11:42:17 AM",
      role: "Privacy Officer",
      roleColor: "purple",
      message: "approved referral for patient Ms. Nivedita Sharma",
    },
    {
      id: 2,
      timestamp: "2025-10-23 11:31:02 AM",
      role: "Intake Clerk",
      roleColor: "blue",
      message: "uploaded document Dr. RajeshKumar_0012_55921.pdf",
    },
    {
      id: 3,
      timestamp: "2025-10-23 11:15:44 AM",
      role: "Smart Sorter",
      roleColor: "cyan",
      message: "auto-classified a file as Referral (High severity)",
    },
    {
      id: 4,
      timestamp: "2025-10-23 10:59:30 AM",
      role: "IT Admin",
      roleColor: "red",
      message: "updated permissions for Privacy Officer role",
    },
    {
      id: 5,
      timestamp: "2025-10-23 10:45:01 AM",
      role: "System",
      roleColor: "green",
      message: "Referral report Dr. SnehaVarma_0014_56233.pdf moved to Completed status",
    },
    {
      id: 6,
      timestamp: "2025-10-23 10:30:22 AM",
      role: "System",
      roleColor: "green",
      message: "log: 14 new documents processed successfully",
    },
    {
      id: 7,
      timestamp: "2025-10-23 10:18:45 AM",
      role: "Privacy Officer",
      roleColor: "purple",
      message: "reviewed and approved medical document for patient Mr. Arjun Patel",
    },
    {
      id: 8,
      timestamp: "2025-10-23 10:05:33 AM",
      role: "Intake Clerk",
      roleColor: "blue",
      message: "uploaded batch of 5 referral documents",
    },
    {
      id: 9,
      timestamp: "2025-10-23 09:52:18 AM",
      role: "Smart Sorter",
      roleColor: "cyan",
      message: "auto-tagged document with categories: Medical, Urgent, Referral",
    },
    {
      id: 10,
      timestamp: "2025-10-23 09:40:11 AM",
      role: "IT Admin",
      roleColor: "red",
      message: "created new user account for Dr. Meera Singh",
    },
    {
      id: 11,
      timestamp: "2025-10-23 09:28:07 AM",
      role: "Privacy Officer",
      roleColor: "purple",
      message: "flagged document Dr. AnilGupta_0021_58471.pdf for further review",
    },
    {
      id: 12,
      timestamp: "2025-10-23 09:15:55 AM",
      role: "System",
      roleColor: "green",
      message: "automated backup completed successfully - 342 files backed up",
    },
    {
      id: 13,
      timestamp: "2025-10-23 09:03:42 AM",
      role: "Intake Clerk",
      roleColor: "blue",
      message: "updated patient information for referral ID #55921",
    },
    {
      id: 14,
      timestamp: "2025-10-23 08:51:29 AM",
      role: "Smart Sorter",
      roleColor: "cyan",
      message: "detected duplicate document - merged with existing record",
    },
    {
      id: 15,
      timestamp: "2025-10-23 08:40:16 AM",
      role: "IT Admin",
      roleColor: "red",
      message: "updated system configuration for document retention policy",
    },
  ];

  // Load logs from localStorage or use defaults
  useEffect(() => {
    const loadLogs = () => {
      const storedLogs = JSON.parse(localStorage.getItem("moa-ai-audit-logs") || "[]");
      if (storedLogs.length > 0) {
        setLogs(storedLogs);
      } else {
        setLogs([]);
      }
    };

    loadLogs();

    // Set up interval to check for new logs
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const refreshLogs = () => {
    setLoading(true);
    const storedLogs = JSON.parse(localStorage.getItem("moa-ai-audit-logs") || "[]");
    if (storedLogs.length > 0) {
      setLogs(storedLogs);
    } else {
      setLogs(defaultLogs);
    }
    setTimeout(() => setLoading(false), 500);
  };

  const displayLogs = logs.length > 0 ? logs : [];

  return (
    <MainLayout>
      <div className="max-w-7xl  h-full mx-auto  sm:px-6 lg:px-8 " style={{ marginLeft: "200px" }}>
        <div
          style={{ borderRadius: "24px" }}
          className="bg-white border border-gray-200  overflow-hidden shadow-sm"
        >
          {/* Header */}
          <div className="p-6 pb-0 flex justify-between items-center border-b border-gray-200">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time activity tracking and system events
              </p>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={refreshLogs}
                loading={loading}
                size="small"
              >
                Refresh
              </Button>
            </Space>
          </div>

          {/* Table directly under header, no extra border */}

          <div className="audit-logs-container">
            {displayLogs.length > 0 ? (
              displayLogs.map((log) => (
                <div key={log.id} className="audit-log-entry">
                  <div className="audit-log-header">
                    <span className="audit-log-timestamp">{log.timestamp}</span>
                    <Tag color={log.roleColor} className="audit-log-tag">
                      {log.role}
                    </Tag>
                  </div>
                  <div className="audit-log-message">{log.message}</div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Logs</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    No activity has been recorded yet. Start using the system to see audit logs
                    here.
                  </p>
                  <div className="text-xs text-gray-400">
                    Login and upload documents to generate audit entries
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AuditLogs;
