import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Root from "./routes/Root.tsx";
import Dashboard from "./pages/eth/Dashboard/Dashboard.tsx";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "eth",
        element: (
          <div>
            <Dashboard></Dashboard>
            eth path
            <Outlet></Outlet>
          </div>
        ),
        children: [
          {
            path: "erc20",
            element: (
              <div>
                eth/erc20 path <Outlet></Outlet>
              </div>
            ),
            children: [
              { path: ":account", element: <div>eth/erc20/:account path</div> },
              {
                path: "trend/:account/:address",
                element: <div>trend/:account/:address path</div>,
              },
            ],
          },
          // {
          //   path: "erc20/:account",
          //   element: <div>eth/erc20/:account path</div>,
          // },
        ],
      },
      {
        path: "fabric",
        element: <div>FABRIC ELEMENT</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
