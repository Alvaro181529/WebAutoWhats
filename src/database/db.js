const { createPool } = require("mysql2/promise");
const conn = createPool({
  host: "127.0.0.1",
  // host: "172.65.14.180",
  port: 3306,
  database: "trackpak",
  user: "root",
  password: "",
});
module.exports = { conn };
