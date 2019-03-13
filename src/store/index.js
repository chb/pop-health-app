import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk              from "redux-thunk";
import dataSourcesReducer from "./dataSources";
import uiReducer          from "./ui";
import authReducer        from "./auth";

const store = createStore(
    combineReducers({
        auth       : authReducer,
        ui         : uiReducer,
        dataSources: dataSourcesReducer
    }),
    applyMiddleware(thunk)
);

export default store;