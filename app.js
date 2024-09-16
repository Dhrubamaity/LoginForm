const express = require("express");
const app = express();
const path = require("path");
const usermodel = require("./model/mongoose");
const cookieparser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const port = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index")
});


app.get("/create", (req, res) => {
    res.render("signup")
});
app.post("/create", (req, res) => {
    let { username, email, password } = req.body;
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            let user = await usermodel.create({
                username,
                email,
                password: hash
            });
        });
        let token = jwt.sign({ email }, 'Dhruba');
        res.cookie("token", token);
        console.log("Your account created sucessfully");
        res.redirect("/");
    });
});

app.get("/login", (req, res) => {
    res.render("login")
});
app.post("/login", async (req, res) => {
    let { username, email, password } = req.body;
    let user = await usermodel.findOne({ email });
    if (!user) {
        res.send("something went wrong");
    } else {
        bcrypt.compare(password, user.password, function (err, result) {
            if (!result)
                res.send("something went wrong");
            else {
                let token = jwt.sign({ email }, 'Dhruba');
                res.cookie("token", token);
                console.log("you logged in");
                res.redirect("/");
            }
        });
    }
});


app.get("/logout", (req, res) => {
    res.cookie("token", "");
    console.log("you logged out");
    res.redirect("/");
});

app.listen(port, (req, res) => {
    console.log(`appis listening on port ${port}`)
});