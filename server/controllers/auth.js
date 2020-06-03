const { Router } = require("express");
const bodyParser = require("body-parser");
const Crypto     = require("crypto");
const lib        = require("../lib");
const db         = require("./db");
const router     = exports.router = Router({ mergeParams: true });

// The authentication middleware
exports.authenticate = async (req, res, next) => {
    const { sid } = req.cookies;
    if (sid) {
        const user = await db.promise("get", "SELECT * FROM users WHERE sid = ?", sid);
        if (user) {
            req.user = user;
            return next();
        }
    }
    res.status(401).json({
        code: 401,
        statusText: "Unauthorized"
    });
};

// The login function
async function login({ username = "", password = "" }) {

    // Introduce artificial delay to protect against automated brute-force attacks
    await lib.resolveAfter(500);

    // Look up the user in DB
    const user = await db.promise("get", "SELECT * FROM users WHERE username = ?", username);

    // No such username
    // Do NOT specify what is wrong in the error message!
    if (!user) {
        throw new Error("Invalid username or password");
    }

    // Wrong password
    // Do NOT specify what is wrong in the error message!
    // This is a demo app so the passwords are not encrypted. In real apps that
    // is NOT acceptable.
    if (user.password !== password) {
        throw new Error("Invalid username or password");
    }

    // If already logged in (E.g. from another browser) use the same session
    if (user.sid) {
        return user;
    }

    // Generate SID and update the user in DB
    const sid = Crypto.randomBytes(32).toString("hex");
    const lastLogin = new Date();

    // Update user's lastLogin and sid properties
    await db.promise("run", "UPDATE users SET sid=?, lastLogin=datetime('now') WHERE id=?", sid, user.id);
    user.sid = sid;
    user.lastLogin = lastLogin;

    // return the logged-in user
    return user;
}

// POST /login { username, password }
router.post("/login", bodyParser.urlencoded({ extended: true }), async (req, res) => {
    try {
        const user = await login(req.body);
        res.cookie("sid", user.sid, { httpOnly: true, sameSite: "strict" });
        res.json({
            username : user.username,
            lastLogin: user.lastLogin
        });
    } catch (ex) {
        console.error(ex);
        res.status(401).json({ error: ex.message });
    }
});

// GET /logout
router.get("/logout", async (req, res) => {

    // Introduce artificial delay to protect against automated brute-force attacks
    await lib.resolveAfter(500);

    const { sid } = req.cookies;

    if (sid) {
        try {
            await db.promise("run", "UPDATE users SET sid = NULL WHERE sid = ?", sid);
        } catch (e) {
            console.error(e);
        } finally {
            // @ts-ignore
            if (req.user) req.user.sid = null;
        }
    }

    res.clearCookie("sid").json({ success: true });
});
