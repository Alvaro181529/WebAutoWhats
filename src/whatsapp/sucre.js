const { Client, LocalAuth } = require("whatsapp-web.js");

let QRsucre = "";
let estadoSucre = "";
let statusSucre = "";
let contacto="";
async function ClientSR() {
  const sucre = new Client({
    authStrategy: new LocalAuth({ clientId: "sucre" }),
  });

  sucre.on("qr", (qr) => {
    QRsucre = qr;
  });

  sucre.on("ready", () => {
    console.log("Client is ready!");
    estadoSucre = "conectado";
    const user = sucre.info.me.user
    contacto = user.slice(-8);
  });
  sucre.on("message_ack", (msg, ack) => {
    statusSucre = ack;
  });
  await sucre.initialize();
  return  sucre ;
}

function codigoQRSR() {
  return QRsucre;
}
function estadoConexionSR() {
  return estadoSucre;
}
function callbackStatusSR() {
  return statusSucre;
}
function contactoSR() {
  return contacto;
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
module.exports = { ClientSR,contactoSR, codigoQRSR, estadoConexionSR, enviarMensaje, callbackStatusSR,cerrarSesion };
