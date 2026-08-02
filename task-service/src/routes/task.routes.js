const express = require("express");
const taskController = require("../controllers/task.controller");

const router = express.Router();

router.get("/", taskController.getList);
router.post("/", taskController.create);

router
  .route("/:id")
  .get(taskController.getOne)
  .patch(taskController.update)
  .delete(taskController.remove);

module.exports = router;
