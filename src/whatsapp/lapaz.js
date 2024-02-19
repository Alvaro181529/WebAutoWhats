const { Client, LocalAuth } = require("whatsapp-web.js");
const puppeteer = require('puppeteer');


let QRlapaz = "";
let estadoLapaz = "";
let statusLapaz = "";
let contacto ="";
async function ClientLP() {
  // Configuración de Puppeteer
const browser = await puppeteer.launch({
  args: ['--no-sandbox']
});

 const lapaz = new Client({
    authStrategy: new LocalAuth({ clientId: "lapaz" }),
  });

  lapaz.on("qr", (qr) => {
    QRlapaz = qr;
  });

  lapaz.on("ready", () => {
    console.log("Client is ready!");
    estadoLapaz = "conectado";
    const user = lapaz.info.me.user
    contacto = user.slice(-8);

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
}function contactoLPZ() {
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
module.exports = { ClientLP,contactoLPZ, codigoQRLPZ, estadoConexionLPZ, enviarMensaje, callbackStatusLPZ, cerrarSesion };
 