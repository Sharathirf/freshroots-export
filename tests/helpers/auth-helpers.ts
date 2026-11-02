import { BrowserContext } from '@playwright/test';
import { createAdminSession } from '../../src/lib/admin-auth';

export async function loginAsAdmin(context: BrowserContext, baseURL: string) {
  const { value } = createAdminSession();
  const url = baseURL || 'http://localhost:3000';

  await context.addCookies([
    {
      name: 'freshroots_admin_session',
      value,
      url,
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: 'freshroots_admin_device',
      value: 'true',
      url,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}
