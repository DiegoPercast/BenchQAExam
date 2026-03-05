import { test, expect } from "playwright/test";

import { Locator } from "@playwright/test";

// async function waitForComponentsToLoad(page: Page) {
//   await page.waitForSelector("section", { timeout: 15000 });
//   await page.waitForSelector("article", { timeout: 15000 });
// }

function parseSubtaskCount(text: string): { completed: number; total: number } {
  const match = text.match(/(\d+)\s+of\s+(\d+)/); // El match devuelve las 2 expresiones entre parentesis y las guarda en match
  if (!match) return { completed: 0, total: 0 };
  return { completed: parseInt(match[1]), total: parseInt(match[2]) }; // Se devuelven los dos numeros encontrados como un objeto
}

test("Edit a Kanban Task to mark a subtask as complete and move the Task to the first column", async ({
  page,
}) => {
  // 1. Navigate to the Kanban app
  await page.goto("/", { waitUntil: "domcontentloaded" }); // Despues descubrí que no ocupaba la función, y entiendo que es una buena práctica

  // await waitForComponentsToLoad(page); // Aqui la mandaba llamar

  // 2. Choose a Task with subtasks that are not completed and that is not in the first column
  const sections = page.locator("section");
  const columnCount = await sections.count();
  expect(columnCount, "Expect at least to Columns").toBeGreaterThanOrEqual(2);

  const firstColumnName = await sections.first().locator("h2").innerText();

  console.log(`Nombre de la primera columna: ${firstColumnName}`);

  let targetTaskName = "";
  let initialCompleted = 0;
  let initialTotal = 0;
  let targetTask: Locator | null = null;
  let totalSubtasks = 0;

  for (let colId = 1; colId < columnCount; colId++) {
    const tasks = sections.nth(colId).locator("article");
    const taskCount = await tasks.count();

    for (let i = 0; i < taskCount; i++) {
      const task = tasks.nth(i);
      const subtaskInfoText = await task.locator("p").first().innerText();
      const { completed, total } = parseSubtaskCount(subtaskInfoText);
      totalSubtasks = total;
      console.log(
        `${subtaskInfoText} - ${completed} of ${total} subtasks, should be the same`,
      );

      if (total > 0 && completed < total) {
        targetTask = task;
        targetTaskName = await task.locator("h3").innerText();
        initialCompleted = completed;
        initialTotal = total;
        console.log(
          `Selected: "${targetTaskName}" (${completed} of ${total}) in column ${colId + 1}`,
        );
        break;
      }
    }
    if (targetTask) break;
  }

  expect(targetTask, "Available Task found").not.toBeNull();

  // 3. Complete one subtask
  await targetTask!.click();

  const modal = page
    .locator("div.bg-white.dark\\:bg-dark-grey.rounded-lg.p-1")
    .first();
  await modal.waitFor({ state: "visible", timeout: 10000 });
  console.log("Modal is visible");

  const subtaskLabels = modal
    .locator("label")
    .filter({ has: page.locator('input[type="checkbox"]') });
  const subtaskCount = await subtaskLabels.count();
  console.log(`Found ${subtaskCount} subtask labels`);
  expect(
    subtaskCount,
    "Expect the total found before to be the same as the subtaskCount here",
  ).toEqual(totalSubtasks);
  expect(subtaskCount, "Expected at least one subtask").toBeGreaterThan(0);

  let checkedSubtaskTitle = "";

  for (let i = 0; i < subtaskCount; i++) {
    const label = subtaskLabels.nth(i);
    const checkbox = label.locator('input[type="checkbox"]');
    const isChecked = await checkbox.evaluate(
      (element: HTMLInputElement) => element.checked,
    );
    console.log(`Subtask ${i}: checked=${isChecked}`);

    if (!isChecked) {
      checkedSubtaskTitle = await label.locator("span").innerText();
      await label.click();
      await page.waitForTimeout(400);

      const nowChecked = await checkbox.evaluate(
        (element: HTMLInputElement) => element.checked,
      );
      if (nowChecked) {
        console.log(`Subtask "${checkedSubtaskTitle}" been checked`);
        break;
      }
    }
  }

  expect(checkedSubtaskTitle, "Could not check any subtask").not.toBe("");

  // 5. Verify that the subtask is striked through
  const checkedLabel = modal
    .locator("label")
    .filter({ hasText: checkedSubtaskTitle });
  const checkedSpan = checkedLabel.locator("span").first();
  await expect(
    checkedSpan,
    `Span for "${checkedSubtaskTitle}" should have line-through`,
  ).toHaveClass(/line-through/, { timeout: 5000 });

  // 4. Move task to the first column
  const statusDropdown = modal.locator('div[tabindex="1"][value]');
  await expect(statusDropdown, "Status dropdown not found").toBeVisible({
    timeout: 5000,
  });
  await statusDropdown.click();

  console.log("Opened status dropdown");

  const dropdownList = modal.locator("div.absolute.rounded.left-0").first();
  await dropdownList.waitFor({ state: "visible", timeout: 5000 });

  const firstOption = dropdownList.locator("div").first();

  await firstOption.click();
  await page.waitForTimeout(400);

  // 6. Close the card edit page
  const backdrop = page.locator("div.fixed.min-h-screen.bg-black").first();
  if ((await backdrop.count()) > 0) {
    await backdrop.click({ position: { x: 0, y: 0 } });
  } else {
    await page.keyboard.press("Escape");
  }

  await page.waitForTimeout(700);
  await modal.waitFor({ state: "hidden", timeout: 5000 });
  console.log("Modal closed");

  // 7. Verify that the number of completed subtasks is correct
  const updatedTask = page
    .locator("article")
    .filter({ hasText: targetTaskName })
    .first();
  await expect(updatedTask, `Task "${targetTaskName}" not visible`).toBeVisible(
    { timeout: 10000 },
  );

  const updatedText = await updatedTask.locator("p").first().innerText();
  const { completed: newCompleted, total: newTotal } =
    parseSubtaskCount(updatedText);

  expect(newCompleted, `Completed should be ${initialCompleted + 1}`).toBe(
    initialCompleted + 1,
  );
  console.log(`Verified: subtask count is now ${newCompleted} of ${newTotal}`);

  // 8. Verify that the card moved to the correct column
  const TaskInFirstColumn = page
    .locator("section")
    .first()
    .locator("article")
    .filter({ hasText: targetTaskName });

  await expect(
    TaskInFirstColumn,
    `Task "${targetTaskName}" should be in "${firstColumnName}"`,
  ).toBeVisible({ timeout: 10000 });
});
