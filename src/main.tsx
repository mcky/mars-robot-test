import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// @NOTE: for the sake of the demo, just import the inputs
import input from "./input.txt?raw";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App input={input} />
  </StrictMode>
);
