
const { Router } = require("express");
const { cochabambaController, NotescochabambaController, NotesCreatecochabambaController, NotesUpdatecochabambaController, NotesDelatecochabambaController, logout,cochabambaControllerAuth ,cochabambaControllerMessage, cochabambaControllerReportes} = require("../controller/cochabamba")
const router = Router();

// rutas

router.get("/cochabamba", cochabambaController);
router.post("/cochabamba/auth", cochabambaControllerAuth);
router.post("/cochabamba/reportes", cochabambaControllerReportes);
router.get("/cochabamba/logout", logout);
router.get("/cochabamba/message", cochabambaControllerMessage);
router.get("/cochabamba/notes", NotescochabambaController);
router.post("/cochabamba/notes", NotesCreatecochabambaController);
router.put("/cochabamba/notes/:id", NotesUpdatecochabambaController);
router.delete("/cochabamba/notes/:id", NotesDelatecochabambaController);

module.exports = router;
