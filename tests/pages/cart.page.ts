import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly drawer: Locator;
  readonly closeButton: Locator;
  readonly cartItems: Locator;
  readonly subtotalText: Locator;
  readonly emptyCartMessage: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly pincodeInput: Locator;
  readonly sendOtpButton: Locator;
  readonly otpInput: Locator;
  readonly verifyOtpButton: Locator;

  constructor(page: Page) {
    super(page);
    this.drawer = page.locator('div.fixed.inset-0, div[role="dialog"], aside').filter({ hasText: /Shopping Cart|My Cart|Cart/i });
    this.closeButton = page.locator('button[aria-label="Close Cart"], button:has-text("✕"), button:has(svg.lucide-x)');
    this.cartItems = page.locator('div.border.rounded-2xl, div.p-3.rounded-2xl').filter({ hasText: /₹/ });
    this.subtotalText = page.locator('div:has-text("Subtotal"), div:has-text("Total Amount")');
    this.emptyCartMessage = page.locator('text=/Cart is empty|Your cart is empty/i');
    this.nameInput = page.locator('input[placeholder*="Name" i]');
    this.phoneInput = page.locator('input[type="tel"], input[placeholder*="Phone" i], input[placeholder*="Mobile" i]');
    this.addressInput = page.locator('textarea, input[placeholder*="Address" i]');
    this.pincodeInput = page.locator('input[placeholder*="PIN" i], input[placeholder*="Pincode" i]');
    this.sendOtpButton = page.locator('button:has-text("Send OTP"), button:has-text("Get OTP")');
    this.otpInput = page.locator('input[placeholder*="OTP" i], input[placeholder*="Code" i]');
    this.verifyOtpButton = page.locator('button:has-text("Verify")');
  }

  async closeCart() {
    await this.closeButton.first().click().catch(() => undefined);
  }
}
