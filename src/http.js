// This file contains the functions for communication with the backend.

const { location, fetch } = window;

const backendUrl = new URL(
    `${location.protocol}//${process.env.REACT_APP_BACKEND_HOST}${process.env.REACT_APP_BACKEND_PATH}`
);

function http(uri, options) {
    const url = new URL(uri, backendUrl);
    return fetch(url.href, {
        mode: "cors",
        credentials: "include",
        ...options
    })
    .then(res => {
        if (!res.ok) {
            const error = new Error(`${res.status} ${res.statusText}`);
            Object.defineProperty(error, "data", {
                value: {
                    status    : res.status,
                    statusText: res.statusText
                }
            });
            throw error;
        }
        return res;
    })
    .then(res => res.json())
    .then(res => {
        if (res.error) {
            throw new Error(res.error);
        }
        return res;
    });
}

export function login(username, password) {
    const body = new URLSearchParams();
    body.set("username", username);
    body.set("password", password);
    return http("auth/login", { method: "POST", body });
}

export function logout() {
    return http("auth/logout");
}

export function query(sql) {
    const data = new URLSearchParams();
    data.append("query", sql);
    return http("sql", {
        method: "POST",
        body: data
    });
}

export default {
    login,
    logout,
    query,
    request: http
};
