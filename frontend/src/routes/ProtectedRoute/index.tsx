import { Navigate, Outlet } from "react-router-dom";
import { extractData } from "../../utils/Common/storage";

const ProtectedRoute = () => {

    const isAuthenticated = () => {
        return !!extractData("user")
    }

    return isAuthenticated() ? <Navigate to="/dashboard" /> : <Outlet />

};

export default ProtectedRoute