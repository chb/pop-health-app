import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk         from "redux-thunk";
import dataSources   from "./dataSources";
import ui            from "./ui";
import auth          from "./auth";
import organizations from "./organizations";
import measures      from "./measures";
import payers        from "./payers"

const store = createStore(
    combineReducers({
        auth,
        ui,
        organizations,
        dataSources,
        measures,
        payers
    }),
    applyMiddleware(thunk)
);

export default store;