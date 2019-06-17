import http from "../http"

const $ = window.jQuery;

const INITIAL_STATE = {
    loading: false,
    error: null,
    currentUser: JSON.parse(sessionStorage.currentUser || "null")
};

const MERGE       = "actions:auth:merge";
const SET_LOADING = "actions:auth:setLoading";

export function setLoading(payload)
{
    return { type: SET_LOADING, payload };
}

export function merge(payload)
{
    return { type: MERGE, payload };
}

export function login(email, password)
{
    return function (dispatch, getState)
    {
        dispatch(setLoading(true));
        return http.login(email, password).then(user => {
            sessionStorage.currentUser = JSON.stringify(user);
            dispatch(merge({
                currentUser: user,
                error: null,
                loading: false
            }));
        }).catch(error => {
            console.error(error);
            dispatch(merge({ error, loading: false }));
        });
    };
}

export function logout()
{
    return function (dispatch, getState)
    {
        dispatch(setLoading(true));
        return http.logout().then(() => {
            sessionStorage.removeItem("currentUser");
            dispatch(merge({
                currentUser: null,
                error: null,
                loading: false
            }));
        });
    };
}

export default function reducer(state = INITIAL_STATE, action)
{
    switch (action.type) {
    case MERGE:
        return $.extend(true, {}, state, action.payload);
    case SET_LOADING:
        return { ...state, loading: !!action.payload };
    default:
        return state;
    }
}
