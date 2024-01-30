
const { Router } = require("express");
const { santacruzController, NotessantacruzController, NotesCreatesantacruzController, NotesUpdatesantacruzController, NotesDelatesantacruzController,logout, santacruzControllerAuth, santacruzControllerMessage, santacruzControllerReportes } = require("../controller/santacruz")
const router = Router();

// rutas
router.get("/santacruz", santacruzController);
router.post("/santacruz/auth", santacruzControllerAuth);
router.post("/santacruz/reportes", santacruzControllerReportes);
router.get("/santacruz/logout", logout);
router.get("/santacruz/message", santacruzControllerMessage);
router.get("/santacruz/notes", NotessantacruzController);
router.post("/santacruz/notes", NotesCreatesantacruzController);
router.put("/santacruz/notes/:id", NotesUpdatesantacruzController);
router.delete("/santacruz/notes/:id", NotesDelatesantacruzController);

module.exports = router;
