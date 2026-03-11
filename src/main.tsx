import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { CarritoProvider } from "./context/CarritoContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  </React.StrictMode>
);
