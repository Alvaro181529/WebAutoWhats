const { Client, LocalAuth } = require("whatsapp-web.js");

let QRsantacruz = "";
let estadoSantacruz = "";
let statusSantacruz = "";
let contacto = "";
async function ClientSC() {
  const santacruz = new Client({
    puppeteer: {
      headless: true,
        args: [
          '--no-sandbox',
          '--disable-site-isolation-trials',
          '--disable-setuid-sandbox',
        ],
    },
    authStrategy: new LocalAuth({ clientId: "santacruz" }),
  });

  santacruz.on("qr", (qr) => {
    QRsantacruz = qr;
  });

  santacruz.on("ready", () => {
    console.log("Client is ready!");
    estadoSantacruz = "conectado";
    const user = santacruz.info.me.user
    contacto = user.slice(-8);
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
function contactoSC() {
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
module.exports = { ClientSC,contactoSC, codigoQRSC, estadoConexionSC, enviarMensaje, callbackStatusSC ,cerrarSesion};
