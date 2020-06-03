const express      = require("express");
const cookieParser = require("cookie-parser");
const path         = require("path");
const config       = require("./config");
const auth         = require("./controllers/auth");
const api          = require("./api");
const sql          = require("./sql");

const app = express();

app.use(express.static(__dirname + '/../build'));

// @ts-ignore
app.use(cookieParser());
app.use("/auth", auth.router);
app.use("/api" , api.router );
app.use("/sql" , sql.router );

// This is to catch 404s on page refresh and pass them to index.html to be
// handled by react router
app.get('*', (req, res) => res.sendFile(path.join(__dirname + '/../build/index.html')));

app.listen(+config.port, config.host, () => {
    console.log(`Server listening at ${config.host}:${config.port}`);
});
