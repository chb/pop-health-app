const moment      = require("moment");
const DB          = require("./db");
const lib         = require("../lib");
const { syncAll } = require("./sync");


class MeasureResult
{
    constructor(id)
    {
        this.id = id;
    }

    static async getAll({ startDate, endDate, org, measure, ds, sync })
    {
        // ---------------------------------------------------------------------
        // Start Date
        // If none is specified, default to the start of the previous year.
        // In both cases the given date is shifted to the start of it's month.
        // ---------------------------------------------------------------------
        startDate = moment(startDate + "");
        if (!startDate.isValid()) {
            startDate = moment().startOf("year").subtract(1, "year");
        }
        startDate = startDate.startOf("month");


        // ---------------------------------------------------------------------
        // End Date
        // If none is specified, default to the end of the previous month.
        // In both cases the given date is shifted to the end of it's month.
        // ---------------------------------------------------------------------
        endDate = moment(endDate + "");
        if (!endDate.isValid()) {
            endDate = moment().subtract(1, "month");
        }
        endDate = endDate.endOf("month");


        // ---------------------------------------------------------------------
        // Synchronize if requested. Note that we don't wait for this to
        // complete - it runs in the background!
        // ---------------------------------------------------------------------
        if (sync) {
            syncAll(startDate, endDate);
        }

        // ---------------------------------------------------------------------
        // Organizations
        // This is a list of organization IDs to be included in the response.
        // If no IDs are provided all organizations are selected. Otherwise,
        // only the passed IDs are selected.
        // ---------------------------------------------------------------------
        let orgSQL = "SELECT * FROM organizations";
        let orgParams = [];
        org = lib.makeArray(org).filter(Boolean);
        if (org.length) {
            orgSQL += ` WHERE id IN(${org.map(() => "?").join(", ")})`;
            orgParams = org;
        }
        const organizations = await DB.promise("all", orgSQL, orgParams);
        if (!organizations.length) {
            throw new Error("No organization(s) found");
        }

        // ---------------------------------------------------------------------
        // Measures
        // This is a list of measure IDs to be included in the response.
        // If no IDs are provided all measures are selected. Otherwise,
        // only the passed IDs are selected.
        // ---------------------------------------------------------------------
        let measureSQL = "SELECT * FROM measures WHERE enabled = 1";
        let measureParams = [];
        measure = lib.makeArray(measure).filter(Boolean);
        if (measure.length) {
            measureSQL += ` AND id IN(${measure.map(() => "?").join(", ")})`;
            measureParams = measure;
        }
        const measures = await DB.promise("all", measureSQL, measureParams);
        if (!measures.length) {
            throw new Error("No measure(s) found");
        }

        // ---------------------------------------------------------------------
        // DataSources
        // This is a list of dataSource IDs to be included in the response.
        // If no IDs are provided all the dataSources are selected. Otherwise,
        // only the passed IDs are selected.
        // ---------------------------------------------------------------------
        let dsSQL = "SELECT * FROM ds";
        let dsParams = [];
        ds = lib.makeArray(ds).filter(Boolean);
        // console.log(ds)
        if (ds.length) {
            dsSQL += ` WHERE id IN(${ds.map(() => "?").join(", ")})`;
            dsParams = ds;
        }
        const dataSources = await DB.promise("all", dsSQL, dsParams);
        if (!dataSources.length) {
            throw new Error("No dataSource(s) found");
        }

        ////////////////////////////////////////////////////////////////////////
        const out = {
            startDate,
            endDate,
            organizations: {},
            measures
        };

        const results = await DB.promise(
            "all",

            // SUM(mr.numerator) AS numerator,
            // (CASE ("mr.numerator") WHEN mr.measure_id = "pro" THEN AVG(mr.numerator)/ds.length ||1 ELSE SUM(mr.numerator) END) AS numerator,
            `SELECT
                mr.id,
                mr.org_id,
                mr.date,
                mr.measure_id,
                SUM(mr.numerator) AS numerator,
                SUM(mr.denominator) AS denominator 
            FROM
                measure_results_2 AS mr
                JOIN measures AS m ON m.id = mr.measure_id
            WHERE
                m.enabled = 1
                AND mr.date >= ? AND mr.date <= ?
                AND ds_id IN(${ds.map(() => "?").join(", ")})
            GROUP BY mr.org_id, mr.measure_id, mr.date 
            ORDER BY mr.date, mr.org_id`,

            [
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD"),
                ...ds
            ]
        );

        organizations.forEach(org => {
            const _org = {
                name: org.name,
                description: org.description,
                measures: []
            };

            measures.forEach(measure => {
                const data = {};

                // For each month in the selected range
                results.forEach(rec => {
                    if (rec.org_id === org.id && rec.measure_id === measure.id) {
                        const key = rec.date.replace(/-\d\d$/, "");
                        data[key] = {
                            numerator: measure.id === "pro" ? Math.round(rec.numerator / (dsParams.length || 1)) : rec.numerator,
                            denominator: rec.denominator,
                            pct: lib.roundToPrecision(rec.numerator / rec.denominator * 100, 2),
                            id: rec.id
                        };
                    }
                });

                _org.measures.push({
                    id  : measure.id,
                    name: measure.name,
                    data
                });
            });

            out.organizations[org.id] = _org;
        });

        return out;
    }

    /**
     * Returns the data needed to render the report page.
     */
    static getReport({ date, measure, org, ds })
    {
        if (!Array.isArray(ds)) ds = [ds];

        return DB.promise(
            "get",
            "SELECT " +
                // "mr.clinic_id        AS clinicID, " +
                "mr.date             AS measureDate, " +
                "m.name              AS measureName, " +
                "SUM(mr.numerator)   AS numeratorValue, " +
                (measure === "pro" ? "AVG(mr.numerator) AS numeratorValue, " : "SUM(mr.numerator) AS numeratorValue, ") +
                "SUM(mr.denominator) AS denominatorValue, " +
                "m.description       AS measureDescription, " +
                "m.numerator         AS numeratorDescription, " +
                "m.denominator       AS denominatorDescription, " +
                "org.name            AS orgName, " +
                // "mr.numerator/mr.denominator * 100       AS value, " +
                "m.cohort_sql " +
            "FROM measure_results_2 AS mr " +
            "JOIN measures AS m ON mr.measure_id = m.id " +
            "JOIN organizations AS org ON mr.org_id = org.id " +
            // "JOIN clinic AS cl ON mr.clinic_id = cl.id " +
            "WHERE m.id = ? " +
            "AND \"date\" >= ? " +
            "AND \"date\" <= ? " +
            "AND mr.org_id = ? " +
            "AND ds_id IN(" + ds.map(() => "?").join(", ") + ")" +
            "GROUP BY mr.org_id, mr.measure_id, mr.date " +
            "ORDER BY mr.date, mr.org_id",
            measure,
            moment(date).startOf("month").format("YYYY-MM-DD"),
            moment(date).endOf("month").format("YYYY-MM-DD"),
            org,
            ...ds
        );
    }
}

module.exports = MeasureResult;
