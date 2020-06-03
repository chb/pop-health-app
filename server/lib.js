
/**
 * Waits a while by returning a promise that resolves after the given number of
 * milliseconds
 * @param {number} ms 
 */
function resolveAfter(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

/**
 * If the argument is an array - return it. Otherwise put it in an array
 * and return that.
 * @param {*} x 
 */
function makeArray(x) {
    if (Array.isArray(x)) {
        return x;
    }
    return [x];
}

/**
 * Rounds the given number @n using the specified precision.
 * @param {Number|String} n
 * @param {Number} [precision]
 * @param {Number} [fixed] The number of decimal units for fixed precision. For
 *   example `roundToPrecision(2.1, 1, 3)` will produce `"2.100"`, while
 *   `roundToPrecision(2.1, 3)` will produce `2.1`.
 * @returns {Number|String} Returns a number, unless a fixed precision is used
 */
function roundToPrecision(n, precision, fixed) {
    n = parseFloat(n + "");

    if ( isNaN(n) || !isFinite(n) ) {
        return NaN;
    }

    if ( !precision || isNaN(precision) || !isFinite(precision) || precision < 1 ) {
        n = Math.round( n );
    }
    else {
        const q = Math.pow(10, precision);
        n = Math.round( n * q ) / q;
    }

    if (fixed) {
        n = Number(n).toFixed(fixed);
    }

    return n;
}

module.exports = {
    resolveAfter,
    makeArray,
    roundToPrecision
};
