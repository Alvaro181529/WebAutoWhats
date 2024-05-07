
const { Router } = require("express");
const { lapazController, NoteslapazController, NotesCreatelapazController, NotesUpdatelapazController, NotesDelatelapazController ,logout, lapazControllerAuth, lapazControllerMessage, lapazControllerReportes  } = require("../controller/lapaz");
const router = Router();

// rutas
router.get("/lapaz", lapazController);
router.post("/lapaz/auth", lapazControllerAuth);
router.post("/lapaz/reportes", lapazControllerReportes);
router.get("/lapaz/logout", logout);
router.get("/lapaz/notes", NoteslapazController);
router.get("/lapaz/message", lapazControllerMessage);
router.post("/lapaz/notes", NotesCreatelapazController);
router.put("/lapaz/notes/:id", NotesUpdatelapazController);
router.delete("/lapaz/notes/:id", NotesDelatelapazController);

module.exports = router;
