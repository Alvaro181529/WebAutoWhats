
const { Router } = require("express");
const { certificadolapazController, NotescertificadolapazController, NotesCreatecertificadolapazController, NotesUpdatecertificadolapazController, NotesDelatecertificadolapazController ,logout, certificadolapazControllerAuth, certificadolapazControllerMessage, certificadolapazControllerReportes, certificade  } = require("../../controller/certificade/certificadolapaz");
const router = Router();

// rutas
router.get("/certificadolapaz", certificadolapazController);
router.post("/certificadolapaz/auth", certificadolapazControllerAuth);
router.post("/certificadolapaz/reportes", certificadolapazControllerReportes);
router.get("/certificadolapaz/logout", logout);
router.get("/certificadolapaz/notes", NotescertificadolapazController);
router.get("/certificadolapaz/message", certificadolapazControllerMessage);
router.post("/certificadolapaz/notes", NotesCreatecertificadolapazController);
router.put("/certificadolapaz/notes/:id", NotesUpdatecertificadolapazController);
router.delete("/certificadolapaz/notes/:id", NotesDelatecertificadolapazController);

module.exports = router;
