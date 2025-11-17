import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./reducers/index.js";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <Router basename="/">
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{ colorScheme: "light" }}
            >
                <Notifications />
                <App />
            </MantineProvider>
        </Router>
    </Provider>
);
