import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Signin from "./pages/Signin";
import SignupForm from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* PÚBLICAS */}
      <Route path="/" element={<Signin />} />
      <Route path="/register" element={<SignupForm />} />
      <Route path="admin-panel" element={<AdminPanel />} />

      {/* PRIVADAS */}
      <Route path="/app" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="single/:theId" element={<Single />} />
        <Route path="demo" element={<Demo />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);
