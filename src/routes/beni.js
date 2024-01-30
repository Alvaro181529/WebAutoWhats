
const { Router } = require("express");
const { beniController, NotesbeniController, NotesCreatebeniController, NotesUpdatebeniController, NotesDelatebeniController, logout, beniControllerAuth,beniControllerMessage,beniControllerReportes } = require("../controller/beni")
const router = Router();

// rutas
router.get("/beni", beniController);
router.post("/beni/auth", beniControllerAuth);
router.post("/beni/reportes", beniControllerReportes);
router.get("/beni/logout", logout);
router.get("/beni/message", beniControllerMessage);
router.get("/beni/notes", NotesbeniController);
router.post("/beni/notes", NotesCreatebeniController);
router.put("/beni/notes/:id", NotesUpdatebeniController);
router.delete("/beni/notes/:id", NotesDelatebeniController);

module.exports = router;
