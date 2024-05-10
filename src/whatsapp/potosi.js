const { Client, LocalAuth } = require("whatsapp-web.js");

let QRpotosi = "";
let estadoPotosi = "";
let statusPotosi = "";
let contacto ="";
async function ClientPT() {
  const potosi = new Client({
    puppeteer: {
      headless: true,
        args: [
          '--no-sandbox',
          '--disable-site-isolation-trials',
          '--disable-setuid-sandbox',
        ],
    },
    authStrategy: new LocalAuth({ clientId: "potosi" }),
    webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', } });


  potosi.on("qr", (qr) => {
    QRpotosi = qr;
  });

  potosi.on("ready", () => {
    console.log("Client is ready!");
    estadoPotosi = "conectado";
    const user = potosi.info.me.user
    contacto = user.slice(-8);


  });
  potosi.on("message_ack", (msg, ack) => {
    statusPotosi = ack;
  });
  await potosi.initialize();
  return potosi ;
}

function codigoQRPT() {
  return QRpotosi;
}
function estadoConexionPT() {
  return estadoPotosi;
}
function callbackStatusPT() {
  return statusPotosi;
}
function contactoPT() {
  return contacto;
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
async function cerrarSesion(cliente){

  await cliente.logout();

}
module.exports = { ClientPT,contactoPT, codigoQRPT, estadoConexionPT, enviarMensaje, callbackStatusPT,cerrarSesion };
