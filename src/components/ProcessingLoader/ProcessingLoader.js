import React, { useEffect, useState } from "react";
import { Spin, Progress, Typography, Space } from "antd";

const ProcessingLoader = ({ total = 100, showProgressBar = true }) => {
  const [processed, setProcessed] = useState(1);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (processed < total) {
      const timer = setTimeout(() => setProcessed((p) => p + 1), 50); // adjust speed
      return () => clearTimeout(timer);
    } else {
      // Fade out after reaching 100
      const fadeTimer = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(fadeTimer);
    }
  }, [processed, total]);

  const percent = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  if (!visible) return null;

  return (
    <div
      style={{
    
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        transition: "opacity 0.8s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      <Space direction="vertical" size={16} align="center" style={{ width: "100%", maxWidth: 480 }}>

        <Typography.Text
          style={{
            color: "#555",
            fontSize: 16,
            transition: "opacity 200ms ease, transform 200ms ease",
          }}
          key={processed}
        >
          {processed} out of {total} files processing...
        </Typography.Text>

        {showProgressBar && (
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#1677ff"
            trailColor="#f0f0f0"
          />
        )}
      </Space>
    </div>
  );
};

export default ProcessingLoader;
