import React from "react";
import ReactDOM from "react-dom/client";


import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import { StoreProvider } from "./hooks/useGlobalReducer";
import { AuthProvider } from "../context/AuthContext";

import { BackendURL } from "./components/BackendURL";

import "@coreui/coreui/dist/css/coreui.min.css";
import "@coreui/icons/css/all.min.css";
import "./index.css";

const Main = () => {

    if (!import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL === "") {
        return (
            <React.StrictMode>
                <BackendURL />
            </React.StrictMode>
        );
    }

    return (
        <React.StrictMode>
            <StoreProvider>
                <AuthProvider>
                    <RouterProvider router={router} />
                </AuthProvider>
            </StoreProvider>
        </React.StrictMode>
    );
};

ReactDOM.createRoot(
    document.getElementById("root")
).render(<Main />);
