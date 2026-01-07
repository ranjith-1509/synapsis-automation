import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import "./App.css";
import LoginScreen from "./LoginScreen";
import Dashboard from "./components/Dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Sidebar from "./components/Sidebar/Sidebar";
import "./components/Sidebar/Sidebar.css";
import NewWorkFlow from "./pages/NewWorkFlow";
import DocumentProcess from "./pages/DocumentProcess";
import AdminDocument from "./pages/AdminDocument";
import MedicalDocument from "./pages/MedicalDocument";
import AuditLogs from "./pages/AuditLogs";
import DiagnosisCatalog from "./pages/DiagnosisCatalog";
import FileCopyTest from "./pages/FileCopyTest";
import { ConfigProvider, App as AntdApp } from "antd";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleProcessingChange = (processing) => {
    setIsProcessing(processing);
  };

  return (
    <ConfigProvider>
      <AntdApp>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />

            {/* Dashboard / Smart Sorter */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <Dashboard onProcessingChange={handleProcessingChange} />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* New Work Flow */}
            <Route
              path="/new-workflow"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <NewWorkFlow />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Document Process */}
            <Route
              path="/document-process"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <DocumentProcess />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Admin Document */}
            <Route
              path="/admin-document"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <AdminDocument />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Medical Document */}
            <Route
              path="/medical-document"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <MedicalDocument />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Audit Logs */}
            <Route
              path="/audit-logs"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <AuditLogs />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Admin Panel */}
            <Route
              path="/diagnosis-catalog"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <DiagnosisCatalog />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* File Copy Test */}
            <Route
              path="/file-copy-test"
              element={
                <PrivateRoute>
                  <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar onCollapse={handleSidebarCollapse} isProcessing={isProcessing} />
                    <Layout.Content
                      className={`main-content ${sidebarCollapsed ? "collapsed" : ""}`}
                      style={{
                        background: "#f5f5f5",
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      <FileCopyTest />
                    </Layout.Content>
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
