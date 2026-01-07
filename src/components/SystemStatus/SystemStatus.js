import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { WifiOutlined, ThunderboltOutlined, DashboardOutlined } from '@ant-design/icons';
import './SystemStatus.css';

const SystemStatus = ({ isProcessing = false, collapsed = false }) => {
  const [gpuUsage, setGpuUsage] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      // Spike up animation
      const spikeInterval = setInterval(() => {
        setGpuUsage(prev => {
          const target = 70 + Math.random() * 10; // 70-80%
          return prev + (target - prev) * 0.3;
        });
        setCpuUsage(prev => {
          const target = 60 + Math.random() * 10; // 60-70%
          return prev + (target - prev) * 0.3;
        });
      }, 100);


      return () => clearInterval(spikeInterval);
    } else {
      // Smooth return to 0
      const returnInterval = setInterval(() => {
        setGpuUsage(prev => {
          const newValue = prev * 0.85;
          return newValue < 1 ? 0 : newValue;
        });
        setCpuUsage(prev => {
          const newValue = prev * 0.85;
          return newValue < 1 ? 0 : newValue;
        });
      }, 100);

   

      return () => {
        clearInterval(returnInterval);
      };
    }
  }, [isProcessing]);

  if (collapsed) {
    return (
      <div className="network-activity-collapsed">
        <div className="network-item-collapsed">
          <WifiOutlined className="network-icon-collapsed" />
        </div>
        <div className="network-item-collapsed">
          <DashboardOutlined className="network-icon-collapsed" />
        </div>
        <div className="network-item-collapsed">
          <ThunderboltOutlined className="network-icon-collapsed" />
        </div>
      </div>
    );
  }

  return (
    <div className="network-activity-container">
      {/* Network Speed */}
      <div className="network-activity-item">
     <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <WifiOutlined style={{ fontSize: '14px' }} />
            <span>0KB/s</span>
          </div>
          <Tag
  color="blue"
  className="ml-2"
  style={{
    fontSize: "10px",
    borderRadius: "9999px",
    padding: "0 8px",
    display: "flex",
    alignItems: "center", // vertical centering
    gap: "6px", // spacing between dot and text
  }}
>
  <div
    style={{
      width: "6px",
      height: "6px",
      backgroundColor: "#0066EF",
      borderRadius: "50%",
    }}
  ></div>
  <span style={{ color: "#0066EF" }}>Offline Mode Active</span>
</Tag>
         
        </div>
      </div>

      {/* CPU Load */}
      <div className="network-activity-item">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <DashboardOutlined style={{ fontSize: '14px' }} />
            <span>CPU Load</span>
          </div>
          <Tag
            color="#F2F4F7"
            style={{
              fontSize: "10px",
              borderRadius: "9999px",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: cpuUsage > 0 ? `linear-gradient(90deg, 
                ${cpuUsage < 30 ? '#10b981' : cpuUsage < 60 ? '#f59e0b' : '#ef4444'} ${cpuUsage}%, 
                #F2F4F7 ${cpuUsage}%)` : '#F2F4F7',
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: cpuUsage > 0 ? (cpuUsage < 30 ? '#10b981' : cpuUsage < 60 ? '#f59e0b' : '#ef4444') : '#667085',
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ color: "#344054" }}>{Math.round(cpuUsage)}%</span>
          </Tag>
        </div>
      </div>

      {/* GPU Load */}
      <div className="network-activity-item">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <ThunderboltOutlined style={{ fontSize: '14px' }} />
            <span>GPU Load</span>
          </div>
          <Tag
            color="#F2F4F7"
            style={{
              fontSize: "10px",
              borderRadius: "9999px",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: gpuUsage > 0 ? `linear-gradient(90deg, 
                ${gpuUsage < 30 ? '#10b981' : gpuUsage < 60 ? '#f59e0b' : '#ef4444'} ${gpuUsage}%, 
                #F2F4F7 ${gpuUsage}%)` : '#F2F4F7',
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: gpuUsage > 0 ? (gpuUsage < 30 ? '#10b981' : gpuUsage < 60 ? '#f59e0b' : '#ef4444') : '#667085',
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ color: "#344054" }}>{Math.round(gpuUsage)}%</span>
          </Tag>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
