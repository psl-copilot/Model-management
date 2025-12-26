import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Components = lazy(() => import("../components"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));

export const ROUTES = [
    {
        path: "/components",
        element: <Components />,
        private: true,
        layout: false
    },
    {
        path: "/",
        element: <Navigate to="/login" replace />,
        private: false,
        layout: false,
    },
    {
        path: "/login",
        element: <Login />,
        private: false,
        layout: false
    },
    {
        path: "/dashboard",
        element: <Dashboard />,
        private: true,
        layout: true,
    },
];