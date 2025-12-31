import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@fontsource/roboto/400.css"; // Regular
import "@fontsource/roboto/500.css"; // Medium
import "@fontsource/roboto/600.css"; // SemiBold
import "@fontsource/roboto/700.css"; // Bold
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
