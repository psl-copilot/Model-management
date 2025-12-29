import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Components = lazy(() => import("../components"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Home = lazy(() => import("../pages/Home"));
const RuleEditor = lazy(() => import("../pages/RuleEditor"));

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
        path: "/home",
        element: <Home />,
        private: true,
        layout: true,
    },
    {
        path: "/editor",
        element: <RuleEditor />,
        private: true,
        layout: true,
    },
];