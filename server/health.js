const { Router } = require("express");

const router = exports.router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
    const result = {message: "I'm healthy!"};
    res.json(result);
})