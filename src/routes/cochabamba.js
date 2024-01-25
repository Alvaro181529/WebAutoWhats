
const { Router } = require("express");
const { cochabambaController, NotescochabambaController, NotesCreatecochabambaController, NotesUpdatecochabambaController, NotesDelatecochabambaController ,logout} = require("../controller/cochabamba")
const router = Router();

// rutas

router.get("/cochabamba", cochabambaController);
router.get("/cochabamba/logout", logout);
router.get("/cochabamba/notes", NotescochabambaController);
router.post("/cochabamba/notes", NotesCreatecochabambaController);
router.put("/cochabamba/notes/:id", NotesUpdatecochabambaController);
router.delete("/cochabamba/notes/:id", NotesDelatecochabambaController);

module.exports = router;
