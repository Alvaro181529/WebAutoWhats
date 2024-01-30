
const { Router } = require("express");
const { potosiController, NotespotosiController, NotesCreatepotosiController, NotesUpdatepotosiController, NotesDelatepotosiController,logout, potosiControllerAuth, potosiControllerMessage, potosiControllerReportes } = require("../controller/potosi")
const router = Router();

// rutas
router.get("/potosi", potosiController);
router.post("/potosi/auth", potosiControllerAuth);
router.post("/potosi/reportes", potosiControllerReportes);
router.get("/potosi/logout", logout);
router.get("/potosi/message", potosiControllerMessage);
router.get("/potosi/notes", NotespotosiController);
router.post("/potosi/notes", NotesCreatepotosiController);
router.put("/potosi/notes/:id", NotesUpdatepotosiController);
router.delete("/potosi/notes/:id", NotesDelatepotosiController);

module.exports = router;
