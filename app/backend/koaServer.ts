import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";
import { withTransaction } from "./middleware/middleware";
import { taskController } from "./controllers/taskController";

const app = new Koa();
const router = new Router();

// Middleware for parsing request bodies
app.use(bodyParser());

// Define routes with the transaction middleware
router.get("/tasks", withTransaction, taskController.getAll);
router.post("/tasks", withTransaction, taskController.addTask);
router.patch("/tasks", withTransaction, taskController.updateTaskStatus);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3001, () => {
  console.log("Koa server running on port 3001");
});
