const { Client, LocalAuth } = require("whatsapp-web.js");

let QRlapaz = "";
let estadoLapaz = "";
let statusLapaz = "";

async function ClientLP() {
 const lapaz = new Client({
    authStrategy: new LocalAuth({ clientId: "lapaz" }),
  });

  lapaz.on("qr", (qr) => {
    QRlapaz = qr;
  });

  lapaz.on("ready", () => {
    console.log("Client is ready!");
    estadoLapaz = "conectado";
  });
  lapaz.on("message_ack", (msg, ack) => {
    statusLapaz = ack;
  });
  await lapaz.initialize();
  return lapaz ;
}

function codigoQRLPZ() {
  return QRlapaz;
}
function estadoConexionLPZ() {
  return estadoLapaz;
}
function callbackStatusLPZ() {
  return statusLapaz;
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

  await cliente.disconnect();
  await cliente.logout();

}
module.exports = { ClientLP, codigoQRLPZ, estadoConexionLPZ, enviarMensaje, callbackStatusLPZ, cerrarSesion };
 