import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import FileCopyTest from "./pages/FileCopyTest";
import "./App.css";

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          colorBgLayout: "#f5f7fb",
        },
      }}
    >
      <AntdApp>
        <div className="App" style={{ minHeight: "100vh", background: "#f5f7fb" }}>
          <FileCopyTest />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
