const qrcode = require("qrcode");
const cron = require("node-cron");
const CryptoJS = require("crypto-js");
const PDFDocument = require("pdfkit-table");
const moment = require('moment');
const bpass = require("../database/mensajes/bpass.json");
const {
    ClientBN,
    codigoQRBN,
    estadoConexionBN,
    enviarMensaje,
    callbackStatusBN,
    cerrarSesion,
    contactoBN,
} = require("../whatsapp/beni");
const mensajesBN = require("../database/mensajes/mensajesBN.json");
const { ejecutarConsulta, guardarMensajes, actualizarMensajes } = require("../database/ejecutar");
const container = {
    cliente: null,
};
exports.beniController = (req, res) => {
    const codigo = codigoQRBN();
    const contacto = contactoBN();
    estado = estadoConexionBN();

    qrcode.toDataURL(codigo, (err, src) => {
        try {
            const lp = [{ estado, codigo, contacto, code: src }];
            if (estado == "conectado") {
                //si o si una hora definida
                //              s   m h 
                cron.schedule("30 16 * * 1,3,5", () => {
                    comprobacion();
                  });
                  cron.schedule("30 16 * * 2,4", () => {
                    comprobacionReenvio();
                  });
            } else {
                inicio();
            }
            res.json(lp);
        } catch (error) {
            console.log(err, error);
        }
    });
}
exports.beniControllerMessage = async (req, res) => {
    const mensajes = "SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.estado, mensajes.fecha_actualizacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_actualizacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'BENI' AND mensajes.fecha_actualizacion >= CURRENT_DATE();"
    const cons = await ejecutarConsulta(mensajes)
    res.json(cons)
}
const tableArray = {
    headers: ["N°", "Telefono", "Ciudad", "Mensajes", "Observacion", "Estado", "fecha Inicio", "fecha Fin"],
    rows: [],
};

exports.beniControllerReportes = async (req, res) => {
    const { date } = req.body
    const pdf = `SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.estado,mensajes.fecha_creacion,mensajes.fecha_actualizacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_creacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'BENI' AND mensajes.fecha_creacion >= '${date}';`
    const cons = await ejecutarConsulta(pdf)
    cons.forEach((row) => {
        const formattedDate = moment(row.fecha_creacion).format("DD-MM-YYYY HH:mm:ss");
        const formattedDateEnd = moment(row.fecha_actualizacion).format("DD-MM-YYYY HH:mm:ss");
        tableArray.rows.push([
            row.numero,
            row.TELEFONO,
            row.CUIDAD,
            row.mensajes,
            row.observacion,
            row.estado,
            formattedDate,
            formattedDateEnd
        ]);
    });

    res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${date}-reporte.pdf`,
    });

    buildPDF(
        (data) => res.write(data),  // Utiliza res.write para enviar datos al cliente
        () => { res.end(), tableArray.rows = []; } // Llamado cuando el documento está completo
    );
};

function buildPDF(dataCallback, endCallback) {
    const doc = new PDFDocument();

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    doc.fontSize(20).text("Reporte de envio");

    doc.table(tableArray, { columnsSize: [20, 60, 50, 120, 70, 45,55, 55] });
    doc.end();
}

exports.beniControllerAuth = (req, res) => {
    const { pass } = req.body;
    const admin = bpass[9].pass;
    const beni = bpass[0].pass; // pass beni
    const passwordAdm = CryptoJS.MD5(admin).toString();
    const password = CryptoJS.MD5(beni).toString();
    const auth = CryptoJS.MD5(pass).toString();
    if (auth === password) {
        res.send("pass");
    } else if (auth === passwordAdm) {
        res.send("adm");
    } else {
        res.send("incorrecto");
    }
};
exports.NotesbeniController = (req, res) => {
    res.json(mensajesBN)
}
exports.NotesCreatebeniController = (req, res) => {
    const { mensaje } = req.body;
    mensajesBN.push({
        id: mensajesBN.length + 1,
        mensaje
    });
    res.json('Creado Exitosamente ');
}
exports.NotesUpdatebeniController = (req, res) => {
    console.log(req.body, req.params)
    const { id } = req.params;
    const { mensaje } = req.body;

    mensajesBN.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesL.mensaje = mensaje;
        }
    });
    res.json('Actualizado Exitosamente');
}
exports.NotesDelatebeniController = (req, res) => {
    const { id } = req.params;

    mensajesBN.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesBN.splice(i, 1);
        }
    });
    res.json('Eliminado Exitosamente');
}
exports.logout = async (req, res) => {
    const cliente = container.cliente;
    res.json("deslogeado");
    cerrarSesion(cliente);
};
async function inicio() {
    const cliente = await ClientBN();
    container.cliente = cliente; // Almacena el cliente en el contenedor
    return container.cliente;
}
function envio(contacto, id) {
    const cliente = container.cliente;
    const randomIndex = Math.floor(Math.random() * mensajesBN.length);
    let status = callbackStatusBN();
    const numero = "591" + contacto + "@c.us";
    const mensaje = mensajesBN[randomIndex].mensaje;
    let estado;
    let descripcion;
    let enviados = 0;
    let rechazados = 0;

    if (typeof contacto === "number") {
        const numeroComoCadena = contacto.toString();
        const primerNumero = numeroComoCadena[0];
        const cantidadDigitos = numeroComoCadena.length;

        if (cantidadDigitos === 8 && (primerNumero === '7' || primerNumero === '8' || primerNumero === '6')) {
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
            estado = "No enviado"
            descripcion = "El número es incorrecto.";
            rechazados++;
        }
    } else {
        estado = "No enviado"
        descripcion = "No es un número.";
        rechazados++;
    }
    guardarMensajes(estado, mensaje, descripcion, id);

    // const respuesta =
    // console.log(`ID: ${id}, NUMERO: ${numero}, MENSAJE: ${mensaje}, ESTADO ${estado}, DESCRIPCION ${descripcion}`)
    // return respuesta
}

async function comprobacion() {
    let i = 0
    let j = 0
  
    // SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';
    const packQuery = "SELECT * FROM packages WHERE VENTANILLA ='UNICA' AND TELEFONO IS NOT NULL AND TELEFONO <> 0 AND CUIDAD = 'BENI' AND ESTADO = 'VENTANILLA' AND id NOT IN (SELECT id_Telefono FROM mensajes WHERE id_Telefono IS NOT NULL) LIMIT 100;";
    // const packQuerySn =
    //   "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';";
  
    try {
      const resPack = await ejecutarConsulta(packQuery);
  
      console.log("IDs Únicos en packQuery:");
  
      const idsUnicosPack = resPack.map(item => item.id);
  
      for (const idUnicoPack of idsUnicosPack) {
        i++;
        const limiteInferior = 10000;
        const limiteSuperior = 15000;
        const numeroAleatorio = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;
        const packItem = resPack.find(item => item.id === idUnicoPack);
        const id = packItem.id;
        const telefono = packItem.TELEFONO;
        envio(telefono, id);
        await new Promise((resolve) => setTimeout(resolve, numeroAleatorio));//12
      }
  
      console.log("terminado")
  
    } catch (err) {
      console.error('Error en la comprobación:', err);
    }
  }
  function Reenvio(contacto, id, int) {
    const cliente = container.cliente;
    const randomIndex = Math.floor(Math.random() * mensajesBN.length);
    let status = callbackStatusBN();
    const numero = "591" + contacto + "@c.us";
    const mensaje = mensajesBN[randomIndex].mensaje;
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
    actualizarMensajes(estado, mensaje, descripcion, int, id);
  }
  async function comprobacionReenvio() {
    let i = 0
    let j = 0
  
    // SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';
    const menQuery1 = "SELECT mensajes.*, packages.TELEFONO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.intentos =0 AND packages.ESTADO = 'VENTANILLA' AND CUIDAD='BENI' ORDER BY mensajes.fecha_creacion ASC LIMIT 33;";
    const menQuery2 = "SELECT mensajes.*, packages.TELEFONO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.intentos =1 AND packages.ESTADO = 'VENTANILLA' AND CUIDAD='BENI' ORDER BY mensajes.fecha_creacion ASC LIMIT 33;";
    const menQuery3 = "SELECT mensajes.*, packages.TELEFONO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.intentos =2 AND packages.ESTADO = 'VENTANILLA' AND CUIDAD='BENI' ORDER BY mensajes.fecha_creacion ASC LIMIT 33;";
    // const packQuerySn =
    //   "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';";
  
    try {
      const resMen1 = await ejecutarConsulta(menQuery1);
      const resMen2 = await ejecutarConsulta(menQuery2);
      const resMen3 = await ejecutarConsulta(menQuery3);
  
  
      const idsUnicosMen1 = resMen1.map(item => item.id);
      const idsUnicosMen2 = resMen2.map(item => item.id);
      const idsUnicosMen3 = resMen3.map(item => item.id);
      console.log("Primer reenvio:");
      for (const idUnicosMen1 of idsUnicosMen1) {
        const limiteInferior = 10000;
        const limiteSuperior = 15000;
        const numeroAleatorio = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;
        const packItem = resMen1.find(item => item.id === idUnicosMen1);
        const id = packItem.id;
        const intentos = packItem.Intentos;
        const telefono = packItem.TELEFONO;
        const int = intentos + 1
        Reenvio(telefono, id, int);
        await new Promise((resolve) => setTimeout(resolve, numeroAleatorio));//12
      }
      console.log("Segundo reenvio:");
  
      for (const idUnicosMen2 of idsUnicosMen2) {
        const limiteInferior = 10000;
        const limiteSuperior = 15000;
        const numeroAleatorio = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;
        const packItem = resMen2.find(item => item.id === idUnicosMen2);
        const id = packItem.id;
        const intentos = packItem.Intentos;
        const telefono = packItem.TELEFONO;
        const int = intentos + 1
        Reenvio(telefono, id, int);
        await new Promise((resolve) => setTimeout(resolve, numeroAleatorio));//12
      }
      Reenvio("Segundo reenvio:");
  
      for (const idUnicosMen3 of idsUnicosMen3) {
        const limiteInferior = 10000;
        const limiteSuperior = 15000;
        const numeroAleatorio = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;
        const packItem = resMen3.find(item => item.id === idUnicosMen3);
        const id = packItem.id;
        const intentos = packItem.Intentos;
        const telefono = packItem.TELEFONO;
        const int = intentos + 1
        Reenvio(telefono, id, int);
        await new Promise((resolve) => setTimeout(resolve, numeroAleatorio));//12
      }
      console.log("terminado")
  
    } catch (err) {
      console.error('Error en la comprobación:', err);
    }
  }
