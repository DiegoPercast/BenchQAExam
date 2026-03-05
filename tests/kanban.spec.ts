import { test } from "@playwright/test";
import { KanbanPage } from "../main/KanbanPage";
import { TaskModal } from "../main/TaskModal";

test(
  "Edit a Kanban Task to mark a subtask as complete and move the Task to the first column",
  async ({ page }) => {
    const kanbanPage = new KanbanPage(page);
    const taskModal = new TaskModal(page);

    await kanbanPage.navigate();

    await kanbanPage.assertMinimumColumnCount(2);
    const firstColumnName = await kanbanPage.getFirstColumnName();
    console.log(`First column name: "${firstColumnName}"`);

    const { task, name: taskName, completed: initialCompleted, total: totalSubtasks } =
      await kanbanPage.findFirstTaskWithIncompleteSubtasks();

    await task.click();
    await taskModal.waitForOpen();

    const modalSubtaskCount = await taskModal.getSubtaskCount();
    console.assert(
      modalSubtaskCount === totalSubtasks,
      `Modal shows ${modalSubtaskCount} subtasks but card showed ${totalSubtasks}`
    );

    const checkedSubtaskTitle = await taskModal.checkFirstUncheckedSubtask();

    await taskModal.assertSubtaskIsStrikethrough(checkedSubtaskTitle);

    await taskModal.selectFirstStatus();

    await taskModal.close();

    await kanbanPage.assertTaskSubtaskCount(taskName, initialCompleted + 1);

    await kanbanPage.assertTaskIsInFirstColumn(taskName);
  }
);
