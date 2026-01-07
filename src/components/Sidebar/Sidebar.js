import React, { useState } from "react";
import { Layout, Button, Menu } from "antd";
import Logo from "../../images/Logo.png";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CheckCircleOutlined,
  FileOutlined,
  FileSearchOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ import navigation hook
import { AddCircle } from "../icons/Icons";
import SystemStatus from "../SystemStatus/SystemStatus";

const { Sider } = Layout;

const Sidebar = ({ onCollapse, isProcessing = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); // ✅ initialize navigation
  const location = useLocation(); // ✅ get current route

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapse) onCollapse(newCollapsed);
  };

  // Map routes to menu keys
  const routeMap = {
    "new-workflow": "/new-workflow",
    "smart-sorter": "/dashboard",
    "document-process": "/document-process",
    "admin-document": "/admin-document",
    "medical-document": "/medical-document",
    "search-data-transfer": "/search-data-transfer",
    "audit-logs": "/audit-logs",
    "diagnosis-catalog": "/diagnosis-catalog",
    "file-copy-test": "/file-copy-test",
    help: "/help",
    logout: "/login",
  };

  // Get current active key based on pathname
  const getActiveKey = () => {
    const currentPath = location.pathname;
    for (const [key, path] of Object.entries(routeMap)) {
      if (path === currentPath) {
        return key;
      }
    }
    return "smart-sorter"; // default
  };

  const handleMenuClick = (e) => {
    if (e.key === "logout") {
      localStorage.removeItem("token");
      sessionStorage.clear();
    }

    const route = routeMap[e.key];
    if (route) {
      navigate(route);
    }
  };

  const menuItems = [
    {
      key: "new-workflow",
      icon: <FileSearchOutlined />,
      label: "New Work Flow",
    },
    {
      key: "smart-sorter",
      icon: <CheckCircleOutlined />,
      label: "AI Smart Sorter",
    },
    {
      key: "document-process",
      icon: <FileOutlined />,
      label: "AI Document Process",
    },
  ];

  const projectItems = [
    {
      key: "new-project",
      icon: <FileOutlined />,
      label: (
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-10">
            <span>Add New Project</span>
            <AddCircle />
          </div>
        </div>
      ),
    },
    {
      key: "admin-document",
      icon: <FileOutlined />,
      label: "Admin Document",
    },
    {
      key: "medical-document",
      icon: <FileOutlined />,
      label: "Medical Document",
    },
  ];
  const logsItems = [
    {
      key: "audit-logs",
      icon: <FileOutlined />,
      label: "Audit Logs",
    },
  ];
  const adminItems = [
    {
      key: "diagnosis-catalog",
      icon: <SettingOutlined />,
      label: "Diagnosis Catalog",
    },
    {
      key: "file-copy-test",
      icon: <FileOutlined />,
      label: "File Copy Test",
    },
  ];

  const footerItems = [
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout Account",
      className: "logout-item",
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      collapsedWidth={60}
      className="sidebar"
      style={{
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Header with Logo and Toggle */}
      <div
        className="sidebar-header"
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={Logo} style={{ width: "70%", height: "100%" }} alt="Logo" />
          </div>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          style={{
            fontSize: "16px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>

      {/* MAIN Section */}
      <div
        style={{ padding: "20px 0", flex: 1, paddingBottom: "120px", overflowY: "auto" }}
        className="sidebar-scrollable"
      >
        <div>
          {!collapsed && (
            <div
              style={{
                fontSize: "10px",
                fontWeight: "500",
                color: "#8c8c8c",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingLeft: "16px",
              }}
            >
              MAIN
            </div>
          )}
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={[getActiveKey()]}
            style={{
              border: "none",
              background: "transparent",
              borderBottom: "1px solid #f0f0f0",
            }}
            className="main-menu sidebar_content_typo"
            onClick={handleMenuClick} // ✅ added click handler
          />
        </div>

        {/* PROJECT Section */}
        <div>
          {!collapsed && (
            <div
              className="mt-2"
              style={{
                fontSize: "10px",
                fontWeight: "500",
                color: "#8c8c8c",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingLeft: "16px",
              }}
            >
              PROJECT
            </div>
          )}
          <Menu
            mode="inline"
            items={projectItems}
            selectedKeys={[getActiveKey()]}
            style={{
              border: "none",
              background: "transparent",
              borderBottom: "1px solid #f0f0f0",
            }}
            className="project-menu sidebar_content_typo"
            onClick={handleMenuClick} // ✅ added click handler
          />
        </div>

        {/* Logs Section */}
        <div>
          {!collapsed && (
            <div
              className="mt-2"
              style={{
                fontSize: "10px",
                fontWeight: "500",
                color: "#8c8c8c",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingLeft: "16px",
              }}
            >
              Logs
            </div>
          )}
          <Menu
            mode="inline"
            items={logsItems}
            selectedKeys={[getActiveKey()]}
            style={{
              border: "none",
              background: "transparent",
              borderBottom: "1px solid #f0f0f0",
            }}
            className="project-menu sidebar_content_typo"
            onClick={handleMenuClick} // ✅ added click handler
          />
        </div>
        {/* Admin Panel Section */}
        <div>
          {!collapsed && (
            <div
              className="mt-2"
              style={{
                fontSize: "10px",
                fontWeight: "500",
                color: "#8c8c8c",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingLeft: "16px",
              }}
            >
              Admin Panel
            </div>
          )}
          <Menu
            mode="inline"
            items={adminItems}
            selectedKeys={[getActiveKey()]}
            style={{
              border: "none",
              background: "transparent",
              borderBottom: "1px solid #f0f0f0",
            }}
            className="admin-menu sidebar_content_typo"
            onClick={handleMenuClick} // ✅ added click handler
          />
        </div>

        {/* Network Activity Section - Dynamic System Status */}
        <div>
          {!collapsed && (
            <div
              className="mt-2"
              style={{
                fontSize: "10px",
                fontWeight: "500",
                color: "#8c8c8c",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                paddingLeft: "16px",
              }}
            >
              Network Activity
            </div>
          )}

          <SystemStatus isProcessing={isProcessing} collapsed={collapsed} />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Menu
          mode="inline"
          items={footerItems}
          selectedKeys={[getActiveKey()]}
          style={{ border: "none", background: "transparent" }}
          className="footer-menu"
          onClick={handleMenuClick} // ✅ added click handler
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
