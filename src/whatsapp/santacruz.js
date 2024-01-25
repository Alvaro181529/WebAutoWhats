const { Client, LocalAuth } = require("whatsapp-web.js");

let QRsantacruz = "";
let estadoSantacruz = "";
let statusSantacruz = "";

async function ClientSC() {
  const santacruz = new Client({
    authStrategy: new LocalAuth({ clientId: "santacruz" }),
  });

  santacruz.on("qr", (qr) => {
    QRsantacruz = qr;
  });

  santacruz.on("ready", () => {
    console.log("Client is ready!");
    estadoSantacruz = "conectado";
  });
  santacruz.on("message_ack", (msg, ack) => {
    statusSantacruz = ack;
  });
  await santacruz.initialize();
  return santacruz ;
}

function codigoQRSC() {
  return QRsantacruz;
}
function estadoConexionSC() {
  return estadoSantacruz;
}
function callbackStatusSC() {
  return statusSantacruz;
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
async function cerrarSesion(cliente){

  await cliente.logout();

}
module.exports = { ClientSC, codigoQRSC, estadoConexionSC, enviarMensaje, callbackStatusSC ,cerrarSesion};
