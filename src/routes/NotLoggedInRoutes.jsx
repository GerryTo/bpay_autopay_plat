import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function NotLoggedInRoutes() {
    const { loginUser } = useSelector((state) => ({ ...state }));

    return loginUser ? <Navigate to="/" /> : <Outlet />;
}
