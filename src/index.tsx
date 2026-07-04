import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { SpeedInsights } from "@vercel/speed-insights/next";

if (import.meta.env.DEV) {
  const { default: axe } = await import("@axe-core/react");
  const React = await import("react");
  axe(React.default, ReactDOM, 1000);
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found in DOM");
const root = ReactDOM.createRoot(rootElement);
root.render(
  // <React.StrictMode>
  <>
    <App />
    <SpeedInsights />
  </>,
  // </React.StrictMode>
);
