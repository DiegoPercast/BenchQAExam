import { type Page, type Locator, expect } from "@playwright/test";
import { parseSubtaskCount } from "../utils/subtaskParser";

export interface TaskInfo {
  task: Locator;
  name: string;
  completed: number;
  total: number;
}

export class KanbanPage {
  constructor(private readonly page: Page) {}

  async navigate() {
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  async assertMinimumColumnCount(min: number) {
    const count = await this.page.locator("section").count();
    expect(count, `Expected at least ${min} columns`).toBeGreaterThanOrEqual(min);
  }

  async getFirstColumnName() {
    return this.page.locator("section").first().locator("h2").innerText();
  }

  async getColumnCount() {
    return this.page.locator("section").count();
  }

  async findFirstTaskWithIncompleteSubtasks(
    startColumnIndex = 1
  ) {
    const columnCount = await this.getColumnCount();

    for (let colIdx = startColumnIndex; colIdx < columnCount; colIdx++) {
      const column = this.page.locator("section").nth(colIdx);
      const tasks = column.locator("article");
      const taskCount = await tasks.count();

      for (let taskIdx = 0; taskIdx < taskCount; taskIdx++) {
        const task = tasks.nth(taskIdx);
        const subtaskText = await task.locator("p").first().innerText();
        const { completed, total } = parseSubtaskCount(subtaskText);

        console.log(
          `Column ${colIdx + 1}, Task ${taskIdx}: "${subtaskText}" → ${completed}/${total}`
        );

        if (total > 0 && completed < total) {
          const name = await task.locator("h3").innerText();
          console.log(
            `Selected task: "${name}" (${completed} of ${total}) in column ${colIdx + 1}`
          );
          return { task, name, completed, total };
        }
      }
    }

    throw new Error(
      "No task with incomplete subtasks found outside the first column"
    );
  }

  async assertTaskSubtaskCount(
    taskName: string,
    expectedCompleted: number
  ) {
    const task = this.page
      .locator("article")
      .filter({ hasText: taskName })
      .first();

    await expect(task, `Task "${taskName}" not visible`).toBeVisible({
      timeout: 10000,
    });

    const text = await task.locator("p").first().innerText();
    const { completed, total } = parseSubtaskCount(text);

    expect(
      completed,
      `Expected completed subtasks to be ${expectedCompleted}`
    ).toBe(expectedCompleted);

    console.log(`Verified: subtask count is now ${completed} of ${total}`);
  }

  async assertTaskIsInFirstColumn(taskName: string) {
    const firstColumnName = await this.getFirstColumnName();
    const taskInFirstColumn = this.page
      .locator("section")
      .first()
      .locator("article")
      .filter({ hasText: taskName });

    await expect(
      taskInFirstColumn,
      `Task "${taskName}" should be in "${firstColumnName}"`
    ).toBeVisible({ timeout: 10000 });
  }
}
