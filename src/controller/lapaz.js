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
const mensajeR1 = require("../database/reenvio1/reevio1LP.json");
const mensajeR2 = require("../database/reenvio2/reevio2LP.json");
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
      if (estado == "conectado") {
        cron.schedule("15 15 * * 1-6", () => {
          comprobacion();
        });
        cron.schedule("0 10 * * 3,6", () => {
          comprobacionReenvio();
        });
        cron.schedule("0 10 * * 1", () => {
          if (esTerceraSemana()) {
            comprobacionReenvio2();
          }
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
//Calculo del envio en la ultima semana
function esTerceraSemana() {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const diaInicioSemana = 1; // Lunes

  // Calcula el día de la semana del primer día del mes
  let primerDiaMesDiaSemana = primerDiaMes.getDay();
  if (primerDiaMesDiaSemana === 0) {
    primerDiaMesDiaSemana = 7; // Si es domingo, se ajusta a 7 en lugar de 0
  }

  // Calcula el número de días hasta el inicio de la tercera semana
  let diasHastaTerceraSemana = (diaInicioSemana - primerDiaMesDiaSemana + 7) % 7 + 14;

  // Calcula la fecha del primer lunes de la tercera semana
  const primerLunesTerceraSemana = new Date(hoy.getFullYear(), hoy.getMonth(), diasHastaTerceraSemana);

  // Compara la fecha actual con la fecha del primer lunes de la tercera semana
  return hoy.getTime() === primerLunesTerceraSemana.getTime();
}
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
      return '2do reenvio';
    case 2:
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

  doc.table(tableArray, { columnsSize: [15, 50, 45, 90, 60, 35, 65, 55, 55] });
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
function envio(contacto, id, estadoEnvio, ven, codigo) {
  let cadena = codigo;
  let codCadena = cadena.substring(cadena.length - 2);
  const cliente = container.cliente;
  const randomIndex = Math.floor(Math.random() * mensajesLP.length);
  const men = mensajesLP[randomIndex].mensaje;
  let status = callbackStatusLPZ();
  const numero = "591" + contacto + "@c.us";
  const mensaje = men + "con procedencia de " + codCadena + " puede recogerlo en Ventanilla " + ven + ".";
  let estado;
  let descripcion;
  let numeroEstado;
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
      numeroEstado = 1
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
  guardarMensajes(estado, mensaje, descripcion, numeroEstado, id, estadoEnvio);
}

async function comprobacion() {
  let i = 0;
  let j = 0;
  /* YO PREGUNTO DONDE LA ZONA ESTE VACIA Y EL TELEFONO SEA 0 O NULO Y QUE ESTE CON EL ESTADO DE VENTANILLA */
  // SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';
  const packQuery =
    "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO <> 0 AND VENTANILLA = 'ENCOMIENDAS' AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA' AND id NOT IN (SELECT id_Telefono FROM mensajes WHERE id_Telefono IS NOT NULL) ORDER BY `packages`.`created_at` DESC LIMIT 300;";
  const packQuery1 =
    "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO <> 0  AND VENTANILLA = 'DD' OR VENTANILLA = 'DND' AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA' AND id NOT IN (SELECT id_Telefono FROM mensajes WHERE id_Telefono IS NOT NULL)  ORDER BY `packages`.`created_at` DESC LIMIT 200;";

  try {
    const resPack = await ejecutarConsulta(packQuery);
    const resPack1 = await ejecutarConsulta(packQuery1);
    //DESPACHO

    console.log("Envio mensajes:");

    const idsUnicosPack = resPack.map((item) => item.id);
    const idsUnicosPack1 = resPack1.map((item) => item.id);

    for (const idUnicoPack of idsUnicosPack) {
      i++;
      const limiteInferior = 60000;
      const limiteSuperior = 125000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resPack.find((item) => item.id === idUnicoPack);
      const id = packItem.id;
      const ven = packItem.VENTANILLA;
      const codigo = packItem.CODIGO;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio, codigo)); //12
      envio(telefono, id, estadoEnvio, ven, codigo);
    }
    for (const idUnicoPack1 of idsUnicosPack1) {
      i++;
      const limiteInferior = 60000;
      const limiteSuperior = 125000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resPack1.find((item) => item.id === idUnicoPack1);
      const id = packItem.id;
      const ven = packItem.VENTANILLA;
      const codigo = packItem.CODIGO;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio, codigo)); //12
      envio(telefono, id, estadoEnvio, ven, codigo);
    }
    console.log("terminado");
  } catch (err) {
    console.error("Error en la comprobación:", err);
  }
}
function Reenvio(contacto, id, int, estadoEnvio, ven, numeroEstado, codigo) {
  const cliente = container.cliente;
  let status = callbackStatusLPZ();
  let cadena = codigo;
  let codCadena = cadena.substring(cadena.length - 2);
  let men;
  if (int == 1) {
    const randomIndex = Math.floor(Math.random() * mensajeR1.length);
    men = mensajeR1[randomIndex].mensaje;
  } else {
    const randomIndex = Math.floor(Math.random() * mensajeR2.length);
    men = mensajeR2[randomIndex].mensaje;
  }
  const mensaje = men + "con procedencia de " + codCadena + "puede recogerlo en Ventanilla " + ven + ".";
  const numero = "591" + contacto + "@c.us";
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
      descripcion = "El mensaje fue reenviado";
      enviados++;
      enviarMensaje(cliente, numero, mensaje);
    } else {
      estado = "No enviado";
      descripcion = "El mensaje no fue reenviado";
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
  actualizarMensajes(estado, mensaje, descripcion, int, estadoEnvio, id, numeroEstado);
}
async function comprobacionReenvio() {
  /* seleccina las mensajes mas antiguos y los envio */
  const menQuery1 =
    "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA, packages.CODIGO, packages.CODIGO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND mensajes.intentos =0  AND VENTANILLA = 'ENCOMIENDAS' AND  packages.ESTADO = 'VENTANILLA' AND CUIDAD='LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 300;";

  /* revisara si los paquetes ya fueron entregados */
  const menQuery2 =
    "SELECT mensajes.*, packages.ESTADO, packages.TELEFONO ,packages.VENTANILLA FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND  mensajes.intentos >= 0 AND packages.ESTADO = 'ENTREGADO' AND mensajes.entrega = 'ventanilla' AND CUIDAD = 'LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 300;";
  const menQuery3 =
    "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA, packages.CODIGO, packages.CODIGO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND mensajes.intentos =0 AND VENTANILLA = 'DD' AND packages.ESTADO = 'VENTANILLA' AND CUIDAD='LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 300;";

  try {
    const resMen1 = await ejecutarConsulta(menQuery1);
    const resMen2 = await ejecutarConsulta(menQuery2);
    const resMen3 = await ejecutarConsulta(menQuery3);

    const idsUnicosMen1 = resMen1.map((item) => item.id);
    const idsUnicosMen2 = resMen2.map((item) => item.id);
    const idsUnicosMen3 = resMen3.map((item) => item.id);

    console.log("Primer reenvio:");
    for (const idUnicosMen1 of idsUnicosMen1) {
      const limiteInferior = 60000;
      const limiteSuperior = 125000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resMen1.find((item) => item.id === idUnicosMen1);
      const id = packItem.id;
      const intentos = packItem.Intentos;
      const numeroEstado = packItem.numeroEstado;
      const ven = packItem.VENTANILLA;
      const codigo = packItem.CODIGO;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      const int = intentos + 1;
      Reenvio(telefono, id, int, estadoEnvio, ven, numeroEstado, codigo);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }

    for (const idUnicosMen3 of idsUnicosMen3) {
      const limiteInferior = 60000;
      const limiteSuperior = 125000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resMen3.find((item) => item.id === idUnicosMen3);
      const id = packItem.id;
      const intentos = packItem.Intentos;
      const numeroEstado = packItem.numeroEstado;
      const ven = packItem.VENTANILLA;
      const codigo = packItem.CODIGO;
      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      const int = intentos + 1;
      Reenvio(telefono, id, int, estadoEnvio, ven, numeroEstado, codigo);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }
    console.log("Segundo reenvio:");

    for (const idUnicosMen2 of idsUnicosMen2) {
      const packItem = resMen2.find((item) => item.id === idUnicosMen2);
      let id = packItem.id;
      const numeroEstado = packItem.numeroEstado;
      let int = packItem.Intentos;
      let estado = packItem.estado;
      let desc = packItem.observacion;
      let descripcion = desc + " Paquete Entregado";
      let mensajes = packItem.mensajes;
      let estadoEnvio = packItem.ESTADO;
      actualizarMensajes(estado, mensajes, descripcion, int, estadoEnvio, id, numeroEstado);
    }
    console.log("terminado");
  } catch (err) {
    console.error("Error en la comprobación:", err);
  }
}
async function comprobacionReenvio2() {
  /* seleccina las mensajes mas antiguos y los envio */
  const menQuery1 =
    "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA, packages.CODIGO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND mensajes.intentos =1  AND packages.ESTADO = 'VENTANILLA'  AND VENTANILLA = 'ENCOMIENDAS' AND  CUIDAD='LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 300;";
  const menQuery2 =
    "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA, packages.CODIGO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND mensajes.intentos =1  AND packages.ESTADO = 'VENTANILLA'  AND VENTANILLA = 'DD' AND  CUIDAD='LA PAZ' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 200;";

  /* revisara si los paquetes ya fueron entregados */

  try {
    const resMen1 = await ejecutarConsulta(menQuery1);
    const resMen2 = await ejecutarConsulta(menQuery2);

    const idsUnicosMen1 = resMen1.map((item) => item.id);
    const idsUnicosMen2 = resMen2.map((item) => item.id);

    console.log("Primer reenvio:");
    for (const idUnicosMen1 of idsUnicosMen1) {
      const limiteInferior = 60000;
      const limiteSuperior = 125000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resMen1.find((item) => item.id === idUnicosMen1);
      const id = packItem.id;
      const intentos = packItem.Intentos;
      const numeroEstado = packItem.numeroEstado;
      const ven = packItem.VENTANILLA;
      const codigo = packItem.CODIGO;

      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      const int = intentos + 1;
      Reenvio(telefono, id, int, estadoEnvio, ven, numeroEstado, codigo);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }
    for (const idUnicosMen2 of idsUnicosMen2) {
      const limiteInferior = 60000;
      const limiteSuperior = 125000;
      const numeroAleatorio =
        Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) +
        limiteInferior;
      const packItem = resMen2.find((item) => item.id === idUnicosMen2);
      const id = packItem.id;
      const intentos = packItem.Intentos;
      const numeroEstado = packItem.numeroEstado;
      const ven = packItem.VENTANILLA;
      const codigo = packItem.CODIGO;

      const telefono = packItem.TELEFONO;
      const estadoEnvio = packItem.ESTADO;
      const int = intentos + 1;
      Reenvio(telefono, id, int, estadoEnvio, ven, numeroEstado, codigo);
      await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
    }

    console.log("terminado");
  } catch (err) {
    console.error("Error en la comprobación:", err);
  }
}
