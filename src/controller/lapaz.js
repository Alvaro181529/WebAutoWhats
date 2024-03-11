const qrcode = require("qrcode");
const cron = require("node-cron");
const CryptoJS = require("crypto-js");
const PDFDocument = require("pdfkit-table");
const moment = require("moment");
const bpass = require("../database/mensajes/bpass.json");

const {
  ClientLP,
  codigoQRLPZ,
  estadoConexionLPZ,
  enviarMensaje,
  callbackStatusLPZ,
  cerrarSesion,
  contactoLPZ,
} = require("../whatsapp/lapaz");
let estado = "";
const mensajesLP = require("../database/mensajes/mensajesLP.json");
const {
  ejecutarConsulta,
  guardarMensajes,
  actualizarMensajes,
} = require("../database/ejecutar");
const container = {
  cliente: null,
};
exports.lapazController = (req, res) => {
  const codigo = codigoQRLPZ();
  const contacto = contactoLPZ();
  estado = estadoConexionLPZ();
  qrcode.toDataURL(codigo, (err, src) => {
    try {
      const lpl = [{ estado, codigo, contacto, code: src }];
      //lunes , martes, miercoles, 15:30hrs envio
      //jueves, viernes, 15:30hrs reenvio
      if (estado == "conectado") {
        cron.schedule("18 17 * * 1,2,3,4,5", () => {
          // cron.schedule("* * * * *", () => {
          comprobacion();
        });
        cron.schedule("0 12 * * 2,4", () => {
          // cron.schedule("* * * * *", () => {
          comprobacionReenvio();
        });
      } else {
        inicio();
      }
      res.send(lpl);
    } catch (error) {
      console.log(err, error);
    }
  });
};
const tableArray = {
  headers: [
    "N°",
    "Telefono",
    "Ciudad",
    "Mensajes",
    "Observacion",
    "Estado", 
    "Intento",
    "fecha Inicio",
    "fecha Fin",
  ],
  rows: [],
};

exports.lapazControllerReportes = async (req, res) => {
  const { date } = req.body;
  // con esta consilta sse hace el llamado para los reportes
  const pdf = `SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.Intentos ,mensajes.estado,mensajes.fecha_creacion,mensajes.fecha_actualizacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_actualizacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'LA PAZ' AND mensajes.fecha_creacion >= '${date}';`;
  const cons = await ejecutarConsulta(pdf);
  cons.forEach((row) => {
    // const intento = moment(row.Intentos)
    const etiquetaIntento = obtenerEtiquetaIntento(row.Intentos);
    const formattedDate = moment(row.fecha_creacion).format(
      "DD-MM-YYYY HH:mm:ss"
    );
    const formattedDateEnd = moment(row.fecha_actualizacion).format(
      "DD-MM-YYYY HH:mm:ss"
    );
    tableArray.rows.push([
      row.numero,
      row.TELEFONO,
      row.CUIDAD,
      row.mensajes,
      row.observacion,
      row.estado,
      etiquetaIntento,
      formattedDate,
      formattedDateEnd,
    ]);
  });

  res.writeHead(200, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=${date}-reporte.pdf`,
  });

  buildPDF(
    (data) => res.write(data), // Utiliza res.write para enviar datos al cliente
    () => {
      res.end(), (tableArray.rows = []);
    } // Llamado cuando el documento está completo
  );
};
function obtenerEtiquetaIntento(intentos) {
  switch (intentos) {
    case 0:
      return 'Envio realizado';
    case 1:
      return '1er reenvio';
    case 2:
      return '2do reenvio';
    case 3:
      return 'ultimo reenvio';
    default:
      return 'Otro valor';
  }
}
function buildPDF(dataCallback, endCallback) {
  const doc = new PDFDocument();

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  doc.fontSize(20).text("Reporte de envio");

  doc.table(tableArray, { columnsSize: [15, 50, 45, 90, 60, 35, 65,55, 55] });
  doc.end();
}

exports.lapazControllerMessage = async (req, res) => {
  //con esta consultan se hace el control de los mensajes
  const mensajes =
    "SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.estado, mensajes.fecha_actualizacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_actualizacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'LA PAZ' AND mensajes.fecha_actualizacion >= CURRENT_DATE();";
  const cons = await ejecutarConsulta(mensajes);
  res.json(cons);
};
exports.lapazControllerAuth = (req, res) => {
  const { pass } = req.body;
  const admin = bpass[9].pass;
  const lapaz = bpass[2].pass; // pass beni
  const passwordAdm = CryptoJS.MD5(admin).toString();
  const password = CryptoJS.MD5(lapaz).toString();
  const auth = CryptoJS.MD5(pass).toString();
  if (auth === password) {
    res.send("pass");
  } else if (auth === passwordAdm) {
    res.send("adm");
  } else {
    res.send("incorrecto");
  }
};
exports.logout = async (req, res) => {
  const cliente = container.cliente;
  res.json("deslogeado");
  cerrarSesion(cliente);
};
exports.NoteslapazController = (req, res) => {
  res.json(mensajesLP);
};
exports.NotesCreatelapazController = (req, res) => {
  const { mensaje } = req.body;
  mensajesLP.push({
    id: mensajesLP.length + 1,
    mensaje,
  });
  res.json("Creado Exitosamente");
};
exports.NotesUpdatelapazController = (req, res) => {
  console.log(req.body, req.params);
  const { id } = req.params;
  const { mensaje } = req.body;

  mensajesLP.forEach((mensajesL, i) => {
    if (mensajesL.id == id) {
      mensajesL.mensaje = mensaje;
    }
  });
  res.json("Actualizado Exitosamente");
};
exports.NotesDelatelapazController = (req, res) => {
  const { id } = req.params;

  mensajesLP.forEach((mensajesL, i) => {
    if (mensajesL.id == id) {
      mensajesLP.splice(i, 1);
    }
  });
  res.json("Eliminado Exitosamente");
};
async function inicio() {
  const cliente = await ClientLP();
  container.cliente = cliente; // Almacena el cliente en el contenedor
  return cliente;
}
function envio(contacto, id, estadoEnvio, ven) {
  const cliente = container.cliente;
  const randomIndex = Math.floor(Math.random() * mensajesLP.length);
  let status = callbackStatusLPZ();
  const numero = "591" + contacto + "@c.us";
  const men = mensajesLP[randomIndex].mensaje;
  const mensaje = men + " " + ven + ".";
  let estado;
  let descripcion;
  let enviados = 0;
  let rechazados = 0;

  if (typeof contacto === "number") {
    const numeroComoCadena = contacto.toString();
    const primerNumero = numeroComoCadena[0];
    const cantidadDigitos = numeroComoCadena.length;

    if (
      cantidadDigitos === 8 &&
      (primerNumero === "7" || primerNumero === "8" || primerNumero === "6")
    ) {
      switch (status) {
        case 3:
          estado = "Leído";
          break;
        case 2:
          estado = "Recibido";
          break;
        case 1:
          estado = "Enviado";
          break;
        default:
          estado = "Enviado";
          break;
      }
      descripcion = "El número es correcto.";
      enviados++;
      enviarMensaje(cliente, numero, mensaje);
    } else {
      estado = "No enviado";
      descripcion = "El número es incorrecto.";
      rechazados++;
    }
  } else {
    estado = "No enviado";
    descripcion = "No es un número.";
    rechazados++;
  }
  console.log(
    `ID: ${id}, NUMERO: ${numero}, MENSAJE: ${mensaje}, ESTADO ${estado}, DESCRIPCION ${descripcion}`
  );
  guardarMensajes(estado, mensaje, descripcion, id, estadoEnvio);
}

async function comprobacion() {
  let i = 0;
  let j = 0;
  /* YO PREGUNTO DONDE LA ZONA ESTE VACIA Y EL TELEFONO SEA 0 O NULO Y QUE ESTE CON EL ESTADO DE VENTANILLA */
  // SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';
  const packQuery =
    "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO <> 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA' AND id NOT IN (SELECT id_Telefono FROM mensajes WHERE id_Telefono IS NOT NULL) LIMIT 200;";
  const packQuery1 =
    "SELECT * FROM packages WHERE TELEFONO IS NOT NULL AND TELEFONO <> 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'DESPACHO' AND id NOT IN (SELECT id_Telefono FROM mensajes WHERE id_Telefono IS NOT NULL) LIMIT 200;";

  try {
    const resPack = await ejecutarConsulta(packQuery);
    //DESPACHO
    const resPack1 = await ejecutarConsulta(packQuery1);

    console.log("Envio mensajes:");

    const idsUnicosPack = resPack.map((item) => item.id);
    const idsUnicosPack1 = resPack1.map((item) => item.id);

    for (const idUnicoPack of idsUnicosPack) {
      i++;
      const limiteInferior = 10000;
      const limiteSuperior = 25000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resPack.find((item) => item.id === idUnicoPack);
      const id = packItem.id;
      const ven = packItem.VENTANILLA;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      envio(telefono, id, estadoEnvio, ven);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }
    console.log("Envio mensajes desde despacho:");

    for (const idUnicoPack of idsUnicosPack1) {
      i++;
      const limiteInferior = 10000;
      const limiteSuperior = 25000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resPack1.find((item) => item.id === idUnicoPack);
      const id = packItem.id;
      const ven = packItem.VENTANILLA;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      envio(telefono, id, estadoEnvio, ven);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }

    console.log("terminado");
  } catch (err) {
    console.error("Error en la comprobación:", err);
  }
}
function Reenvio(contacto, id, int, estadoEnvio, ven) {
  const cliente = container.cliente;
  const randomIndex = Math.floor(Math.random() * mensajesLP.length);
  let status = callbackStatusLPZ();
  const numero = "591" + contacto + "@c.us";
  const men = mensajesLP[randomIndex].mensaje;
  const mensaje = men + " " + ven + ".";
  let estado;
  let descripcion;
  let enviados = 0;
  let rechazados = 0;

  if (typeof contacto === "number") {
    const numeroComoCadena = contacto.toString();
    const primerNumero = numeroComoCadena[0];
    const cantidadDigitos = numeroComoCadena.length;

    if (
      cantidadDigitos === 8 &&
      (primerNumero === "7" || primerNumero === "8" || primerNumero === "6")
    ) {
      switch (status) {
        case 3:
          estado = "Leído";
          break;
        case 2:
          estado = "Recibido";
          break;
        case 1:
          estado = "Enviado";
          break;
        default:
          estado = "Enviado";
          break;
      }
      descripcion = "El número es correcto. y el mensaje fue reenviado";
      enviados++;
      enviarMensaje(cliente, numero, mensaje);
    } else {
      estado = "No enviado";
      descripcion = "El número es incorrecto. y el mensaje no fue reenviado";
      rechazados++;
    }
  } else {
    estado = "No enviado";
    descripcion = "No es un número.";
    rechazados++;
  }
  console.log(
    `ID: ${id}, NUMERO: ${numero}, MENSAJE: ${mensaje}, ESTADO ${estado}, DESCRIPCION ${descripcion}`
  );
  actualizarMensajes(estado, mensaje, descripcion, int, estadoEnvio, id);
}
async function comprobacionReenvio() {
  /* seleccina las mensajes mas antiguos y los envio */
  const menQuery1 =
    "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.intentos <3 AND packages.ESTADO = 'VENTANILLA' OR packages.ESTADO = 'DESPACHO' AND CUIDAD='LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 200;";

  /* revisara si los paquetes ya fueron entregados */
  const menQuery2 =
    "SELECT mensajes.*, packages.ESTADO, packages.TELEFONO,packages.VENTANILLA FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.intentos >= 0 AND packages.ESTADO = 'ENTREGADO' AND mensajes.entrega = 'ventanilla' AND CUIDAD = 'LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 300;";

  try {
    const resMen1 = await ejecutarConsulta(menQuery1);
    const resMen2 = await ejecutarConsulta(menQuery2);

    const idsUnicosMen1 = resMen1.map((item) => item.id);
    const idsUnicosMen2 = resMen2.map((item) => item.id);

    console.log("Primer reenvio:");
    for (const idUnicosMen1 of idsUnicosMen1) {
      const limiteInferior = 10000;
      const limiteSuperior = 25000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resMen1.find((item) => item.id === idUnicosMen1);
      const id = packItem.id;
      const intentos = packItem.Intentos;
      const ven = packItem.VENTANILLA;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      const int = intentos + 1;
      Reenvio(telefono, id, int, estadoEnvio, ven);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }
    console.log("Segundo reenvio:");

    for (const idUnicosMen2 of idsUnicosMen2) {
      const packItem = resMen2.find((item) => item.id === idUnicosMen2);
      let id = packItem.id;
      let int = packItem.Intentos;
      let estado = packItem.estado;
      let desc = packItem.observacion;
      let descripcion = desc + " Paquete Entregado";
      let mensajes = packItem.mensajes;
      let estadoEnvio = packItem.ESTADO;
      actualizarMensajes(estado, mensajes, descripcion, int, estadoEnvio, id);
    }
    console.log("terminado");
  } catch (err) {
    console.error("Error en la comprobación:", err);
  }
}
