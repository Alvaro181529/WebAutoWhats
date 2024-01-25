
const { Router } = require("express");
const { potosiController, NotespotosiController, NotesCreatepotosiController, NotesUpdatepotosiController, NotesDelatepotosiController,logout } = require("../controller/potosi")
const router = Router();

// rutas
router.get("/potosi", potosiController);
router.get("/potosi/logout", logout);
router.get("/potosi/notes", NotespotosiController);
router.post("/potosi/notes", NotesCreatepotosiController);
router.put("/potosi/notes/:id", NotesUpdatepotosiController);
router.delete("/potosi/notes/:id", NotesDelatepotosiController);

module.exports = router;
