const { Client, LocalAuth } = require("whatsapp-web.js");

let QRoruro = "";
let estadoOruro = "";
let statusOruro = "";

async function ClientOR() {
  const oruro = new Client({
    authStrategy: new LocalAuth({ clientId: "oruro" }),
  });

  oruro.on("qr", (qr) => {
    QRoruro = qr;
  });

  oruro.on("ready", () => {
    console.log("Client is ready!");
    estadoOruro = "conectado";
  });
  oruro.on("message_ack", (msg, ack) => {
    statusOruro = ack;
  });
  await oruro.initialize();
  return oruro ;
}

function codigoQROR() {
  return QRoruro;
}
function estadoConexionOR() {
  return estadoOruro;
}
function callbackStatusOR() {
  return statusOruro;
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
module.exports = { ClientOR, codigoQROR, estadoConexionOR, enviarMensaje, callbackStatusOR,cerrarSesion };
