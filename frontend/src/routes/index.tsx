import { lazy } from "react";
import RuleBuilder from "../pages/rule-builder";

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
    {
        path: '/rule-builder',
        element: <RuleBuilder />,
        private: false,
        layout: false
    }
];