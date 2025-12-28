import { Buffer } from "buffer";
import process from "process";

globalThis.Buffer = Buffer;
globalThis.process = process;

window.Buffer = Buffer;
window.process = process;

import React from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
