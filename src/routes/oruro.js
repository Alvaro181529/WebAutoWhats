
const { Router } = require("express");
const { oruroController, NotesoruroController, NotesCreateoruroController, NotesUpdateoruroController, NotesDelateoruroController } = require("../controller/oruro")
const router = Router();

// rutas
router.get("/oruro", oruroController);
router.get("/oruro/notes", NotesoruroController);
router.post("/oruro/notes", NotesCreateoruroController);
router.put("/oruro/notes/:id", NotesUpdateoruroController);
router.delete("/oruro/notes/:id", NotesDelateoruroController);

module.exports = router;
