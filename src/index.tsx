import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";

if (import.meta.env.DEV) {
  const { default: axe } = await import("@axe-core/react");
  const React = await import("react");
  axe(React.default, ReactDOM, 1000);
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>
);
