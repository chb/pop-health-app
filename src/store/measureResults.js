import http from "../http"


const INITIAL_STATE = {
    loading: false,
    error: null,
    data: null
};

const SET_LOADING = "actions:measureResults:setLoading";
const SET_ERROR   = "actions:measureResults:setError";
const SET_DATA    = "actions:measureResults:setData";
const MERGE       = "actions:measureResults:merge";


export function queryMeasures({ org, payer, clinic, ds, startDate, endDate })
{
    return function(dispatch, getState) {
        dispatch(setLoading(true));
        const q = new URLSearchParams();
        q.set("payer"    , payer);
        if (startDate)
            q.set("startDate", startDate);
        if (endDate)
            q.set("endDate"  , endDate);
        (org || []).forEach(id => {
            q.append("org", id);
        });
        (clinic || []).forEach(id => {
            q.append("clinic", id);
        });
        (ds || []).forEach(id => {
            q.append("ds", ds);
        });
        http.request("/api/measures/results?" + q).then(
            data  => dispatch(merge({ loading: false, data })),
            error => dispatch(merge({ loading: false, error }))
        );
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