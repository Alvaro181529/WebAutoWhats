
const { Router } = require("express");
const { oruroController, NotesoruroController, NotesCreateoruroController, NotesUpdateoruroController, NotesDelateoruroController, logout, oruroControllerAuth } = require("../controller/oruro")
const router = Router();

// rutas
router.get("/oruro", oruroController);
router.post("/oruro/auth", oruroControllerAuth);
router.get("/oruro/logout", logout);
router.get("/oruro/notes", NotesoruroController);
router.post("/oruro/notes", NotesCreateoruroController);
router.put("/oruro/notes/:id", NotesUpdateoruroController);
router.delete("/oruro/notes/:id", NotesDelateoruroController);

module.exports = router;
