import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Login from "../layouts/auth";
import { checkSession } from "../helper/api";

export default function LoggedInRoutes() {
    const { loginUser } = useSelector((state) => ({ ...state }));

    useEffect(() => {
        if (!loginUser) return;

        let isMounted = true;
        const ping = async () => {
            try {
                // Keeps backend session alive during inactivity.
                // If session/token is invalid, apiClient interceptor will redirect on 401.
                await checkSession();
            } catch (error) {
                if (!isMounted) return;
                // Ignore transient network errors; unauthorized is handled globally in apiClient.
                console.error("Session keep-alive failed:", error);
            }
        };

        ping();
        const intervalId = setInterval(ping, 4 * 60 * 1000); // every 4 minutes

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") ping();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [loginUser]);

    return loginUser ? <Outlet /> : <Login />;
}
