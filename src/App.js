import React from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import Home from "./pages/Home";
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
          <Home />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
