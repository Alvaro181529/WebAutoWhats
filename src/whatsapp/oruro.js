const { Client, LocalAuth } = require("whatsapp-web.js");

let QRoruro = "";
let estadoOruro = "";
let statusOruro = "";
let contacto = "";

async function ClientOR() {
  const oruro = new Client({
    puppeteer: {
      headless: true,
        args: [
          '--no-sandbox',
          '--disable-site-isolation-trials',
          '--disable-setuid-sandbox',
        ],
    },
    authStrategy: new LocalAuth({ clientId: "oruro" }),
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', } });


  oruro.on("qr", (qr) => {
    QRoruro = qr;
  });

  oruro.on("ready", () => {
    console.log("Client is ready!");
    estadoOruro = "conectado";
    const user = oruro.info.me.user
    contacto = user.slice(-8);
  });
  oruro.on("message_ack", (msg, ack) => {
    statusOruro = ack;
  });
  await oruro.initialize();
  return oruro;
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
function contactoOR() {
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
async function cerrarSesion(cliente) {

  await cliente.logout();

}
module.exports = { ClientOR, contactoOR, codigoQROR, estadoConexionOR, enviarMensaje, callbackStatusOR, cerrarSesion };
