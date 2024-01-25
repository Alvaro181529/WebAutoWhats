
const { Router } = require("express");
const { pandoController, NotespandoController, NotesCreatepandoController, NotesUpdatepandoController, NotesDelatepandoController } = require("../controller/pando")
const router = Router();

// rutas
router.get("/pando", pandoController);
router.get("/pando/notes", NotespandoController);
router.post("/pando/notes", NotesCreatepandoController);
router.put("/pando/notes/:id", NotesUpdatepandoController);
router.delete("/pando/notes/:id", NotesDelatepandoController);

module.exports = router;
