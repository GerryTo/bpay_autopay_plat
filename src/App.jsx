import { Routes, Route } from "react-router-dom";
import Home from "./layouts/Home";
import LoggedInRoutes from "./routes/LoggedInRoutes";
import NotLoggedInRoutes from "./routes/NotLoggedInRoutes";
import Login from "./layouts/auth";

function App() {
    return (
        <div>
            <Routes>
                <Route element={<LoggedInRoutes />}>
                    <Route path="/*" element={<Home />} />
                    {/* <Route path="*" element={<NotFoundPageMain />} /> */}
                </Route>
                <Route element={<NotLoggedInRoutes />}>
                    <Route path="/auth/login" element={<Login />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
