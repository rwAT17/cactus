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
            <Outlet></Outlet>
          </div>
        ),
        children: [
          // MAIN
          { path: "dashboard", element: <Dashboard></Dashboard> },
          { path: "blocks", element: <div>blocks</div> },
          { path: "transactions", element: <div>transactions</div> },
          // ACCOUNTS
          {
            path: "accounts",
            element: <div>accounts</div>,
            children: [
              {
                path: ":standard",
                element: <div>eth/accounts/:standard path</div>,
              },
            ],
          },
          //BLOCK
          {
            path: "block-details",
            element: <div>block-details</div>,
            children: [
              {
                path: ":number",
                element: <div>eth/block-detail/:number path</div>,
              },
            ],
          },
          // TOKEN TRANSACTION DETAILS
          {
            path: "token-txn-details",
            element: <div>token-txn-details</div>,
            children: [
              {
                path: ":address",
                element: <div>eth/token-txn-details/:address path</div>,
              },
            ],
          },
          // TOKEN DETAILS
          {
            path: "token-detail",
            element: <div>token-detail</div>,
            children: [
              {
                path: ":address",
                element: <div>eth/token-detail/:address path</div>,
              },
            ],
          },
          // TRANSACTION DETAILS
          {
            path: "txn-detail",
            element: <div>txn-detail</div>,
            children: [
              {
                path: ":id",
                element: <div>eth/txn-detail/:id path</div>,
              },
            ],
          },
          // ERC tokens
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
          {
            path: "erc721",
            element: (
              <div>
                eth/erc721 path <Outlet></Outlet>
              </div>
            ),
            children: [
              {
                path: ":account",
                element: <div>eth/erc721/:account path</div>,
              },
            ],
          },
        ],
      },
      // FABRIC ROUTES
      {
        path: "fabric",
        element: <Outlet></Outlet>,
        children: [
          { path: "dashboard", element: <p>Dashboard</p> },
          {
            path: "transactions",
            element: <div>transactions</div>,
          },
          {
            path: "blocks",
            element: <div>blocks</div>,
          },
          {
            path: "txn-details",
            element: (
              <div>
                <Outlet></Outlet>
              </div>
            ),
            children: [{ path: ":id", element: <div>txn-details/:id</div> }],
          },
          {
            path: "block-details",
            element: (
              <div>
                <Outlet></Outlet>
              </div>
            ),
            children: [{ path: ":id", element: <div>txn-details/:id</div> }],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
