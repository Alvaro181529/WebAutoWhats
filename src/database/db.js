const { createPool } = require("mysql2/promise")
const conn = createPool({
    host: "localhost",
    port: 3306,
    database: "trackpak",
    user: "root",
    password: "",
})
module.exports ={conn}