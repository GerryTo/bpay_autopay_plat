import Cookies from "js-cookie";

const readStoredLoginUser = () => {
    try {
        const cookieUser = Cookies.get("loginUser");
        if (cookieUser) return JSON.parse(cookieUser);
    } catch {
        // ignore invalid cookie JSON
    }

    try {
        if (typeof window !== "undefined") {
            const localUser = window.localStorage.getItem("loginUser");
            if (localUser) return JSON.parse(localUser);
        }
    } catch {
        // ignore invalid localStorage JSON
    }

    return null;
};

export function userReducer(
    state = readStoredLoginUser(),
    action
) {
    switch (action.type) {
        case "LOGIN":
            return action.payload;
        case "LOGOUT":
            return null;

        default:
            return state;
    }
}

export const addBreadcrumbs = (payload) => ({
    type: "ADD_BREADCRUMBS",
    payload: payload,
});

export const resetBreadcrumbs = () => ({
    type: "RESET_BREADCRUMBS",
});
