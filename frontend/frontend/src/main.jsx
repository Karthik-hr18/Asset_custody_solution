import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // Tailwind & global styles
import "./App.css";   // Custom app-level UI tweaks

// ✅ React 18 entry point
const rootElement = document.getElementById("root");

// Safety check to ensure mount point exists
if (!rootElement) {
  throw new Error("Root element not found. Did you forget <div id='root'></div> in index.html?");
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
