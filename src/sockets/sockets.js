module.exports = (io) => {
    io.on('connection', async (socket) => {
        console.log('a user connected');
        console.log(socket.id)
        // Evento personalizado para la ruta /lapaz

    });
}