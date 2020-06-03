const { Router }    = require("express");
const db            = require("./controllers/db");
const auth          = require("./controllers/auth");
const Measure       = require("./controllers/Measure");
const MeasureResult = require("./controllers/MeasureResult");
const router        = exports.router = Router({ mergeParams: true });


/**
 * This will be called by the front-end to build it's UI structure. Should reply
 * with all the data that the UI needs for initializing itself.
 */
router.get("/ui", /*auth.authenticate, */async (req, res) => {
    const [
        dataSources,
        measures,
        organizations,
        payers
    ] = await Promise.all([
        db.promise("all", "SELECT * FROM ds"),
        db.promise("all", "SELECT * FROM measures"),
        db.promise("all", "SELECT * FROM organizations"),
        db.promise("all", "SELECT * FROM payers")
    ]);
    res.json({
        dataSources,
        measures,
        organizations,
        payers
    });
});

router.get("/test/queryResults", auth.authenticate, async (req, res) => {
    const measure = new Measure();
    await measure.generateRandomResults();
    const result = await measure.queryResults(req.query);
    res.json(result);
});

router.get("/measure/result", async (req, res) => {
    const report = await MeasureResult.getAll(req.query);
    res.json(report);
});

router.get("/measure/result/report", async (req, res) => {
    const report = await MeasureResult.getReport(req.query);
    res.json(report || {});
});
