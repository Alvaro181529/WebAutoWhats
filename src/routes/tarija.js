
const { Router } = require("express");
const { tarijaController, NotestarijaController, NotesCreatetarijaController, NotesUpdatetarijaController, NotesDelatetarijaController,logout, tarijaControllerAuth } = require("../controller/tarija")
const router = Router();

// rutas
router.get("/tarija", tarijaController);
router.post("/tarija/auth", tarijaControllerAuth);
router.get("/tarija/logout", logout);
router.get("/tarija/notes", NotestarijaController);
router.post("/tarija/notes", NotesCreatetarijaController);
router.put("/tarija/notes/:id", NotesUpdatetarijaController);
router.delete("/tarija/notes/:id", NotesDelatetarijaController);

module.exports = router;
