//main.js
const express = require("express");
const morgan = require("morgan");
const http = require("http")
const { Server } = require("socket.io")
const path = require('path')

const urlLP = require("./routes/lapaz")
const urlOR = require("./routes/oruro")
const urlSC = require("./routes/santacruz")
const urlCBBA = require("./routes/cochabamba")
const urlTJ = require("./routes/tarija")
const urlBN = require("./routes/beni")
const urlPT = require("./routes/potosi")
const urlSR = require("./routes/sucre")
const urlPN = require("./routes/pando")
const urlADM = require("./routes/admin")

const sockets = require("./sockets/sockets")

const app = new express();
const server = http.createServer(app);
const io = new Server(server)

app.set('case sensitive routing', true)
app.set('appName', 'Whatsapp');
app.set('port', 4000)

// app.use(morgan('tiny'));
app.use(express.json())

sockets(io)

app.use("/dashboard", express.static(path.join(__dirname, 'city')));//lp md5
app.use("/admin", express.static(path.join(__dirname, 'city/admin')));//lp md5
app.use("/351325a660b25474456af5c9a5606c4e", express.static(path.join(__dirname, 'city/lapaz')));//lp md5
app.use("/e81c4e4f2b7b93b481e13a8553c2ae1b", express.static(path.join(__dirname, 'city/oruro')));//or md5
app.use("/d54185b71f614c30a396ac4bc44d3269", express.static(path.join(__dirname, 'city/santacruz')));//sc
app.use("/fc0d3973041531f8bd9496afbcd0bd24", express.static(path.join(__dirname, 'city/cochabamba')));//cbba
app.use("/456c2e75fe0faa57fd1cfd87117e0963", express.static(path.join(__dirname, 'city/tarija')));//tj
app.use("/ea804e881365b39d9d9364ee1707311b", express.static(path.join(__dirname, 'city/beni')));//bn
app.use("/fc9fdf084e290f26a270390dc49061a2", express.static(path.join(__dirname, 'city/potosi')));//pt
app.use("/e22428ccf96cda9674a939c209ad1000", express.static(path.join(__dirname, 'city/sucre')));//sr
app.use("/ded0804cf804b6d26e37953dc2dbc505", express.static(path.join(__dirname, 'city/pando')));//pn

app.use(urlLP)
app.use(urlOR)
app.use(urlSC)
app.use(urlCBBA)
app.use(urlTJ)
app.use(urlBN)
app.use(urlPT)
app.use(urlSR)
app.use(urlPN)
app.use(urlADM)

server.listen(app.get('port'));
console.log(`servidor encendido ${app.get('appName')}`)