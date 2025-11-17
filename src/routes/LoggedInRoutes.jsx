import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Login from "../layouts/auth";

export default function LoggedInRoutes() {
    const { loginUser } = useSelector((state) => ({ ...state }));
    return loginUser ? <Outlet /> : <Login />;
}
