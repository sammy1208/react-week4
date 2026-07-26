import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./assets/all.scss";

import { RouterProvider } from "react-router-dom";
import router from "./router";
import PasswordGate from "./components/PasswordGate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PasswordGate>
      <RouterProvider router={router} />
    </PasswordGate>
  </StrictMode>,
);
