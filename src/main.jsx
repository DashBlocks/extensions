import React from "react";
import { createRoot } from "react-dom/client";
import ExtensionsGallery from "./components/ExtensionsGallery";
import "./styles/extensions.css";

const rootEl = document.getElementById("root");
const root = createRoot(rootEl);

root.render(<ExtensionsGallery />);
