import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "reactflow";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <ModalsProvider modalProps={{ target: "#modal_target" }}>
        <ReactFlowProvider>
          <App />
          <Notifications position="top-right" />
        </ReactFlowProvider>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
);
