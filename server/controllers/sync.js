const moment   = require("moment");
const DB       = require("./db");
const pool     = require("../dbPool");

// The data that we use does not come from data sets that match the data sets
// used in out PopHealth app. To simulate those, we run the queries as usual, 
// but introduce some randomness by excluding some portion of the results. This
// way we end up with somewhat different results for each dataset.
const RANDOMNESS = 0.33;

// LOINC Codes used for various types of hypertension
const hypertensionCodes = [
    "1201005", // Benign essential hypertension
    "38341003" // Essential hypertension
];

// LOINC Codes used for vaccines that we check for
const vaccineCodes = [
    "62",  // HPV, quadrivalent
    "114", // meningococcal MCV4P
    "115"  // Tdap
];

// LOINC Code for blood pressure that we use
const bpCode = "55284-4";

/**
 * Fetch results for the hypertension quality measure. This function needs to be
 * called once for each year, organization and dataset
 * @param {number|string} year 4 digit year 
 * @param {string} orgId Organization ID: "bch" | "po" | "ppoc"
 * @param {string} dsId Dataset ID: "bch_cerner" | "bch_epic"
 */
async function syncHypertension(year, orgId, dsId)
{
    const startDate = `${year}-01-01`;
    const endDate   = `${year}-12-31`;

    // Select the minimum information that we can work with
    let sql = "SELECT ";

    // Average systolic BP per patient per month
    sql += "AVG(o.resource_json ->> '$.component[0].valueQuantity.value') AS systolic, ";

    // Average diastolic BP per patient per month
    sql += "AVG(o.resource_json ->> '$.component[1].valueQuantity.value') AS diastolic, ";

    // The patient ID of each group
    sql += "SUBSTRING_INDEX(o.resource_json ->> '$.subject.reference', '/', -1) AS patient, ";

    // The month of each group
    sql += "MONTH(o.resource_json ->> '$.effectiveDateTime') AS `month` ";

    // Select from observations
    sql += "FROM Observation o WHERE ";

    // Only use BP observations
    sql += `o.resource_json ->> '$.code.coding[0].code' = '${bpCode}' `;

    // Randomize to simulate different data for the given dataset
    sql += `AND RAND() > ${RANDOMNESS} `;

    // The observation must be taken after (or at) the beginning of the year
    sql += `AND DATEDIFF(o.resource_json ->> '$.effectiveDateTime', '${startDate}') >= 0 `;

    // The observation must be taken before (or at) the end of the year
    sql += `AND DATEDIFF(o.resource_json ->> '$.effectiveDateTime', '${endDate}') <= 365 `;

    // The observation must be for patients between 18 and 64 with HTN
    sql += "AND SUBSTRING_INDEX(o.resource_json ->> '$.subject.reference', '/', -1) IN (" +
            "SELECT p.resource_id FROM Patient AS p JOIN `Condition` AS c ON (" +
            "c.resource_json ->> '$.subject.reference' = CONCAT('Patient/', p.resource_id)) " +
            `WHERE c.resource_json ->> '$.code.coding[0].code' IN ('${hypertensionCodes.join("', '")}') ` +
            `AND DATE_ADD(p.resource_json ->> '$.birthDate', INTERVAL 18 YEAR) <= DATE('${startDate}') ` +
            `AND DATE_ADD(p.resource_json ->> '$.birthDate', INTERVAL 64 YEAR) >= DATE('${endDate}')) `;

    // Group by patient and month to compute the averages
    sql += "GROUP BY patient, `month`";

    // console.log(sql);

    const [rows] = await pool.query(sql);

    let DENOMINATOR = rows.length;

    // For each month, count how many patients have average BP below the thresholds?
    // We start by assuming that all patients are OK, and then subtract those
    // for whom we have high BP data.
    let months = [
        DENOMINATOR, DENOMINATOR, DENOMINATOR, DENOMINATOR,
        DENOMINATOR, DENOMINATOR, DENOMINATOR, DENOMINATOR,
        DENOMINATOR, DENOMINATOR, DENOMINATOR, DENOMINATOR
    ];

    rows.forEach(row => {

        // Increment this for every patient
        DENOMINATOR += 1;

        // Increment the month value for each patient who does NOT have
        // average hypertension during that month
        if (row.systolic > 140 || row.diastolic > 90) {
            months[row.month - 1] -= 1;
        }
    });

    // console.log(months);

    const tasks = months.map((numerator, index) => DB.promise(
        "run",
        "INSERT OR REPLACE INTO measure_results_2 (" +
            "measure_id, date, numerator, denominator, org_id, ds_id" +
        ") VALUES (?, ?, ?, ?, ?, ?)",
        [
            "controlling_high_blood_pressure",
            `${year}-${index + 1 < 10 ? "0" + (index + 1) : index + 1 }-01`,
            numerator,
            DENOMINATOR,
            orgId,
            dsId
        ]
    ));

    await Promise.all(tasks);
}

/**
 * Fetch results for the Immunizations For Adolescents quality measure. This
 * function needs to be called once for each year, organization and dataset
 * @param {number|string} year 4 digit year 
 * @param {string} orgId Organization ID: "bch" | "po" | "ppoc"
 * @param {*} dsId Dataset ID: "bch_cerner" | "bch_epic"
 */
async function syncImmunizationsForAdolescents(year, orgId, dsId)
{
    const startDate = `${year}-01-01`;
    const endDate   = `${year}-12-31`;

    // Select the minimum information that we can work with - patient ID,
    // vaccine code and vaccine date
    let sql = `SELECT
        p.resource_json ->> '$.id'         AS \`id\`,
        i.code                             AS \`vaccineCode\`,
        date(i.resource_json ->> '$.date') AS \`vaccineDate\`
    FROM Patient AS p
    LEFT JOIN Immunization i ON (
        i.resource_json ->> '$.patient.reference' = CONCAT('Patient/', p.resource_id)`;

    // Only take immunizations made before the end of the year
    sql += ` AND DATE(i.resource_json ->> '$.date') <= DATE("${endDate}")`;

    // Only take HPV, MCV4P and Tdap immunizations
    sql += ` AND i.code IN('${vaccineCodes.join("', '")}')`;

    // Only take patients who would turn 13 years within the selected year
    sql += ` )
    WHERE
        DATE_ADD(p.resource_json ->> '$.birthDate', INTERVAL 13 YEAR) > Date("${startDate}") AND
        DATE_ADD(p.resource_json ->> '$.birthDate', INTERVAL 13 YEAR) < Date("${endDate}")`;

    // Randomize to simulate different data for the given dataset
    sql += ` AND RAND() > ${RANDOMNESS} `;

    sql += " ORDER BY DATE(i.resource_json ->> '$.date')";

    // console.log(sql);

    const [rows] = await pool.query(sql);

    let patients     = {};
    let DENOMINATOR  = 0;
    let NUMERATORS   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    rows.forEach(row => {
        let pt = patients[row.id];
        if (!pt) {
            pt = patients[row.id] = {
                "62" : 0, // HPV, quadrivalent
                "114": 0, // meningococcal MCV4P
                "115": 0  // Tdap
            };
            DENOMINATOR += 1;
        }

        // Don't care for repeated immunizations
        if (pt.completed) return;

        if (row.vaccineCode) {
            pt[row.vaccineCode] = 1;
            if (pt["62"] && pt["114"] && pt["115"]) {
                let month = moment(row.vaccineDate).month();
                NUMERATORS[month] += 1;
                pt.completed = 1;
            }
        }
    });

    let total = 0;
    NUMERATORS = NUMERATORS.map(cur => {
        total += cur;
        return total;
    });
    // console.log(DENOMINATOR, NUMERATORS);

    const tasks = NUMERATORS.map((numerator, index) => DB.promise(
        "run",
        "INSERT OR REPLACE INTO measure_results_2 (" +
            "measure_id, date, numerator, denominator, org_id, ds_id" +
        ") VALUES (?, ?, ?, ?, ?, ?)",
        [
            "immunization_for_adolescents",
            `${year}-${index + 1 < 10 ? "0" + (index + 1) : index + 1 }-01`,
            numerator,
            DENOMINATOR,
            orgId,
            dsId
        ]
    ));

    await Promise.all(tasks);
}

function *syncAllHypertensions(startDate, endDate)
{
    yield syncHypertension(startDate.year(), "bch" , "bch_cerner");
    yield syncHypertension(endDate  .year(), "bch" , "bch_cerner");
    yield syncHypertension(startDate.year(), "po"  , "bch_cerner");
    yield syncHypertension(endDate  .year(), "po"  , "bch_cerner");
    yield syncHypertension(startDate.year(), "ppoc", "bch_cerner");
    yield syncHypertension(endDate  .year(), "ppoc", "bch_cerner");
    yield syncHypertension(startDate.year(), "bch" , "bch_epic"  );
    yield syncHypertension(endDate  .year(), "bch" , "bch_epic"  );
    yield syncHypertension(startDate.year(), "po"  , "bch_epic"  );
    yield syncHypertension(endDate  .year(), "po"  , "bch_epic"  );
    yield syncHypertension(startDate.year(), "ppoc", "bch_epic"  );
    yield syncHypertension(endDate  .year(), "ppoc", "bch_epic"  );
}

function *syncAllImmunizationsForAdolescents(startDate, endDate)
{
    yield syncImmunizationsForAdolescents(startDate.year(), "bch" , "bch_cerner");
    yield syncImmunizationsForAdolescents(endDate  .year(), "bch" , "bch_cerner");
    yield syncImmunizationsForAdolescents(startDate.year(), "po"  , "bch_cerner");
    yield syncImmunizationsForAdolescents(endDate  .year(), "po"  , "bch_cerner");
    yield syncImmunizationsForAdolescents(startDate.year(), "ppoc", "bch_cerner");
    yield syncImmunizationsForAdolescents(endDate  .year(), "ppoc", "bch_cerner");
    yield syncImmunizationsForAdolescents(startDate.year(), "bch" , "bch_epic"  );
    yield syncImmunizationsForAdolescents(endDate  .year(), "bch" , "bch_epic"  );
    yield syncImmunizationsForAdolescents(startDate.year(), "po"  , "bch_epic"  );
    yield syncImmunizationsForAdolescents(endDate  .year(), "po"  , "bch_epic"  );
    yield syncImmunizationsForAdolescents(startDate.year(), "ppoc", "bch_epic"  );
    yield syncImmunizationsForAdolescents(endDate  .year(), "ppoc", "bch_epic"  );
}

async function syncAll(startDate, endDate)
{
    let i = 0;
    for await (const _ of syncAllImmunizationsForAdolescents(startDate, endDate)) {
        console.log(`Synchronize immunizations: ${Math.round(++i/12 * 100)}%`);
    }
    i = 0;
    for await (const _ of syncAllHypertensions(startDate, endDate)) {
        console.log(`Synchronize hypertensions: ${Math.round(++i/12 * 100)}%`);
    }
    console.log("Synchronization complete!");
}

module.exports = {
    syncAll,
    syncHypertension,
    syncAllHypertensions,
    syncImmunizationsForAdolescents,
    syncAllImmunizationsForAdolescents
};
