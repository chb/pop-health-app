import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk          from "redux-thunk";
import dataSources    from "./dataSources";
import ui             from "./ui";
import auth           from "./auth";
import organizations  from "./organizations";
import measures       from "./measures";
import payers         from "./payers";
import measureResults from "./measureResults";
import http           from "../http";

import { load as loadOrganizations } from "./organizations";
import { load as loadPayers        } from "./payers";
import { load as loadMeasures      } from "./measures";
import { load as loadDataSources   } from "./dataSources";

const middleWares = [ thunk ];

// Create logger middleware that will log all redux action but only use that in development.
if (process.env.NODE_ENV === "development" && console && console.groupCollapsed) {
    let logger = _store => {
        return next => {
            return action => {
                let result;
                if (!action.__no_log) {
                    console.groupCollapsed(action.type);
                    console.info("dispatching", action);
                    result = next(action);
                    console.log("next state", _store.getState());
                    console.groupEnd();
                }
                else {
                    result = next(action);
                }
                return result;
            };
        };
    };

    // @ts-ignore
    middleWares.push(logger);
}


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
    applyMiddleware(...middleWares)
);

export default store;

// Load the data from the backend ==============================================
http.request("api/ui").then(data => {
    store.dispatch(loadOrganizations(data.organizations));
    store.dispatch(loadPayers(data.payers));
    store.dispatch(loadMeasures(data.measures));
    store.dispatch(loadDataSources(data.dataSources));
}).catch(console.error);
