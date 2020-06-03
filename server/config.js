require("dotenv").config();

const { env } = process;

module.exports = {
    host: env.HOST || "0.0.0.0",
    port: +(env.PORT || 3003),
    db: {
        host              : env.DB_HOST,
        user              : env.DB_USER,
        password          : env.DB_PASS,
        database          : env.DB_SCHEMA,
        waitForConnections: env.DB_WAIT_FOR_CONNECTION !== "false",
        connectionLimit   : +(env.DB_CONNECTION_LIMIT || 10),
        queueLimit        : +(env.DB_QUEUE_LIMIT || 0)
    }
};
