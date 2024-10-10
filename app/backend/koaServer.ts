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
router.get("/api/tasks", withTransaction, taskController.getAll);
router.post("/api/tasks", withTransaction, taskController.addTask);
router.patch("/api/tasks", withTransaction, taskController.updateTaskStatus);

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.BACKEND_PORT || 3001;
app.listen(port, () => {
  console.log(`Koa server running on port ${port}`);
});
