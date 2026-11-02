import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class RfqPage extends BasePage {
  readonly productSelect: Locator;
  readonly quantitySelect: Locator;
  readonly locationInput: Locator;
  readonly companyInput: Locator;
  readonly contactPersonInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly successHeading: Locator;
  readonly quoteNumberText: Locator;

  constructor(page: Page) {
    super(page);
    this.productSelect = page.locator('select').first();
    this.quantitySelect = page.locator('select').nth(1);
    this.locationInput = page.locator('input[placeholder*="Bengaluru, Karnataka" i], input[placeholder*="City" i]');
    this.companyInput = page.locator('input[placeholder*="Company" i], input[placeholder*="Agro" i]');
    this.contactPersonInput = page.locator('input[placeholder*="Contact Person" i], input[placeholder*="Mr." i]');
    this.phoneInput = page.locator('input[type="tel"], input[aria-label="WhatsApp Mobile Number"]');
    this.submitButton = page.locator('button[type="submit"]:has-text("RFQ"), button:has-text("Submit")');
    this.successHeading = page.locator('h1, h2').filter({ hasText: /Received|Success|Thank You|Quotation/i });
    this.quoteNumberText = page.locator('span, strong, div').filter({ hasText: /RFQ-\d+/i });
  }

  async fillRfqForm(data: {
    location: string;
    company: string;
    contactPerson: string;
    phone: string;
  }) {
    if (await this.locationInput.isVisible()) await this.locationInput.fill(data.location);
    if (await this.companyInput.isVisible()) await this.companyInput.fill(data.company);
    if (await this.contactPersonInput.isVisible()) await this.contactPersonInput.fill(data.contactPerson);
    if (await this.phoneInput.isVisible()) await this.phoneInput.fill(data.phone);
  }

  async submitRfq() {
    await this.submitButton.click();
  }
}
