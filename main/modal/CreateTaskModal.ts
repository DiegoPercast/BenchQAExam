import { type Page } from "@playwright/test";
import { BaseModal } from "./BaseModal";
import { Character } from "../characterAPI";

export class CreateTaskModal extends BaseModal {
	protected readonly modal = this.page.locator(
		'xpath=//div[.//button[normalize-space(.)="Create Task"]]'
	).first();

	private readonly titleInput = this.modal.locator(
		'xpath=.//label[contains(text(),"Title")]/following-sibling::input | .//label[contains(text(),"Title")]/..//input'
	);
	private readonly descInput = this.modal.locator(
		'xpath=.//label[contains(text(),"Description")]/following-sibling::textarea | .//label[contains(text(),"Description")]/..//textarea'
	);
	private readonly addSubtaskBtn = this.modal.locator(
		'xpath=.//button[normalize-space(.)="+ Add New Subtask"]'
	);
	private readonly createBtn = this.modal.locator(
		'xpath=.//button[normalize-space(.)="Create Task"]'
	);

	private get subtaskInputs() {
		return this.modal.locator(
			'xpath=.//p[contains(text(),"Subtasks")]/following-sibling::div//input[not(@type="checkbox")]'
		);
	}

	constructor(page: Page) {
		super(page);
	}

	async fillFromCharacter(char: Character) {
		await this.titleInput.fill(char.name);
		await this.descInput.fill(`Status: ${char.status}, Species: ${char.species}`);

		await this.addSubtaskBtn.click();

		await this.subtaskInputs.nth(0).fill(`Gender: ${char.gender}`);
		await this.subtaskInputs.nth(1).fill(`Origin: ${char.origin.name}`);
		await this.subtaskInputs.nth(2).fill(`Location: ${char.location.name}`);
	}

	async submit(): Promise<void> {
		await this.createBtn.click();
	}
}