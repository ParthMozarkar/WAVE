import React from "react";

export function Notification({ message, type = "info" }) {
  if (!message) return null;

  return (
    <div
      className="toast visible"
      style={{
        borderColor: type === "error" ? "#ff7675" : "#e8a13d",
        color: type === "error" ? "#ff7675" : "#e8a13d",
      }}
    >
      {type === "error" ? "⚠ " : ""}{message}
    </div>
  );
}
