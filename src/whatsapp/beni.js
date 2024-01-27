const { Client, LocalAuth } = require("whatsapp-web.js");

let QRbeni = "";
let estadoBeni = "";
let statusBeni = "";

async function ClientBN() {
  const beni = new Client({
    authStrategy: new LocalAuth({ clientId: "beni" }),
  });

  beni.on("qr", (qr) => {
    QRbeni = qr;
  });

  beni.on("ready", () => {
    console.log("Client is ready!");
    const info = beni.getClientInfo();
    console.log(info);
    estadoBeni = "conectado";
  });
  beni.on("message_ack", (msg, ack) => {
    statusBeni = ack;
  });
  await beni.initialize();
  return beni;
}

function codigoQRBN() {
  return QRbeni;
}
function estadoConexionBN() {
  return estadoBeni;
}
function callbackStatusBN() {
  return statusBeni;
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
module.exports = { ClientBN, codigoQRBN, estadoConexionBN, enviarMensaje, callbackStatusBN ,cerrarSesion};
