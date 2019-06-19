import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk          from "redux-thunk";
import dataSources    from "./dataSources";
import ui             from "./ui";
import auth           from "./auth";
import organizations  from "./organizations";
import measures       from "./measures";
import payers         from "./payers"
import measureResults from "./measureResults";
import http           from "../http";

import { load as loadOrganizations } from "./organizations";
import { load as loadPayers        } from "./payers";
import { load as loadMeasures      } from "./measures";
import { load as loadDataSources   } from "./dataSources";

const store = createStore(
    combineReducers({
        auth,
        ui,
        organizations,
        dataSources,
        measures,
        payers,
        measureResults
    }),
    applyMiddleware(thunk)
);

export default store;

// Load the data from the backend ==============================================
http.request("api/ui").then(data => {
    store.dispatch(loadOrganizations(data.organizations));
    store.dispatch(loadPayers(data.payers));
    store.dispatch(loadMeasures(data.measures));
    store.dispatch(loadDataSources(data.dataSources));

    // once we are done hydrating the store, set up a listener that will detect
    // changes from various reducers
    // store.subscribe(() => {
    //     store.getState();
    // });
});