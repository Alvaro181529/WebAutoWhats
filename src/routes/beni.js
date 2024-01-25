
const { Router } = require("express");
const { beniController, log, NotesbeniController, NotesCreatebeniController, NotesUpdatebeniController, NotesDelatebeniController,logout } = require("../controller/beni")
const router = Router();

// rutas
router.get("/beni", beniController);
router.get("/admin",log );
router.get("/beni/logout", logout);
router.get("/beni/notes", NotesbeniController);
router.post("/beni/notes", NotesCreatebeniController);
router.put("/beni/notes/:id", NotesUpdatebeniController);
router.delete("/beni/notes/:id", NotesDelatebeniController);

module.exports = router;
