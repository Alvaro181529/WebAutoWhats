const { Client, LocalAuth } = require("whatsapp-web.js");

let QRcochabamba = "";
let estadoCochabamba = "";
let statusCochabamba = "";
let contacto = "";

async function ClientCBBA() {
  const cochabamba = new Client({
    puppeteer: {
      headless: true,
        args: [
          '--no-sandbox',
          '--disable-site-isolation-trials',
          '--disable-setuid-sandbox',
        ],
    },
    authStrategy: new LocalAuth({ clientId: "cochabamba" }),
  });

  cochabamba.on("qr", (qr) => {
    QRcochabamba = qr;
  });

  cochabamba.on("ready", () => {
    console.log("Client is ready!");
    estadoCochabamba = "conectado";
    const user = cochabamba.info.me.user
    contacto = user.slice(-8);


  });
  cochabamba.on("message_ack", (msg, ack) => {
    statusCochabamba = ack;
  });
  await cochabamba.initialize();
  return cochabamba;
}

function codigoQRCBBA() {
  return QRcochabamba;
}
function estadoConexionCBBA() {
  return estadoCochabamba;
}
function callbackStatusCBBA() {
  return statusCochabamba;
}
function contactoCBBA() {
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
module.exports = { ClientCBBA,contactoCBBA, codigoQRCBBA, estadoConexionCBBA, enviarMensaje, callbackStatusCBBA ,cerrarSesion};
