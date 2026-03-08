import { type Page, type Locator, expect } from "@playwright/test";
import { BaseModal } from "./BaseModal";

export class EditTaskModal extends BaseModal {
	constructor(page: Page) {
		super(page);
	}

	private getSubtaskLabels(): Locator {
		return this.modal.locator('xpath=.//label[.//input[@type="checkbox"]]');
	}

	async getSubtaskCount(): Promise<number> {
		return this.getSubtaskLabels().count();
	}

	async checkFirstUncheckedSubtask(): Promise<string> {
		const labels = this.getSubtaskLabels();
		const count = await labels.count();
		console.log(`Found ${count} subtask labels`);

		for (let i = 0; i < count; i++) {
			const label = labels.nth(i);
			const checkbox = label.locator('xpath=.//input[@type="checkbox"]');
			const isChecked = await checkbox.evaluate((el: HTMLInputElement) => el.checked);
			console.log(`Subtask ${i}: checked=${isChecked}`);

			if (!isChecked) {
				const title = await label.locator("xpath=.//span[1]").innerText();
				await label.click();

				await expect(checkbox).toBeChecked({ timeout: 3000 });
				console.log(`Subtask "${title}" has been checked`);
				return title;
			}
		}

		throw new Error("Could not find or check any unchecked subtask");
	}

	async assertSubtaskIsStrikethrough(subtaskTitle: string): Promise<void> {
		const label = this.modal
			.locator('xpath=.//label[.//input[@type="checkbox"]]')
			.filter({ hasText: subtaskTitle });
		const span = label.locator("xpath=.//span[1]");

		await expect(
			span,
			`Span for "${subtaskTitle}" should have line-through`
		).toHaveClass(/line-through/, { timeout: 5000 });
	}

	async selectFirstStatus(): Promise<void> {
		const dropdown = this.modal.locator('div[tabindex="1"][value]');
		await expect(dropdown, "Status dropdown not found").toBeVisible({ timeout: 5000 });
		await dropdown.click();
		console.log("Opened status dropdown");

		const dropdownList = dropdown
			.locator("xpath=./div[contains(@class,'absolute')]")
			.first();
		await dropdownList.waitFor({ state: "visible", timeout: 5000 });

		await dropdownList.locator("xpath=.//div[1]").click();

		await expect(dropdownList).toBeHidden({ timeout: 3000 });
	}
}