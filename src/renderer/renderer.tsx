// @ts-check

import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const container = document.querySelector("main");
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App));
