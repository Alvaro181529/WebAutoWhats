const { Client, LocalAuth } = require("whatsapp-web.js");

let QRpotosi = "";
let estadoPotosi = "";
let statusPotosi = "";

async function ClientPT() {
  const potosi = new Client({
    authStrategy: new LocalAuth({ clientId: "potosi" }),
  });

  potosi.on("qr", (qr) => {
    QRpotosi = qr;
  });

  potosi.on("ready", () => {
    console.log("Client is ready!");
    estadoPotosi = "conectado";
  });
  potosi.on("message_ack", (msg, ack) => {
    statusPotosi = ack;
  });
  await potosi.initialize();
  return potosi ;
}

function codigoQRPT() {
  return QRpotosi;
}
function estadoConexionPT() {
  return estadoPotosi;
}
function callbackStatusPT() {
  return statusPotosi;
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

module.exports = { ClientPT, codigoQRPT, estadoConexionPT, enviarMensaje, callbackStatusPT };
