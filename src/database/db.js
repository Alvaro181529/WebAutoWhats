// const { createPool } = require("mysql2/promise");
// const conn = createPool({
//   host: "172.65.10.50",
//   port: 3306,
//   database: "trackpak",
//   user: "agbc",
//   password: "Correos.2023",
// });
// module.exports = { conn };

const { createPool } = require("mysql2/promise");
const conn = createPool({
  host: "localhost",
  port: 3306,
  database: "trackpak",
  user: "root",
  password: "",
});
module.exports = { conn };
