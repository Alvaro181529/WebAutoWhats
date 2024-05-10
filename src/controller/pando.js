const qrcode = require("qrcode");
const cron = require("node-cron");
const CryptoJS = require("crypto-js");
const PDFDocument = require("pdfkit-table");
const moment = require("moment");
const bpass = require("../database/mensajes/bpass.json");
const {
    ClientPN,
    codigoQRPN,
    estadoConexionPN,
    enviarMensaje,
    callbackStatusPN,
    cerrarSesion,
    contactoPN,
} = require("../whatsapp/pando");
const mensajesPN = require("../database/mensajes/mensajesPN.json");
const mensajeR1 = require("../database/reenvio1/reevio1PN.json");
const mensajeR2 = require("../database/reenvio2/reevio2PN.json");
const {
    ejecutarConsulta,
    guardarMensajes,
    actualizarMensajes,
} = require("../database/ejecutar");
const container = {
    cliente: null,
};
exports.pandoController = (req, res) => {
    const codigo = codigoQRPN();
    const contacto = contactoPN();
    estado = estadoConexionPN();

    qrcode.toDataURL(codigo, (err, src) => {
        try {
            const lp = [{ estado, codigo, contacto, code: src }];
            if (estado == "conectado") {
                //si o si una hora definida
                cron.schedule("0 9 * * 1,2,3,4,5", () => {
                    // cron.schedule("* * * * *", () => {
                    comprobacion();
                });
                cron.schedule("0 12 * * 2,4", () => {
                    // cron.schedule("* * * * *", () => {
                    comprobacionReenvio();
                });
                cron.schedule("0 12 * * 1", () => {
                    // cron.schedule("* * * * *", () => {
                    if (esTerceraSemana()) {
                        comprobacionReenvio2();
                    }
                });
            } else {
                inicio();
            }
            res.json(lp);
        } catch (error) {
            console.log(err, error);
        }
    });
};
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
exports.pandoControllerMessage = async (req, res) => {
    const mensajes =
        "SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.estado, mensajes.fecha_actualizacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_actualizacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'PANDO' AND mensajes.fecha_actualizacion >= CURRENT_DATE();";
    const cons = await ejecutarConsulta(mensajes);
    res.json(cons);
};
const tableArray = {
    headers: [
        "N°",
        "Telefono",
        "Ciudad",
        "Mensajes",
        "Observacion",
        "Estado", "Intento",
        "fecha Inicio",
        "fecha Fin",
    ],
    rows: [],
};

exports.pandoControllerReportes = async (req, res) => {
    const { date } = req.body;
    const pdf = `SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion,mensajes.Intentos, mensajes.estado,mensajes.fecha_creacion,mensajes.fecha_actualizacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_creacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'PANDO' AND mensajes.fecha_creacion >= '${date}';`;
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
exports.pandoControllerAuth = (req, res) => {
    const { pass } = req.body;
    const admin = bpass[9].pass;
    const pando = bpass[4].pass; // pass pando
    const passwordAdm = CryptoJS.MD5(admin).toString();
    const password = CryptoJS.MD5(pando).toString();
    const auth = CryptoJS.MD5(pass).toString();
    if (auth === password) {
        res.send("pass");
    } else if (auth === passwordAdm) {
        res.send("adm");
    } else {
        res.send("incorrecto");
    }
};
exports.NotespandoController = (req, res) => {
    res.json(mensajesPN);
};
exports.NotesCreatepandoController = (req, res) => {
    const { mensaje } = req.body;
    mensajesPN.push({
        id: mensajesPN.length + 1,
        mensaje,
    });
    res.json("Creado Exitosamente ");
};
exports.NotesUpdatepandoController = (req, res) => {
    console.log(req.body, req.params);
    const { id } = req.params;
    const { mensaje } = req.body;

    mensajesPN.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesL.mensaje = mensaje;
        }
    });
    res.json("Actualizado Exitosamente");
};
exports.NotesDelatepandoController = (req, res) => {
    const { id } = req.params;

    mensajesPN.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesPN.splice(i, 1);
        }
    });
    res.json("Eliminado Exitosamente");
};
exports.logout = async (req, res) => {
    const cliente = container.cliente;
    res.json("deslogeado");
    cerrarSesion(cliente);
};
async function inicio() {
    const cliente = await ClientPN();
    container.cliente = cliente; // Almacena el cliente en el contenedor
    return container.cliente;
}
async function envio(contacto, id, estadoEnvio, ven, codigo) {
  const ciudad = "PN"
  const cliente = container.cliente;
  const randomIndex = Math.floor(Math.random() * mensajesPN.length);
  let status = callbackStatusPN();
  const numero = "591" + contacto + "@c.us";
  const men = mensajesPN[randomIndex].mensaje;
    const mensaje = men + "con origen de " + codCadena + "puedo recogerlo en Ventanilla " + ven + ".";
    let estado;
    let descripcion;
    let enviados = 0;
    let rechazados = 0;
    let numeroEstado;
    
    
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
            }      numeroEstado = 1

            descripcion = "El número es correcto.";
            enviados++;
           const resultado = await enviarMensaje(cliente, numero, mensaje);
      if (resultado == null ){
        console.log('No se envio el mensaje fallo'); 
        return
      }
      console.log(' Se envio el mensaje y no hubo fallo'); 
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
    guardarMensajes(estado, mensaje, descripcion, numeroEstado, id,ciudad, estadoEnvio);
}

async function comprobacion() {
    let i = 0;
    let j = 0;
    
    // SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';
    const packQuery =
    "SELECT * FROM packages WHERE VENTANILLA = 'UNICA' AND TELEFONO IS NOT NULL AND TELEFONO <> 0 AND CUIDAD = 'PANDO' AND ESTADO = 'VENTANILLA' AND id NOT IN (SELECT id_Telefono FROM mensajes WHERE id_Telefono IS NOT NULL) AND created_at <= DATE_SUB(NOW(), INTERVAL 2 DAY) ORDER BY `packages`.`created_at` ASC LIMIT 100;"
    // const packQuerySn =
    //   "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';";
    
    try {
        const resPack = await ejecutarConsulta(packQuery);
        
        console.log("IDs Únicos en packQuery:");
        
        const idsUnicosPack = resPack.map((item) => item.id);
        
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
            const telefono = packItem.TELEFONO;
            const codigo = packItem.CODIGO;

            const estadoEnvio = packItem.ESTADO;
            envio(telefono, id, estadoEnvio, ven);
            await new Promise((resolve) => setTimeout(resolve, numeroAleatorio, codigo)); //12
        }

        console.log("terminado");
    } catch (err) {
        console.error("Error en la comprobación:", err);
    }
}
async function Reenvio(contacto, id, int, estadoEnvio, ven, numeroEstado, codigo) {
    const ciudad = "PN"
    const cliente = container.cliente;
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
    let status = callbackStatusPN();
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
            descripcion = "El número es correcto. y el mensaje fue reenviado";
            enviados++;
           const resultado = await enviarMensaje(cliente, numero, mensaje);
      if (resultado == null ){
        console.log('No se envio el mensaje fallo'); 
        return
      }
      console.log(' Se envio el mensaje y no hubo fallo'); 
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
    actualizarMensajes(estado, mensaje, descripcion, int, estadoEnvio, id, numeroEstado,ciudad);
}
async function comprobacionReenvio() {
    let i = 0;
    let j = 0;
    /* seleccina las mensajes mas antiguos y los envio */
    const menQuery1 =
        "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA, packages.CODIGO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND mensajes.intentos =0 AND packages.ESTADO = 'VENTANILLA' AND CUIDAD='PANDO' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 200;";

    /* revisara si los paquetes ya fueron entregados */
    const menQuery2 =
        "SELECT mensajes.*, packages.ESTADO, packages.TELEFONO,packages.VENTANILLA FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.intentos >= 0 AND packages.ESTADO = 'ENTREGADO' AND mensajes.entrega = 'ventanilla' AND CUIDAD = 'PANDO' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 300;";
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
            const codigo = packItem.CODIGO;
            const ven = packItem.VENTANILLA;
            const telefono = packItem.TELEFONO;
            const estadoEnvio = packItem.ESTADO;
            const int = intentos + 1;
            console.log(estadoEnvio);
            Reenvio(telefono, id, int, estadoEnvio, ven, numeroEstado, codigo);
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
            console.log(estado, mensajes, descripcion, int, estadoEnvio, id);
            actualizarMensajes(estado, mensajes, descripcion, int, estadoEnvio, id);
        }
        console.log("terminado");
    } catch (err) {
        console.error("Error en la comprobación:", err);
    }
}
async function comprobacionReenvio2() {
    let i = 0;
    let j = 0;
    /* seleccina las mensajes mas antiguos y los envio */
    const menQuery1 =
        "SELECT mensajes.*, packages.TELEFONO ,packages.ESTADO ,packages.VENTANILLA, packages.CODIGO FROM mensajes JOIN packages ON mensajes.id_Telefono = packages.id WHERE mensajes.numeroEstado = 1 AND mensajes.intentos =1 AND packages.ESTADO = 'VENTANILLA' AND CUIDAD='PANDO' ORDER BY mensajes.fecha_actualizacion ASC LIMIT 200;";

    /* revisara si los paquetes ya fueron entregados */
    try {
        const resMen1 = await ejecutarConsulta(menQuery1);

        const idsUnicosMen1 = resMen1.map((item) => item.id);

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
            const codigo = packItem.CODIGO;
            const ven = packItem.VENTANILLA;
            const telefono = packItem.TELEFONO;
            const estadoEnvio = packItem.ESTADO;
            const int = intentos + 1;
            console.log(estadoEnvio);
            Reenvio(telefono, id, int, estadoEnvio, ven, numeroEstado, codigo);
            await new Promise((resolve) => setTimeout(resolve, numeroAleatorio)); //12
        }

        console.log("terminado");
    } catch (err) {
        console.error("Error en la comprobación:", err);
    }
}
