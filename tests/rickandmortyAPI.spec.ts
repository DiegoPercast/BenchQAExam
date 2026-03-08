import { test } from "@playwright/test";
import { Board } from "../main/Board";
import { CreateTaskModal } from "../main/modal/CreateTaskModal";
import { CharacterAPI } from "../main/characterAPI";

let characterAPI: CharacterAPI;

test.beforeEach(async () => {
	characterAPI = new CharacterAPI();
	await characterAPI.init();
});

test("tc357_validateCreatingKanbanCardUsingAPI", async ({ page }) => {
	const board = new Board(page);
	const modal = new CreateTaskModal(page);
	const character = await characterAPI.getRandomCharacter();

	await board.goto();
	await board.openAddTaskModal();
	await modal.fillFromCharacter(character);
	await modal.submit();
	await board.verifyCardInFirstColumn(character.name);
});