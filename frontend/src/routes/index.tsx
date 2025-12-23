import { lazy } from "react";

const Components = lazy(() => import("../components"));
const Login = lazy(() => import("../pages/Auth/Login"));

export const ROUTES = [
    {
        path: "/",
        element: <Components />,
        private: true,
        layout: false
    },
    {
        path: "/login",
        element: <Login />,
        private: false,
        layout: false
    },
];