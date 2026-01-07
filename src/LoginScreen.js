import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio } from "antd";
import LoginImage from "./images/Login_image.png";
import Logo from "./images/Logo.png";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    passkey: "",
  });
  const [value, setValue] = useState("intake");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
      email: e.target.value,
    }));
  };
  console.log(credentials.email, "ee");
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally validate credentials with your backend
    // For demo purposes, we'll just set isAuthenticated
    localStorage.setItem("isAuthenticated", "true");

    // Generate audit log entry for login
    const auditLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      role:
        value === "intake" ? "Intake Clerk" : value === "privacy" ? "Privacy Officer" : "IT Admin",
      roleColor: value === "intake" ? "blue" : value === "privacy" ? "purple" : "red",
      message: `successfully logged into MOA-AI system as ${credentials.email || "demo@moa-ai.com"}`,
      action: "login",
      userId: credentials.email || "demo@moa-ai.com",
    };

    // Store audit log in localStorage
    const existingLogs = JSON.parse(localStorage.getItem("moa-ai-audit-logs") || "[]");
    existingLogs.unshift(auditLog);
    localStorage.setItem("moa-ai-audit-logs", JSON.stringify(existingLogs));

    navigate("/dashboard");
  };

  const onChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Image */}
      <div className="md:w-1/2 w-full h-64 md:h-auto bg-blue-50 p-8 flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center space-y-8 max-w-lg">
          <img
            src={LoginImage} // replace with your uploaded image
            alt="MOA AI Dashboard Preview"
            className="w-full"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-center bg-gray-50 p-8">
        <div className="w-full flex justify-start ">
          <img src={Logo} alt="Logo" className="w-32 h-auto" />
        </div>
        <Radio.Group
          value={value}
          onChange={onChange}
          style={{
            backgroundColor: "#F3F4F6", // light gray background pill
            borderRadius: 9999, // pill shape
            padding: 4,
            display: "inline-flex",
            margin: "10px",
          }}
        >
          {[
            { label: "Intake Clerk", value: "intake" },
            { label: "Privacy Officer", value: "privacy" },
            { label: "IT Admin", value: "it" },
          ].map((item) => (
            <Radio.Button
              key={item.value}
              value={item.value}
              style={{
                borderRadius: "9999px",
                border: "none",
                fontWeight: 500,
                padding: "11px 33px",
                transition: "all 0.3s ease",
                backgroundColor: value === item.value ? "#2563EB" : "transparent",
                color: value === item.value ? "#fff" : "#6B7280",
                boxShadow: value === item.value ? "0 2px 6px rgb(37 99 235 / 0.4)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.label}
            </Radio.Button>
          ))}
        </Radio.Group>
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome Back !</h1>
          <p className="text-gray-600 mb-8">
            Clarity gives you the blocks and components you need to create a truly professional
            website.{" "}
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="********"
              />
            </div>
            <div>
              <label htmlFor="passkey" className="block text-gray-700 mb-2">
                Passkey
              </label>
              <input
                type="password"
                id="passkey"
                name="passkey"
                value={credentials.passkey}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="********"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {}}
                  className="text-blue-600 hover:text-blue-800  text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-4 text-center p_content">©2025 All Rights Reserved to MOA AI.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
