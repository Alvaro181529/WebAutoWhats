
const { Router } = require("express");
const { sucreController, NotessucreController, NotesCreatesucreController, NotesUpdatesucreController, NotesDelatesucreController } = require("../controller/sucre")
const router = Router();

// rutas
router.get("/sucre", sucreController);
router.get("/sucre/logout", logout);
router.get("/sucre/notes", NotessucreController);
router.post("/sucre/notes", NotesCreatesucreController);
router.put("/sucre/notes/:id", NotesUpdatesucreController);
router.delete("/sucre/notes/:id", NotesDelatesucreController);

module.exports = router;
