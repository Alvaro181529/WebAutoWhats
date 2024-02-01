const { conn } = require("./db")
async function ejecutarConsulta(query) {
    try {
        // Ejecutar la consulta en la base de datos
        const [results, fields] = await conn.query(query);
        return results;
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);
        // Manejar el error y posiblemente lanzar una excepción para manejarlo en la función que llama
        throw err;
    }
}
async function guardarMensajes(estado, mensaje, descripcion, id_telefono) {
    const query = "INSERT INTO `mensajes` (`id`, `estado`, `mensajes`, `observacion`, `id_telefono`) VALUES (NULL, ?, ?, ?, ?)";
    try {
        await conn.query(query, [estado, mensaje, descripcion, id_telefono]);
        console.log('Mensaje enviado y guardado en la base de datos');
    } catch (err) {
        console.error('Error al enviar y guardar mensaje:', err);
    }
}
async function actualizarMensajes(estado, mensaje, descripcion, intentos, id) {
    const query = "UPDATE `mensajes` SET `estado` = ?, `mensajes` = ?, `observacion` = ?, `intentos` = ?, `fecha_actualizacion` = CURRENT_TIMESTAMP WHERE `id` = ?";
    try {
        await conn.query(query, [estado, mensaje, descripcion, intentos, id]); // Asegúrate de tener un valor para `id`
        console.log('Mensaje actualizado en la base de datos');
    } catch (err) {
        console.error('Error al actualizar mensaje:', err);
    }
}
module.exports = { ejecutarConsulta, guardarMensajes, actualizarMensajes }