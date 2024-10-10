import { test, expect, Page } from "@playwright/test";
import { cleanupDatabase } from "./cleanupDatabase";

// Helper function to create a task
async function createTask(
  page: Page,
  title: string,
  description: string
): Promise<number | undefined> {
  let createdTaskId: number | undefined;

  await page.route("/api/tasks", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      const response = await route.fetch();
      const responseBody = await response.json();
      createdTaskId = responseBody.id;
      expect(createdTaskId).toBeDefined();
      await route.fulfill({ response });
    } else {
      await route.continue();
    }
  });

  await page.getByTestId("add-task-button").click();
  await page.getByTestId("task-title-input").fill(title);
  await page.getByTestId("task-description-input").fill(description);
  await page.getByTestId("add-task-confirm").click();
  await page.waitForResponse("/api/tasks");

  const taskCard = page.getByTestId(`task-card-${createdTaskId}`);
  await expect(taskCard).toBeVisible();
  await expect(taskCard).toContainText(title);
  await expect(taskCard).toContainText(description);

  return createdTaskId;
}

// Helper function to drag a task card to a target column
async function dragTaskToColumn(
  page: Page,
  taskId: number,
  targetColumnTestId: string,
  clickConfirmButton: boolean = false,
  expectError: boolean = false
) {
  const taskCard = page.getByTestId(`task-card-${taskId}`);
  const targetColumn = page.getByTestId(targetColumnTestId);
  await taskCard.dragTo(targetColumn);

  if (clickConfirmButton) await page.getByTestId("move-task").click();
  if (!expectError) {
    await expect(
      targetColumn.locator(`data-testid=task-card-${taskId}`)
    ).toBeVisible();
  }
}

test.describe("Kanban Board - Task Management", () => {
  async function waitForServer(url: string, timeout: number = 60000) {
    console.log("Waiting for server to be up...", url);
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        await fetch(url);
        console.log("Server is up!");
        return;
      } catch (err) {
        // Server is not up yet, keep waiting
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Server not reachable after ${timeout}ms`);
  }

  test.beforeAll(async () => {
    // Wipe the database before tests
    await cleanupDatabase();

    if (process.env.BASE_URL) await waitForServer(process.env.BASE_URL, 60000);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should create a task and move it to TODO", async ({ page }) => {
    const timestamp = Date.now();
    const title = `Title ${timestamp}`;
    const description = `Description ${timestamp}`;

    const taskId = await createTask(page, title, description);
    if (!taskId) throw new Error("Task creation failed, no task ID returned");

    await dragTaskToColumn(page, taskId, "task-column-TODO");

    const doingColumn = page.getByTestId("task-column-TODO");
    await expect(
      doingColumn.locator(`data-testid=task-card-${taskId}`)
    ).toBeVisible();
  });

  test("should create a task and try move it to DONE, should get a fail", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const title = `Title ${timestamp}`;
    const description = `Description ${timestamp}`;

    const taskId = await createTask(page, title, description);
    if (!taskId) throw new Error("Task creation failed, no task ID returned");

    await dragTaskToColumn(page, taskId, "task-column-DONE", false, true);

    const doingColumn = page.getByTestId("task-column-BACKLOG");
    await expect(
      doingColumn.locator(`data-testid=task-card-${taskId}`)
    ).toBeVisible();
  });

  test("should create a task and move it to DONE, then move it back to DOING, should get a fail", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const title = `Title ${timestamp}`;
    const description = `Description ${timestamp}`;

    const taskId = await createTask(page, title, description);
    if (!taskId) throw new Error("Task creation failed, no task ID returned");

    await dragTaskToColumn(page, taskId, "task-column-TODO");
    await dragTaskToColumn(page, taskId, "task-column-DOING");
    await dragTaskToColumn(page, taskId, "task-column-DONE", true);
    await dragTaskToColumn(page, taskId, "task-column-DOING", false, true);

    const doingColumn = page.getByTestId("task-column-DONE");
    await expect(
      doingColumn.locator(`data-testid=task-card-${taskId}`)
    ).toBeVisible();
  });

  test("should create 3 tasks, move existing DOING tasks to DONE, and handle error on 3rd move to DOING", async ({
    page,
  }) => {
    const taskIds: number[] = [];

    // Create 3 tasks
    for (let i = 1; i <= 3; i++) {
      const timestamp = Date.now() + i;
      const taskId = await createTask(
        page,
        `Title ${timestamp}`,
        `Description ${timestamp}`
      );
      if (taskId) taskIds.push(taskId);
    }

    // Drag the existing DOING tasks one by one
    const doingCards = page
      .getByTestId("task-column-DOING")
      .locator("[data-testid^='task-card-']");

    const taskCount = await doingCards.count();

    for (let i = 0; i < taskCount; i++) {
      const taskCardId = await doingCards.nth(0).getAttribute("data-testid");
      const taskId = taskCardId?.split("-")[2];

      if (taskId)
        await dragTaskToColumn(page, parseInt(taskId), "task-column-TODO");
    }

    for (let i = 0; i < 3; i++) {
      await dragTaskToColumn(page, taskIds[i], "task-column-TODO");
    }

    // Drag the tasks one by one, expect error on the 3rd move
    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        await dragTaskToColumn(page, taskIds[i], "task-column-DOING");
      } else {
        await dragTaskToColumn(
          page,
          taskIds[i],
          "task-column-DOING",
          false,
          true
        );
        const snackbar = page.getByTestId("snackbar");
        await expect(snackbar).toBeVisible();

        // Close snackbar
        await page.getByTestId("close-snackbar").click();
        await expect(snackbar).not.toBeVisible();

        // Ensure the last task is still in the TODO
        const lastTaskCard = page.getByTestId(`task-card-${taskIds[i]}`);
        await expect(lastTaskCard).toBeVisible();
        await expect(
          page
            .getByTestId("task-column-TODO")
            .locator(`data-testid=task-card-${taskIds[i]}`)
        ).toBeVisible();
      }
    }
  });
});
