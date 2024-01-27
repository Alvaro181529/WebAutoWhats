const qrcode = require("qrcode");
const cron = require("node-cron");
const CryptoJS = require("crypto-js")
const bpass = require("../database/mensajes/bpass.json");
const {
    ClientPT,
    codigoQRPT,
    estadoConexionPT,
    enviarMensaje,
    callbackStatusPT,
    cerrarSesion,
    contactoPT,
} = require("../whatsapp/potosi");
let estado = "";
const mensajesPT = require("../database/mensajes/mensajesPT.json");
const { ejecutarConsulta, guardarMensajes } = require("../database/ejecutar");
const container = {
    cliente: null,
};
exports.potosiControllerAuth = (req, res) => {
    const { pass } = req.body;
    const admin = bpass[9].pass;
    const potosi = bpass[5].pass; // pass potosi
    const passwordAdm = CryptoJS.MD5(admin).toString();
    const password = CryptoJS.MD5(potosi).toString();
    const auth = CryptoJS.MD5(pass).toString();
    if (auth === password) {
        res.send("pass");
    } else if (auth === passwordAdm) {
        res.send("adm");
    } else {
        res.send("incorrecto");
    }
}
exports.potosiController = (req, res) => {
    const codigo = codigoQRPT();
    const contacto = contactoPT();
    estado = estadoConexionPT();
    qrcode.toDataURL(codigo, (err, src) => {
        try {
            const lp = [{ estado, codigo, contacto, code: src }];
            if (estado == "conectado") {
                cron.schedule('*/1 * * * *', () => {
                    comprobacion();
                })
            } else {
                inicio();
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
exports.NotespotosiController = (req, res) => {
    res.json(mensajesPT)
}
exports.NotesCreatepotosiController = (req, res) => {
    const { mensaje } = req.body;
    mensajesPT.push({
        id: mensajesPT.length + 1,
        mensaje
    });
    res.json('Successfully created');
}
exports.NotesUpdatepotosiController = (req, res) => {
    console.log(req.body, req.params)
    const { id } = req.params;
    const { mensaje } = req.body;

    mensajesPT.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesL.mensaje = mensaje;
        }
    });
    res.json('Successfully updated');
}
exports.NotesDelatepotosiController = (req, res) => {
    const { id } = req.params;

    mensajesPT.forEach((mensajesL, i) => {
        if (mensajesL.id == id) {
            mensajesPT.splice(i, 1);
        }
    });
    res.json('Successfully deleted');
}

async function inicio() {
    const cliente = await ClientPT();
    container.cliente = cliente; // Almacena el cliente en el contenedor
    return cliente;
}
function envio(contacto, id) {
    const cliente = container.cliente;
    const randomIndex = Math.floor(Math.random() * mensajesPT.length);
    let status = callbackStatusPT();
    const numero = "591" + contacto + "@c.us";
    const mensaje = mensajesPT[randomIndex].mensaje;
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
    const packQuery = "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO <> 0 AND CUIDAD = 'POTOSI' AND ESTADO = 'VENTANILLA';";
    const packQuerySn = "SELECT * FROM packages WHERE ZONA <> '' AND TELEFONO IS NOT NULL AND TELEFONO = 0 AND CUIDAD = 'POTOSI' AND ESTADO = 'VENTANILLA';";

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

