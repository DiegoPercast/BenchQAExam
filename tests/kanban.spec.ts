import { test, expect } from "@playwright/test";
import { KanbanPage, TaskInfo } from "../main/KanbanPage";
import { EditTaskModal } from "../main/modal/EditTaskModal";

test(
  "Edit a Kanban Task to mark a subtask as complete and move the Task to the first column",
  async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const taskModal = new EditTaskModal(page);

    await kanbanPage.navigate();
    await kanbanPage.assertMinimumColumnCount(2);

    const firstColumnName = await kanbanPage.getFirstColumnName();
    console.log(`First column name: "${firstColumnName}"`);

    const { task, name: taskName, completed: initialCompleted, total: totalSubtasks } =
      await kanbanPage.findFirstTaskWithIncompleteSubtasks() as TaskInfo;

    await task.click();
    await taskModal.waitForOpen();

    const modalSubtaskCount = await taskModal.getSubtaskCount();
    expect(
      modalSubtaskCount,
      `Modal shows ${modalSubtaskCount} subtasks but card showed ${totalSubtasks}`
    ).toBe(totalSubtasks);

    const checkedSubtaskTitle = await taskModal.checkFirstUncheckedSubtask();
    await taskModal.assertSubtaskIsStrikethrough(checkedSubtaskTitle);
    await taskModal.selectFirstStatus();
    await taskModal.close();

    await kanbanPage.assertTaskSubtaskCount(taskName, initialCompleted + 1);
    await kanbanPage.assertTaskIsInFirstColumn(taskName);
  }
);