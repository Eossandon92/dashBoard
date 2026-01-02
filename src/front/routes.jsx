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
import AdminPanel from "./pages/AdminPanel";
import { PrivateRoute } from "./PrivateRoute";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* PÚBLICAS */}
      <Route path="/" element={<Signin />} />

      {/* PRIVADAS */}
      <Route element={<PrivateRoute />}>
        <Route path="/app" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="single/:theId" element={<Single />} />
          <Route path="demo" element={<Demo />} />
          <Route path="admin-panel" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);
