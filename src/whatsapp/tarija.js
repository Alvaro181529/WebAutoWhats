const { Client, LocalAuth } = require("whatsapp-web.js");

let QRtarija = "";
let estadoTarija = "";
let statusTarija = "";

async function ClientTJ() {
  const tarija = new Client({
    authStrategy: new LocalAuth({ clientId: "tarija" }),
  });

  tarija.on("qr", (qr) => {
    QRtarija = qr;
  });

  tarija.on("ready", () => {
    console.log("Client is ready!");
    estadoTarija = "conectado";
  });
  tarija.on("message_ack", (msg, ack) => {
    statusTarija = ack;
  });
  await tarija.initialize();
  return tarija;
}

function codigoQRTJ() {
  return QRtarija;
}

function estadoConexionTJ() {
  return estadoTarija;
}
function callbackStatusTJ() {
  return statusTarija;
}
async function enviarMensaje(cliente, numero, mensaje) {
  try {
    const resultado = await cliente.sendMessage(numero, mensaje);
    console.log('Mensaje enviado con éxito');
    return resultado
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
  }
}
module.exports = { ClientTJ, codigoQRTJ, estadoConexionTJ, enviarMensaje, callbackStatusTJ };
