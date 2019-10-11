module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "env": {
        "commonjs": true,
        "es6"     : true,
        "node"    : true,
        "browser" : true,
        "jquery"  : true
    },
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 10,
        "sourceType": "module",
        "ecmaFeatures": {
            "impliedStrict": true,
            "jsx": true
        }
    },
    "rules": {
        "indent"               : [ "warn", 4 ],
        "linebreak-style"      : [ "warn", "unix" ],
        "quotes"               : [ "warn", "double" ],
        "semi"                 : [ "error", "always" ],
        "no-trailing-spaces"   : 1,
        "no-await-in-loop"     : 2,
        "no-console"           : 0,
        "array-callback-return": 0
    },
    "plugins": [
        "react"
    ],
    "settings": {
        "react": {
            "createClass": "createReactClass", // Regex for Component Factory to use,
                                                // default to "createReactClass"
            "pragma": "React",  // Pragma to use, default to "React"
            "version": "detect", // React version. "detect" automatically picks the version you have installed.
                                // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
                                // default to latest and warns if missing
                                // It will default to "detect" in the future
            "flowVersion": "0.53" // Flow version
        },
        "propWrapperFunctions": [
            // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
            "forbidExtraProps",
            {"property": "freeze", "object": "Object"},
            {"property": "myFavoriteWrapper"}
        ],
        "linkComponents": [
            // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
            "Hyperlink",
            {"name": "Link", "linkAttribute": "to"}
        ]
    }
};