import { Page, expect } from '@playwright/test';

export class Board {
	private readonly addTaskBtn = this.page.getByRole('button', { name: '+ Add New Task' });
	private readonly firstColumn = this.page.locator('section').first();

	constructor(private readonly page: Page) { }

	async goto() {
		await this.page.goto('/');
	}

	async openAddTaskModal() {
		await this.addTaskBtn.click();
	}

	async verifyCardInFirstColumn(name: string) {
		const card = this.firstColumn.locator('h3', { hasText: name });
		await expect(card, 'The Rick and Morty card was created successfully').toBeVisible({ timeout: 10000 });
	}
}