import { type Page, type Locator, expect } from "@playwright/test";

export class TaskModal {
  private readonly modal: Locator;

  constructor(private readonly page: Page) {
    this.modal = page
      .locator("div.bg-white.dark\\:bg-dark-grey.rounded-lg.p-1")
      .first();
  }

  async waitForOpen() {
    await this.modal.waitFor({ state: "visible", timeout: 10000 });
    console.log("Modal is visible");
  }

  async close() {
    const backdrop = this.page
      .locator("div.fixed.min-h-screen.bg-black")
      .first();

    if ((await backdrop.count()) > 0) {
      await backdrop.click({ position: { x: 0, y: 0 } });
    } else {
      await this.page.keyboard.press("Escape");
    }

    await this.page.waitForTimeout(700);
    await this.modal.waitFor({ state: "hidden", timeout: 5000 });
    console.log("Modal closed");
  }

  private getSubtaskLabels(): Locator {
    return this.modal
      .locator("label")
      .filter({ has: this.page.locator('input[type="checkbox"]') });
  }

  async getSubtaskCount() {
    return this.getSubtaskLabels().count();
  }

  async checkFirstUncheckedSubtask() {
    const labels = this.getSubtaskLabels();
    const count = await labels.count();
    console.log(`Found ${count} subtask labels`);

    for (let i = 0; i < count; i++) {
      const label = labels.nth(i);
      const checkbox = label.locator('input[type="checkbox"]');

      const isChecked = await checkbox.evaluate(
        (el: HTMLInputElement) => el.checked
      );
      console.log(`Subtask ${i}: checked=${isChecked}`);

      if (!isChecked) {
        const title = await label.locator("span").innerText();
        await label.click();
        await this.page.waitForTimeout(400);

        const nowChecked = await checkbox.evaluate(
          (el: HTMLInputElement) => el.checked
        );

        if (nowChecked) {
          console.log(`Subtask "${title}" has been checked`);
          return title;
        }
      }
    }

    throw new Error("Could not find or check any unchecked subtask");
  }

  async assertSubtaskIsStrikethrough(subtaskTitle: string) {
    const label = this.modal
      .locator("label")
      .filter({ hasText: subtaskTitle });
    const span = label.locator("span").first();

    await expect(
      span,
      `Span for "${subtaskTitle}" should have line-through`
    ).toHaveClass(/line-through/, { timeout: 5000 });
  }

  async selectFirstStatus() {
    const dropdown = this.modal.locator('div[tabindex="1"][value]');
    await expect(dropdown, "Status dropdown not found").toBeVisible({
      timeout: 5000,
    });
    await dropdown.click();
    console.log("Opened status dropdown");

    const dropdownList = this.modal.locator("div.absolute.rounded.left-0").first();
    await dropdownList.waitFor({ state: "visible", timeout: 5000 });

    await dropdownList.locator("div").first().click();
    await this.page.waitForTimeout(400);
  }
}
