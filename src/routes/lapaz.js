
const { Router } = require("express");
const { lapazController, NoteslapazController, NotesCreatelapazController, NotesUpdatelapazController, NotesDelatelapazController ,logout } = require("../controller/lapaz")
const router = Router();

// rutas
router.get("/lapaz", lapazController);
// router.get("/lapaz/logout", logout);
router.get("/lapaz/notes", NoteslapazController);
router.post("/lapaz/notes", NotesCreatelapazController);
router.put("/lapaz/notes/:id", NotesUpdatelapazController);
router.delete("/lapaz/notes/:id", NotesDelatelapazController);

module.exports = router;
