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
import VignettePurchaseFormDemo from "./pages/Expense";
import Maintenance from "./pages/Maintenance";
import Requests from "./pages/Requests";
import Visits from "./pages/Visit";
import Delivery from "./pages/Delivery";

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
          <Route path="expense" element={<VignettePurchaseFormDemo />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="requests" element={<Requests />} />
          <Route path="visits" element={<Visits />} />
          <Route path="delivery" element={<Delivery />} />
        </Route>
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);
