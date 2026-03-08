import { type Page, type Locator } from "@playwright/test";

export abstract class BaseModal {
	protected readonly modal: Locator;

	constructor(protected readonly page: Page) {
		this.modal = page
			.locator(
				"xpath=//div[contains(@class,'top-1/2') and contains(@class,'left-1/2')]//div[contains(@class,'bg-white') and contains(@class,'rounded-lg')]"
			)
			.first();
	}

	async waitForOpen(): Promise<void> {
		await this.modal.waitFor({ state: "visible", timeout: 10000 });
		console.log("Modal is visible");
	}

	async close(): Promise<void> {
		const backdrop = this.page
			.locator(
				"xpath=//div[contains(@class,'fixed') and contains(@class,'min-h-screen') and contains(@class,'bg-black')]"
			)
			.first();

		if ((await backdrop.count()) > 0) {
			await backdrop.click({ position: { x: 0, y: 0 } });
		} else {
			await this.page.keyboard.press("Escape");
		}

		await this.modal.waitFor({ state: "hidden", timeout: 5000 });
		console.log("Modal closed");
	}
}