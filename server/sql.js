const express   = require("express");
const csvWriter = require("csv-write-stream");
const pipeline  = require("readable-stream").pipeline;
const through2  = require("through2");
const auth      = require("./controllers/auth");
const pool      = require("./dbPool");

const router = exports.router = express.Router({ mergeParams: true });

function createRowStream(sql) {
    return pool.getConnection().then(connection => {
        let stream = connection.connection.query(sql).stream();
        stream.once("close", () => connection.release());
        return stream;
    });
}

/**
 * Execute SQL queries from the client and download the results as CSV file.
 * Notes:
 * - This is using GET to support HTML links
 * - The SQL query should be base64 encoded and URL escaped
 * - There is no size limit. The results will be streamed into a CSV file that
 *   the browser downloads.
 */
router.get("/csv", auth.authenticate, async (req, res) => {
    let query = req.query.q || "";
    if (!query) {
        return res.status(400).json({ error: "A 'q' parameter is required" }).end();
    }
    query = String(query).replace(/-/g, "+").replace(/_/g, "/");
    query = Buffer.from(query, "base64").toString("utf8");

    let source = await createRowStream(query);

    res.set({
        "Content-type"       : "text/plain",
        "Content-disposition": "attachment;filename=report.csv"
    });

    // @ts-ignore
    pipeline(source, csvWriter(), res);
});

/**
 * Execute SQL queries from the client by POSTing them to this endpoint.
 * Notes:
 * - Only SELECT queries are allowed
 * - The results are limited to 1000 rows
 */
router.post("/", auth.authenticate, express.urlencoded({ extended: true }), async (req, res) => {

    let source = await createRowStream(req.body.query);
    let header;
    let data = [];
    let len = 0;
    const maxRows = 1000;


    source.pipe(through2.obj(function(row, enc, next) {
        if (len < maxRows) {
            if (!header) {
                header = Object.keys(row);
            }
            len = data.push(Object.values(row));
        }
        if (len >= maxRows) {
            source.destroy();
        }
        next();
    }));

    source.on("close", () => {
        if (!res.headersSent) {
            res.json({ header, data });
        }
    });

    source.on("end", () => {
        if (!res.headersSent) {
            res.json({ header, data });
        }
    });

    source.on("error", e => {
        res.status(400).json({ error: e.message }).end();
    });
});
