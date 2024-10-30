import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-body";
import { withTransaction } from "./middleware/middleware";
import { taskController } from "./controllers/taskController";
import { boardController } from "./controllers/boardController";
import { columnController } from "./controllers/columnController";

const app = new Koa();
const router = new Router();

// Middleware for parsing request bodies
app.use(bodyParser());

// Define routes with the transaction middleware
router.get("/api/board/:id", withTransaction, boardController.get);
router.post("/api/board", withTransaction, boardController.create);
router.patch("/api/board/:id", withTransaction, boardController.update);
router.delete("/api/board/:id", withTransaction, boardController.remove);

router.get("/api/column/:id", withTransaction, columnController.get);
router.post("/api/column", withTransaction, columnController.create);
router.patch("/api/column/:id", withTransaction, columnController.update);
router.delete("/api/column/:id", withTransaction, columnController.remove);

router.get("/api/task/:id", withTransaction, taskController.get);
router.post("/api/task", withTransaction, taskController.create);
router.patch("/api/task/:id", withTransaction, taskController.update);
router.delete("/api/task/:id", withTransaction, taskController.remove);

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.BACKEND_PORT || 3001;
app.listen(port, () => {
  console.log(`Koa server running on port ${port}`);
});
