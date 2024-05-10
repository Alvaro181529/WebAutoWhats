const { Client, LocalAuth } = require("whatsapp-web.js");

let QRtarija = "";
let estadoTarija = "";
let statusTarija = "";
let contacto = "";
async function ClientTJ() {
  const tarija = new Client({
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-site-isolation-trials',
        '--disable-setuid-sandbox',
      ],
    },
    authStrategy: new LocalAuth({ clientId: "tarija" }),
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', }
  });


  tarija.on("qr", (qr) => {
    QRtarija = qr;
  });

  tarija.on("ready", () => {
    console.log("Client is ready!");
    estadoTarija = "conectado";
    const user = tarija.info.me.user
    contacto = user.slice(-8);
  });
  tarija.on("message_ack", (msg, ack) => {
    statusTarija = ack;
  });
  await tarija.initialize();
  return tarija;
}

function codigoQRTJ() {
  return QRtarija;
}

function estadoConexionTJ() {
  return estadoTarija;
}
function callbackStatusTJ() {
  return statusTarija;
}
function contactoTJ() {
  return statusTarija;
}
async function enviarMensaje(cliente, numero, mensaje) {
  try {
    const resultado = await cliente.sendMessage(numero, mensaje);
    console.log('Mensaje enviado con éxito');
    return resultado
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return null
  }
}
async function cerrarSesion(cliente) {

  await cliente.logout();

}
module.exports = { ClientTJ, contactoTJ, codigoQRTJ, estadoConexionTJ, enviarMensaje, callbackStatusTJ, cerrarSesion };
