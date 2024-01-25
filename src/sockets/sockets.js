module.exports = (io) => {
    io.on('connection', async (socket) => {
        console.log('a user connected');
        console.log(socket.id)
        // Evento personalizado para la ruta /lapaz
        socket.on("lapaz:note", (newNote) => {
            const note = { ...newNote };
        })

        // socket.emit("server:loadnotes", notes);

        // socket.on("client:newnote", (newNote) => {
        //     const note = { ...newNote, id: uuid() };
        //     notes.push(note);
        //     io.emit("server:newnote", note);
        // });

        // socket.on("client:deletenote", (noteId) => {
        //     console.log(noteId);
        //     notes = notes.filter((note) => note.id !== noteId);
        //     io.emit("server:loadnotes", notes);
        // });

        // socket.on("client:getnote", (noteId) => {
        //     const note = notes.find((note) => note.id === noteId);
        //     socket.emit("server:selectednote", note);
        // });

        // socket.on("client:updatenote", (updatedNote) => {
        //     notes = notes.map((note) => {
        //         if (note.id === updatedNote.id) {
        //             note.title = updatedNote.title;
        //             note.description = updatedNote.description;
        //         }
        //         return note;
        //     });
        //     io.emit("server:loadnotes", notes);
        // });

        // Evento personalizado para la ruta /oruro
        socket.on('consultaOruro', () => {
        });
    });
}