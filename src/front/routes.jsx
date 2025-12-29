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

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/*SIGNIN (primera pantalla, sin Layout) */}
      <Route path="/" element={<Signin />} />

      {/* APP (con Layout) */}
      <Route path="/app" element={<Layout />} errorElement={<h1>Not found!</h1>}>
        <Route index element={<Home />} />
        <Route path="single/:theId" element={<Single />} />
        <Route path="demo" element={<Demo />} />
      </Route>

      {/*CUALQUIER RUTA RARA → SIGNIN */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);
