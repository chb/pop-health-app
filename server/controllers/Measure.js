const moment = require("moment");
const DB     = require("./db");
const lib    = require("../lib");


function randomPercent(min) {
    let out = min + Math.random() * 100 / 8;
    return lib.roundToPrecision(Math.min(100, out), 2);
}


class Measure
{
    /**
     * Returns the data needed to render a monthly report page.
     * @param {Object} params
     * @param {String} params.measureId The ID of the measure we want
     * @param {String} [params.date] A date within the month that we want. If
     * omitted, the data for the current month is returned (if any)
     */
    static async getMonthReport({ measureId, date = "" })
    {
        let _date = moment(date + "");
        if (!_date.isValid()) {
            _date = moment();
        }
        _date = _date.startOf("month");

        const row = await DB.promise(
            "get",
            "SELECT " +
                "mr.clinic_id   AS clinicID, " +
                "mr.date        AS measureDate, " +
                "m.name         AS measureName, " +
                "mr.numerator   AS numeratorValue, " +
                "mr.denominator AS denominatorValue, " +
                "m.description  AS measureDescription, " +
                "m.numerator    AS numeratorDescription, " +
                "m.denominator  AS denominatorDescription, " +
                "org.name       AS orgName, " +
                // "mr.value       AS value, " +
                "m.cohort_sql " +
            "FROM measure_results AS mr " +
            "JOIN measures AS m ON mr.measure_id = m.id " +
            "JOIN organizations AS org ON mr.org_id = org.id " +
            // "JOIN clinic AS cl ON mr.clinic_id = cl.id " +
            "WHERE m.id=? AND mr.date >= ? AND mr.date < ?",
            measureId,
            _date.format("YYYY-MM-DD"),
            moment(_date).endOf("month").format("YYYY-MM-DD")
        );

        return row;
    }

    async fetchCohort() {}

    /**
     * @param {object} [options]
     * @param {string} [options.org] Organization ID
     * @param {string} [options.startDate] Start date
     * @param {string} [options.measureId] Measure ID
     * @param {string} [options.endDate] End date
     */
    async queryResults({ org, startDate, measureId, endDate } = {}) {

        let sql = "SELECT * FROM measure_results";
        let params = [];
        let where = [];

        // Organizations -------------------------------------------------------
        if (org) {
            if (Array.isArray(org)) {
                where.push(`org_id IN(${org.map(() => "?").join(", ")})`);
                params = params.concat(org);
            } else {
                where.push("org_id = ?");
                params.push(org);
            }
        }

        // Measures ------------------------------------------------------------
        if (measureId) {
            if (Array.isArray(measureId)) {
                where.push(`measure_id IN(${measureId.map(() => "?").join(", ")})`);
                params = params.concat(measureId);
            } else {
                where.push("measure_id = ?");
                params.push(measureId);
            }
        }

        // Start Date ----------------------------------------------------------
        let _startDate = moment(startDate + "");
        if (!_startDate.isValid()) {
            _startDate = moment().subtract(1, "year").startOf("year");
        }
        where.push("date >= ?");
        params.push(_startDate.startOf("month").format("YYYY-MM-DD"));

        // End Date ------------------------------------------------------------
        let _endDate = moment(endDate + "");
        if (!_endDate.isValid()) {
            _endDate = moment().subtract(1, "month").endOf("month");
        }
        where.push("date <= ?");
        params.push(_endDate.endOf("month").format("YYYY-MM-DD"));

        // Finish the query ----------------------------------------------------
        sql += ` WHERE ${ where.join(" AND ") }`;


        const organizations = await DB.promise("all", "SELECT * FROM organizations");
        const measures = await DB.promise("all", "SELECT * FROM measures");
        const out = {
            startDate: _startDate,
            endDate  : _endDate,
            organizations: {}
        };

        organizations.forEach(o => {
            out.organizations[o.id] = {
                name: o.name,
                description: o.description,
                measures: measures.map(m => ({
                    id: m.id,
                    name: m.name,
                    data: []
                }))
            };
        });

        const data = await DB.promise("all", sql, params);

        data.forEach(row => {
            const rec = out.organizations[row.org_id].measures.find(x => x.id === row.measure_id);
            rec.data.push(row.numerator / row.denominator);
        });

        return out;
    }

    /**
     * @param {object} [options]
     * @param {string} [options.orgId] Organization ID
     * @param {string} [options.startDate] Start date
     * @param {string} [options.measureId] Measure ID
     */
    async generateRandomResults({ orgId, measureId, startDate } = {}) {

        const denominators = {};

        async function generate(orgId, measureId, startDate, dsId) {
            let now  = moment();
            let date = moment(startDate);
            let prev = 0;

            const denominatorId = `${orgId}-${measureId}-${dsId}`;
            let denominator = denominators[denominatorId];
            if (!denominator) {
                denominator = denominators[denominatorId] = Math.round(100 + Math.random() * 1000);
            }

            async function insert() {
                let idx = date.month();
                if (idx === 0) prev = 0;
                let pct = +randomPercent(prev);
                await DB.promise(
                    "run",
                    "INSERT INTO measure_results (" +
                        "org_id, measure_id, date, numerator, denominator, ds_id" +
                    ") VALUES (?, ?, ?, ?, ?, ?)",
                    orgId,
                    measureId,
                    date.format("YYYY-MM-DD"),
                    Math.round(denominator / 100 * pct),
                    denominator,
                    dsId
                );
                prev = +pct;
                date.add(1, "months");

                if (date.isBefore(now)) {
                    await insert();
                }
            }

            await insert();
        }

        // startDate -----------------------------------------------------------
        let _startDate = moment(startDate + "");
        if (!_startDate.isValid()) {
            _startDate = moment().subtract(1, "year").startOf("year");
        }

        // orgId(s) ------------------------------------------------------------
        if (!orgId) {
            let rows = await DB.promise("all", "SELECT id FROM organizations");
            orgId = rows.map(row => row.id);
        }

        // measureId(s) --------------------------------------------------------
        if (!measureId) {
            let rows = await DB.promise("all", "SELECT id FROM measures WHERE enabled = 1");
            measureId = rows.map(row => row.id);
        }

        // DataSources ---------------------------------------------------------
        const ds = await DB.promise("all", "SELECT id FROM ds");
        const dsId = ds.map(row => row.id);

        // Generate data -------------------------------------------------------
        const orgIds     = Array.isArray(orgId    ) ? orgId     : [orgId    ];
        const measureIds = Array.isArray(measureId) ? measureId : [measureId];

        for (let _orgId of orgIds) {
            for (let _measureId of measureIds) {
                for (let _dsId of dsId) {
                    await generate(_orgId, _measureId, _startDate, _dsId);
                }
            }
        }
    }
}

module.exports = Measure;
