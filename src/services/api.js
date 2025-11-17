import axios from "axios";
const WEB_URL = "https://wa.sq-crm.online/webservices/";

export function apiLogin(params) {
    try {
        const response = axios({
            method: "post",
            url: WEB_URL + "login.php",
            data: params,
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
            },
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}
