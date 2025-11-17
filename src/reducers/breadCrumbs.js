const initialState = {
    activeLink: "/",
    activeLabel: "Dashboard",
    breadcrumbs: [],
    parentSection: null,
};

export function breadCrumbsReducer(state = initialState, action) {
    switch (action.type) {
        case "ADD_BREADCRUMBS":
            return {
                activeLink: action.payload.link || state.activeLink,
                activeLabel: action.payload.label || state.activeLabel,
                breadcrumbs: action.payload.breadcrumbs || [],
                parentSection: action.payload.parentSection || null,
            };
        case "RESET_BREADCRUMBS":
            return initialState;
        default:
            return state;
    }
}
