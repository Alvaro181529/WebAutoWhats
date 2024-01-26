const CryptoJS = require("crypto-js")
const bpass = require("../database/mensajes/bpass.json");
exports.adminControllerAuth = (req, res) => {
    const { pass } = req.body;
    const adminPage = bpass[10].pass; // pass adminPage
    const password = CryptoJS.MD5(adminPage).toString();
    const auth = CryptoJS.MD5(pass).toString();
    if (auth === password) {
        res.send("pass");
    } else {
        res.send("incorrecto");
    }
};
exports.adminUsersController = (req, res) => {
    res.json(bpass)
};
exports.adminUpdateController = (req, res) => {
    console.log(req.body, req.params)
    const { id } = req.params;
    const { pass } = req.body;

    bpass.forEach((users, i) => {
        if (users.id == id) {
            users.pass = pass;
        }
    });
    res.json('Successfully updated');
}