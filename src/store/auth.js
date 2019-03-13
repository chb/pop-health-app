const $ = window.jQuery;

const INITIAL_STATE = {
    users: [
        {
            email: "user@aco.org",
            password: "password"
        },
        {
            email: "user@payer.org",
            password: "password"
        }
    ],
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
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = getState().auth.users.find(
                    u => u.email === email && u.password === password
                );
                if (!user) {
                    dispatch(merge({
                        error: new Error("Invalid email or password"),
                        loading: false
                    }));
                    reject();
                }
                else {
                    sessionStorage.currentUser = JSON.stringify(user);
                    dispatch(merge({
                        currentUser: user,
                        error: null,
                        loading: false
                    }));
                    resolve();
                }
            }, 1000);
        }).catch(() => 0);
    };
}

export function logout()
{
    return function (dispatch, getState)
    {
        dispatch(setLoading(true));
        return new Promise(resolve => {
            setTimeout(() => {
                sessionStorage.removeItem("currentUser");
                dispatch(merge({
                    currentUser: null,
                    error: null,
                    loading: false
                }));
                resolve();
            }, 1000);
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
