const { Client, LocalAuth } = require("whatsapp-web.js");

let QRcochabamba = "";
let estadoCochabamba = "";
let statusCochabamba = "";

async function ClientCBBA() {
  const cochabamba = new Client({
    authStrategy: new LocalAuth({ clientId: "cochabamba" }),
  });

  cochabamba.on("qr", (qr) => {
    QRcochabamba = qr;
  });

  cochabamba.on("ready", () => {
    console.log("Client is ready!");
    estadoCochabamba = "conectado";
  });
  cochabamba.on("message_ack", (msg, ack) => {
    statusCochabamba = ack;
  });
  await cochabamba.initialize();
  return cochabamba;
}

function codigoQRCBBA() {
  return QRcochabamba;
}
function estadoConexionCBBA() {
  return estadoCochabamba;
}
function callbackStatusCBBA() {
  return statusCochabamba;
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
module.exports = { ClientCBBA, codigoQRCBBA, estadoConexionCBBA, enviarMensaje, callbackStatusCBBA };
