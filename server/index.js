const express      = require("express");
const cookieParser = require("cookie-parser");
const path         = require("path");
const config       = require("./config");
const auth         = require("./controllers/auth");
const api          = require("./api");
const sql          = require("./sql");
const health       = require("./health")

const app = express();

app.use(cookieParser());
app.use("/auth"  , auth.router  );
app.use("/api"   , api.router   );
app.use("/sql"   , sql.router   );
app.use("/health", health.router);

app.listen(+config.port, config.host, () => {
    console.log(`Server listening at ${config.host}:${config.port}`);
});
