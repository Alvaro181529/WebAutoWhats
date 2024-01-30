
const { Router } = require("express");
const { pandoController, NotespandoController, NotesCreatepandoController, NotesUpdatepandoController, NotesDelatepandoController ,logout, pandoControllerAuth, pandoControllerMessage, pandoControllerReportes} = require("../controller/pando")
const router = Router();

// rutas
router.get("/pando", pandoController);
router.post("/pando/auth", pandoControllerAuth);
router.post("/pando/reportes", pandoControllerReportes);
router.get("/pando/logout", logout);
router.get("/pando/message", pandoControllerMessage);
router.get("/pando/notes", NotespandoController);
router.post("/pando/notes", NotesCreatepandoController);
router.put("/pando/notes/:id", NotesUpdatepandoController);
router.delete("/pando/notes/:id", NotesDelatepandoController);

module.exports = router;
