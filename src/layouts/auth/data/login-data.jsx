import { useState } from "react";
import { apiLogin } from "../../../helper/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { showNotification } from "../../../helper/showNotification";

const COOKIE_PATH_ROOT = "/";
const COOKIE_PATH_AUTH = "/auth";

const LoginData = ({ keepLoggedIn = true } = {}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            setLoading(true);
            const params = {
                username: username,
                password: password,
            };
            const { data } = await apiLogin(params);
            if (data.status === "success") {
                const loginUser = data.data || null;
                const loginUserString = JSON.stringify(loginUser);

                localStorage.setItem("token", loginUser?.token || "");
                localStorage.setItem("loginUser", loginUserString);
                dispatch({ type: "LOGIN", payload: data.data });

                // Replace any existing cookies on different paths so refresh works everywhere
                Cookies.remove("loginUser", { path: COOKIE_PATH_AUTH });
                Cookies.remove("loginUser", { path: COOKIE_PATH_ROOT });
                Cookies.set("loginUser", loginUserString, {
                    path: COOKIE_PATH_ROOT,
                    expires: keepLoggedIn ? 7 : undefined,
                    sameSite: "lax",
                    secure: window.location.protocol === "https:",
                });
                setLoading(false);
                showNotification({
                    title: "Success Login",
                    message: "Your are success join to New Platform",
                    Color: "green",
                });
                navigate("/");
            } else {
                showNotification({
                    title: "Fail Login",
                    message: data.message,
                    Color: "red",
                });
                // console.error(data.message);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    return {
        username: username,
        password: password,
        setPassword,
        setUsername,
        handleLogin,
        loading,
    };
};

export default LoginData;
