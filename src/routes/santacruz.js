
const { Router } = require("express");
const { santacruzController, NotessantacruzController, NotesCreatesantacruzController, NotesUpdatesantacruzController, NotesDelatesantacruzController } = require("../controller/santacruz")
const router = Router();

// rutas
router.get("/santacruz", santacruzController);
router.get("/santacruz/notes", NotessantacruzController);
router.post("/santacruz/notes", NotesCreatesantacruzController);
router.put("/santacruz/notes/:id", NotesUpdatesantacruzController);
router.delete("/santacruz/notes/:id", NotesDelatesantacruzController);

module.exports = router;
