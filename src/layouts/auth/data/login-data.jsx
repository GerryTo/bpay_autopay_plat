import { useState } from "react";
import { apiLogin } from "../../../helper/api";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { showNotification } from "../../../helper/showNotification";

const LoginData = () => {
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
                localStorage.setItem("token", data.data.token);
                dispatch({ type: "LOGIN", payload: data.data });
                Cookies.set("loginUser", JSON.stringify(data.data));
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
