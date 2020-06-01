// In production REACT_APP_BACKEND_HOST and REACT_APP_BACKEND_PATH are loaded
// from .env.production

// In development REACT_APP_BACKEND_HOST and REACT_APP_BACKEND_PATH are loaded
// from .env.development

// In Docker these are coming from window.BACKEND_HOST and window.BACKEND_PATH,
// which are set in env.js file. Docker will run `envsubst` on that file to set
// these to its environment variables

let BACKEND_HOST = String(window.BACKEND_HOST || "");
let BACKEND_PATH = String(window.BACKEND_PATH || "");

if (!BACKEND_HOST || BACKEND_HOST.startsWith("$")) {
    BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
}

if (!BACKEND_PATH || BACKEND_PATH.startsWith("$")) {
    BACKEND_PATH = process.env.REACT_APP_BACKEND_PATH;
}

export default {
    startYear  : 2016,
    backendHost: BACKEND_HOST,
    backendPath: BACKEND_PATH
};
