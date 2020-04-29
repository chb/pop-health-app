import http from "../http";
import cfg  from "../config";


const INITIAL_STATE = {
    loading: false,
    error  : null,
    data   : null,
    uri    : ""
};

const SET_LOADING = "actions:measureResults:setLoading";
const SET_ERROR   = "actions:measureResults:setError";
const SET_DATA    = "actions:measureResults:setData";
const MERGE       = "actions:measureResults:merge";

/**
 * Compile and return the uri that will be used to query the measure results.
 * If any of the needed variables are missing (E.g. not available yet), it
 * will return null.
 * @param {Object} state
 * @param {Object} [options]
 * @param {string} [options.org] Organization ID
 * @param {string} [options.ds] Dataset ID
 */
export function getQueryUri(state, { org, ds } = {})
{
    let q = new URLSearchParams();

    // Two year time range based on the startYear config -----------------------
    q.append("startDate", `${cfg.startYear    }-01-01`);
    q.append("endDate"  , `${cfg.startYear + 1}-12-31`);

    // organizations -----------------------------------------------------------
    if (org) {
        q.append("org", org);
    } else {
        Object.keys(state.organizations).map(id => {
            if (state.organizations[id].enabled) q.append("org", id);
            return true;
        });
    }

    // Data Sources ------------------------------------------------------------
    if (ds) {
        q.append("ds", ds);
    } else {
        Object.keys(state.dataSources).map(id => {
            if (state.dataSources[id].selected) q.append("ds", id);
            return true;
        });
    }

    // data source is required
    if (!q.has("ds")) {
        return null;
    }

    // If "sync" is added to the current window location, pass it through to the
    // back-end to tell it to sync the data.
    const url  = new URL(window.location.href);
    const sync = url.searchParams.get("sync");

    if (sync) {
        q.append("sync", sync);

        // Also make sure we remove "sync" from the URL after we have used it!
        if (window.history.replaceState) {
            url.searchParams.delete("sync");
            window.history.replaceState({}, "", url.href);
        }
    }

    const qs = q.toString();

    if (!qs) {
        return null;
    }

    return "api/measure/result?" + qs;
}

export function queryMeasures(options = {})
{
    return function(dispatch, getState) {
        const state = getState();
        const uri   = getQueryUri(state, options);
        if (uri && uri !== state.uri) {
            dispatch(merge({ uri, loading: true }));
            http.request(uri).then(
                data  => dispatch(merge({  data, loading: false })),
                error => dispatch(merge({ error, loading: false }))
            );
        }
    };
}

export function setLoading(isLoading)
{
    return { type: SET_LOADING, payload: !!isLoading };
}

export function setError(error)
{
    return { type: SET_ERROR, payload: error };
}

export function setData(data)
{
    return { type: SET_DATA, payload: data };
}

export function merge(payload)
{
    return { type: MERGE, payload };
}

export default function reducer(state = INITIAL_STATE, action)
{
    switch (action.type) {
    case SET_LOADING:
        return { ...state, loading: !!action.payload };
    case SET_ERROR:
        return { ...state, error: action.payload };
    case SET_DATA:
        return { ...state, data: action.payload };
    case MERGE:
        return { ...state, ...action.payload };
    default:
        return state;
    }
}
