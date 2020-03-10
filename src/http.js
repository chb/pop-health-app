import config from "./config";

// This file contains the functions for communication with the backend.
// NOTE: This will only work if the backend server is listening on port 3003
// on the same domain and on the same protocol!

const { location, fetch } = window;

const backendUrl = new URL(
    `${location.protocol}//${location.hostname}:${config.backendPort}`
);

function http(uri, options) {
    const url = new URL(uri, backendUrl);
    return fetch(url.href, {
        mode: "cors",
        credentials: "include",
        ...options
    }).then(res => res.json()).then(res => {
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