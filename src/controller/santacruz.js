const qrcode = require("qrcode");
const cron = require("node-cron");
const CryptoJS = require("crypto-js");
const PDFDocument = require("pdfkit-table");
const moment = require('moment');
const bpass = require("../database/mensajes/bpass.json");
const {
    ClientSC,
    codigoQRSC,
    estadoConexionSC,
    enviarMensaje,
    callbackStatusSC,
    cerrarSesion,
    contactoSC,
} = require("../whatsapp/santacruz");
let estado = "";
const mensajesSC = require("../database/mensajes/mensajesSC.json");
const { ejecutarConsulta, guardarMensajes } = require("../database/ejecutar");
const container = {
    cliente: null,
};
const tableArray = {
    headers: ["N°", "Telefono", "Ciudad", "Mensajes", "Observacion", "Estado", "fecha"],
    rows: [],
};

exports.santacruzControllerReportes = async (req, res) => {
    const { date } = req.body
    const pdf = `SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.estado,mensajes.fecha_creacion, ROW_NUMBER() OVER (ORDER BY mensajes.fecha_creacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'SANTA CRUZ' AND mensajes.fecha_creacion >= '${date}';`
    const cons = await ejecutarConsulta(pdf)
    cons.forEach((row) => {
        const formattedDate = moment(row.fecha_creacion).format("DD-MM-YYYY HH:mm:ss");
        tableArray.rows.push([
            row.numero,
            row.TELEFONO,
            row.CUIDAD,
            row.mensajes,
            row.observacion,
            row.estado,
            formattedDate,
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

    doc.table(tableArray, { columnsSize: [20, 60, 50, 120, 100, 50, 70] });
    doc.end();
}

exports.santacruzControllerMessage = async(req, res) => {
    const mensajes = "SELECT packages.TELEFONO, packages.CUIDAD, mensajes.mensajes, mensajes.observacion, mensajes.estado,  mensajes.fecha_creacion,ROW_NUMBER() OVER (ORDER BY mensajes.fecha_creacion) AS numero FROM mensajes INNER JOIN packages ON mensajes.id_telefono = packages.id AND packages.CUIDAD = 'SANTA CRUZ' AND mensajes.fecha_creacion >= CURRENT_DATE();"
       const cons = await ejecutarConsulta(mensajes)
    res.json(cons)
}
exports.santacruzControllerAuth = (req, res) => {
    const { pass } = req.body;
    const admin = bpass[9].pass;
    const santacruz = bpass[6].pass; // pass potosi
    const passwordAdm = CryptoJS.MD5(admin).toString();
    const password = CryptoJS.MD5(santacruz).toString();
    const auth = CryptoJS.MD5(pass).toString();
    if (auth === password) {
        res.send("pass");
    } else if (auth === passwordAdm) {
        res.send("adm");
    } else {
        res.send("incorrecto");
    }
}
exports.santacruzController = (req, res) => {
    const codigo = codigoQRSC();
    const contacto = contactoSC();
    estado = estadoConexionSC();
    qrcode.toDataURL(codigo, (err, src) => {
        try {
            const lp = [{ estado, codigo, contacto, code: src }];
            if (estado == "conectado") {
                cron.schedule('*/1 * * * *', () => {
                    comprobacion();
                })
            } else {
                inicio();s
            }
            res.json(lp);
        } catch (error) {
            console.log(err, error);
        }
    });
}
exports.logout = async (req, res) => {
    const cliente = container.cliente;
    res.json("deslogeado");
    cerrarSesion(cliente);
};
exports.NotessantacruzController = (req, res) => {
    res.json(mensajesSC)
}
exports.NotesCreatesantacruzController = (req, res) => {
    const { mensaje } = req.body;
    mensajesSC.push({
        id: mensajesSC.length + 1,
        mensaje
    });
    res.json('Creado Exitosamente');
}
exports.NotesUpdatesantacruzController = (req, res) => {
    console.log(req.body, req.params)
    const { id } = req.params;
    const { mensaje } = req.body;

    mensajesSC.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesL.mensaje = mensaje;
        }
    });
    res.json('Actualizado Exitosamente');
}
exports.NotesDelatesantacruzController = (req, res) => {
    const { id } = req.params;

    mensajesSC.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesSC.splice(i, 1);
        }
    });
    res.json('Eliminado Exitosamente');
}

async function inicio() {
    const cliente = await ClientSC();
    container.cliente = cliente; // Almacena el cliente en el contenedor
    return cliente;
}
function envio(contacto, id) {
    const cliente = container.cliente;
    const randomIndex = Math.floor(Math.random() * mensajesSC.length);
    let status = callbackStatusSC();
    const numero = "591" + contacto + "@c.us";
    const mensaje = mensajesSC[randomIndex].mensaje;
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
    console.log(`ID: ${id}, NUMERO: ${numero}, MENSAJE: ${mensaje}, ESTADO ${estado}, DESCRIPCION ${descripcion}`)
    guardarMensajes(estado, mensaje, descripcion, id);
}

async function comprobacion() {
    let i = 0
    let j = 0

    // SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'LA PAZ' AND ESTADO = 'VENTANILLA';
    const menQuery = "SELECT * FROM mensajes";
    const packQuery = "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO <> 0 AND CUIDAD = 'SANTA CRUZ' AND ESTADO = 'VENTANILLA';";
    const packQuerySn = "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'SANTA CRUZ' AND ESTADO = 'VENTANILLA';";

    try {
        const resMen = await ejecutarConsulta(menQuery);
        const resPack = await ejecutarConsulta(packQuery);
        const resPackSn = await ejecutarConsulta(packQuerySn);

        // Obtener los IDs de cada consulta
        const idsMen = new Set(resMen.map(item => item.id_telefono));
        const idsPack = new Set(resPack.map(item => item.id));
        const idsPackSn = new Set(resPackSn.map(item => item.id));

        // Encontrar IDs comunes
        const idsComunes = [...new Set([...idsMen].filter(id => idsPack.has(id)))];
        const idsComunesSn = [...new Set([...idsMen].filter(id => idsPackSn.has(id)))];

        // Encontrar IDs únicos en cada conjunto
        const idsUnicosPack = [...new Set([...idsPack].filter(id => !idsComunes.includes(id)))];
        const idsUnicosPackSn = [...new Set([...idsPackSn].filter(id => !idsComunesSn.includes(id)))];

        console.log("IDs Comunes:", idsComunes);
        console.log("IDs Comunes Sn:", idsComunesSn);
        console.log("IDs Únicos en packQuery:", idsUnicosPack);
        console.log("IDs Únicos en packQuerySn:", idsUnicosPackSn);
        // Mostrar el TELEFONO correspondiente a los IDs únicos en packQuery
        console.log("IDs Únicos en packQuery:");
        for (const idUnicoPack of idsUnicosPack) {
            i++;
            const limiteInferior = 5000;
            const limiteSuperior = 10000;
            const numeroAleatorio = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;
            const telefono = resPack.find(item => item.id === idUnicoPack)?.TELEFONO;
            const idTelefono = resPack.find(item => item.id === idUnicoPack)?.id;
            envio(telefono, idTelefono);
            await new Promise((resolve) => setTimeout(resolve, numeroAleatorio));//12
        }

        // Mostrar el TELEFONO correspondiente a los IDs únicos en packQuerySn
        console.log("IDs Únicos en packQuerySn:");
        for (const idUnicoPackSn of idsUnicosPackSn) {
            j++;
            const limiteInferior = 5000;
            const limiteSuperior = 10000;
            const numeroAleatorio = Math.floor(Math.random() * (limiteSuperior - limiteInferior + 1)) + limiteInferior;
            const telefono = resPackSn.find(item => item.id === idUnicoPackSn)?.TELEFONO;
            const idTelefono = resPackSn.find(item => item.id === idUnicoPackSn)?.id;
            envio(telefono, idTelefono);
            await new Promise((resolve) => setTimeout(resolve, numeroAleatorio));//12
        }
        if (idsUnicosPackSn.length === j && idsUnicosPack.length === i) {
            console.log("Terminado")
        }

    } catch (err) {
        console.error('Error en la comprobación:', err);
    }
}

