const express = require("express");
//const router = express.Router();
const router = express.Router();

router.get("/", (req, res) => {
    console.log("root path hit in index.js");
    let user = req.cookies.user;
    if (user) {
        res.render("chat");
    }
    else {
        res.render("index");
    }
});

router.post("/", (req, res) => {
    let username = req.body.username;
    res.cookie("user", username);
    res.redirect("/");
});


module.exports = router;
