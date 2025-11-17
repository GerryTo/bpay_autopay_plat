import { combineReducers } from "redux";
import { breadCrumbsReducer } from "./breadCrumbs";
import { userReducer } from "./userReducer";

const rootReducer = combineReducers({
    loginUser: userReducer,
    textBreadCrumb: breadCrumbsReducer,
});

export default rootReducer;
