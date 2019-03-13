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

export function setLoading(loading)
{
    return { type: "SET_LOADING", payload: loading }
}

export function setError(error)
{
    return { type: "SET_ERROR", payload: error }
}

export function setCurrentUser(user)
{
    return { type: "SET_CURRENT_USER", payload: user }
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
                    dispatch(setError(new Error("Invalid email or password")));
                    dispatch(setLoading(false));
                    reject();
                }
                else {
                    sessionStorage.currentUser = JSON.stringify(user);
                    dispatch(setCurrentUser(user));
                    dispatch(setError(null));
                    dispatch(setLoading(false));
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
                dispatch(setCurrentUser(null));
                dispatch(setError(null));
                dispatch(setLoading(false));
                resolve();
            }, 1000);
        });
    };
}

export default function reducer(state = INITIAL_STATE, action)
{
    switch (action.type) {
    case "SET_LOADING":
        return { ...state, loading: !!action.payload };
    case "SET_ERROR":
        return { ...state, error: action.payload };
    case "SET_CURRENT_USER":
        return { ...state, currentUser: action.payload };
    default:
        return state;
    }
}