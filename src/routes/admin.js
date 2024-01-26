
const { Router } = require("express");
const { adminControllerAuth, adminUsersController, adminUpdateController, } = require("../controller/admin")
const router = Router();

// rutas
router.post("/adminPage/auth", adminControllerAuth);
router.get("/adminPage/users", adminUsersController);
router.put("/adminPage/users/:id", adminUpdateController);

module.exports = router;
