const { Client, LocalAuth } = require("whatsapp-web.js");

let QRpando = "";
let estadoPando = "";
let statusPando = "";
let contacto="";
async function ClientPN() {
  const pando = new Client({
    authStrategy: new LocalAuth({ clientId: "pando" }),
  });

  pando.on("qr", (qr) => {
    QRpando = qr;
  });

  pando.on("ready", () => {
    console.log("Client is ready!");
    estadoPando = "conectado";
    const user = pando.info.me.user
    contacto = user.slice(-8);

  });
  pando.on("message_ack", (msg, ack) => {
    statusPando = ack;
  });
  await pando.initialize();
  return  pando ;
}

function codigoQRPN() {
  return QRpando;
}
function estadoConexionPN() {
  return estadoPando;
}
function callbackStatusPN() {
  return statusPando;
}
function contactoPN() {
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
module.exports = { ClientPN,contactoPN, codigoQRPN, estadoConexionPN, enviarMensaje, callbackStatusPN ,cerrarSesion};
