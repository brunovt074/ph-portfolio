import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const customer = { nombre: 'Camila Ríos', email: 'camila@example.com', telefono: '+54 9 341 000 0000' };

const uniqueAddress = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

const dateInDays = (days: number): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(Date.now() + days * 86_400_000),
  );

const randomIndex = (count: number) => Math.floor(Math.random() * count);

const waitForForm = (page: Page) =>
  page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-booking-form]')?.dataset['ready'] === 'true');

const chooseSession = (page: Page, slug: string) => page.locator(`label[for="reserva-sesion-${slug}"]`).click();

const settled = (page: Page) => expect(page.locator('[data-slot-picker]')).not.toHaveAttribute('aria-busy', 'true');

const advanceWindows = async (page: Page, windows: number) => {
  for (let step = 0; step < windows; step += 1) {
    await settled(page);
    await page.locator('[data-days-next]').click();
  }
  await settled(page);
};

const advanceToFreeWindow = async (page: Page): Promise<number> => {
  for (let windows = 0; windows < 8; windows += 1) {
    await settled(page);
    if ((await page.locator('[data-day]:not([disabled])').count()) > 0) {
      return windows;
    }
    await page.locator('[data-days-next]').click();
  }
  throw new Error('No free turns in the next windows');
};

const chooseRandomSlot = async (page: Page): Promise<string> => {
  await advanceToFreeWindow(page);
  const days = page.locator('[data-day]:not([disabled])');
  await days.nth(randomIndex(await days.count())).click();
  const slots = page.locator('[data-slot-grid] label');
  await expect(slots.first()).toBeVisible();
  const slot = slots.nth(randomIndex(await slots.count()));
  await slot.click();
  return slot.locator('input').inputValue();
};

const fillCustomer = async (page: Page) => {
  await page.locator('#reserva-nombre').fill(customer.nombre);
  await page.locator('#reserva-email').fill(customer.email);
  await page.locator('#reserva-telefono').fill(customer.telefono);
  await page.locator('#reserva-notas').fill('Prefiero luz natural.');
  await page.locator('label.accept-label').click();
};

const submit = (page: Page) => page.locator('[data-booking-form] button[type="submit"]').click();

const openForm = async (page: Page, path = '/es/reservas') => {
  await page.goto(path);
  await waitForForm(page);
};

const capture = async (page: Page, path: string) => {
  await page.waitForTimeout(1500);
  await page.screenshot({ path, fullPage: true });
};

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': uniqueAddress() });
});

test.describe('booking page', () => {
  test('loads clean, shows the demo band and the four sessions with total and deposit', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await openForm(page);

    await expect(page.locator('h1')).toContainText('Reservá tu sesión');
    await expect(page.locator('.demo-banner')).toHaveText('Precios de demostración — todavía no son los precios reales.');
    await expect(page.locator('.card')).toHaveCount(4);
    const maternity = page.locator('.card', { hasText: 'Maternidad' });
    await expect(maternity).toContainText('Total');
    await expect(maternity).toContainText('95.000');
    await expect(maternity).toContainText('Seña');
    await expect(maternity).toContainText('47.500');
    await expect(page.locator('.policy')).toHaveText('[POLÍTICA DE CANCELACIÓN]');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(consoleErrors).toEqual([]);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  });

  test('has no accessibility violations while validation errors are visible', async ({ page }, testInfo) => {
    await openForm(page);
    await submit(page);
    await expect(page.locator('#reserva-nombre-error')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
    await capture(page, `qa/r2/reservas-errores-${testInfo.project.name}.png`);
  });

  test('preselects the session coming from the link in the query', async ({ page }) => {
    await openForm(page, '/es/reservas?sesion=familias');

    await expect(page.locator('#reserva-sesion-familias')).toBeChecked();
    await expect(page.locator('[data-summary]')).toContainText('55.000');
    await expect(page.locator('[data-panel="slots"]')).toBeVisible();
  });

  test('lets the client choose to pay the full amount and reflects it in the summary and the button', async ({ page }, testInfo) => {
    await openForm(page);
    await capture(page, `qa/r2/reservas-vacio-${testInfo.project.name}.png`);

    await chooseSession(page, 'maternidad');
    await expect(page.locator('[data-summary]')).toHaveText(/Seña a pagar ahora: .*47\.500/);
    await expect(page.locator('[data-booking-form] button[type="submit"]')).toHaveText(/Ir al pago de .*47\.500/);

    await page.locator('label.plan', { hasText: 'total' }).click();

    await expect(page.locator('[data-summary]')).toHaveText(/Total a pagar ahora: .*95\.000/);
    await expect(page.locator('[data-booking-form] button[type="submit"]')).toHaveText(/Ir al pago de .*95\.000/);
    await chooseRandomSlot(page);
    await capture(page, `qa/r2/reservas-sesion-${testInfo.project.name}.png`);
  });
});

test.describe('booking with turns', () => {
  test('books a turn, pays the deposit in the simulator and sees the confirmation with the exact time', async ({ page }, testInfo) => {
    await openForm(page);
    await chooseSession(page, 'maternidad');
    await chooseRandomSlot(page);
    await fillCustomer(page);

    await submit(page);

    await expect(page).toHaveURL(/\/reservas\/simulador\/sim_\d+/);
    await expect(page.locator('.simulator-banner')).toContainText('no se cobra nada');
    await expect(page.locator('.amount')).toContainText('47.500');

    await page.getByRole('button', { name: 'Aprobar pago' }).click();

    await expect(page).toHaveURL(/\/reservas\/[0-9a-f-]{36}(\?.*)?$/);
    await expect(page.locator('h1')).toHaveText('¡Tu lugar está reservado!');
    await expect(page.locator('.t-lead')).toContainText('Recibí tu seña, Camila');
    await expect(page.locator('.t-lead')).toContainText(/a las \d{2}:\d{2}/);
    await expect(page.locator('.summary')).toContainText('Maternidad');
    await expect(page.locator('.summary')).toContainText('47.500');
    await capture(page, `qa/r2/resultado-confirmado-${testInfo.project.name}.png`);
  });

  test('pays the full amount and the confirmation does not mention a balance', async ({ page }) => {
    await openForm(page);
    await chooseSession(page, 'retrato-personal');
    await chooseRandomSlot(page);
    await fillCustomer(page);
    await page.locator('label.plan', { hasText: 'total' }).click();

    await submit(page);
    await expect(page.locator('.amount')).toContainText('85.000');
    await page.getByRole('button', { name: 'Aprobar pago' }).click();

    await expect(page.locator('h1')).toHaveText('¡Tu lugar está reservado!');
    await expect(page.locator('.t-lead')).toContainText('Recibí el pago completo, Camila');
    await expect(page.locator('.summary')).not.toContainText('Saldo');
  });

  test('a rejected payment can be retried until it is approved', async ({ page }, testInfo) => {
    await openForm(page);
    await chooseSession(page, 'familias');
    await chooseRandomSlot(page);
    await fillCustomer(page);
    await submit(page);

    await page.getByRole('button', { name: 'Rechazar pago' }).click();

    await expect(page.locator('h1')).toHaveText('El pago no se completó');
    await expect(page.locator('.t-lead')).toContainText('No se cobró nada');
    await expect(page.locator('.note')).toContainText('Tu turno queda retenido hasta las');
    await capture(page, `qa/r2/resultado-rechazado-${testInfo.project.name}.png`);
    const resultUrl = page.url();

    await page.getByRole('button', { name: 'Reintentar el pago' }).click();

    await expect(page).toHaveURL(/\/reservas\/simulador\/sim_\d+/);
    await page.goto(resultUrl);
    await expect(page.locator('h1')).toHaveText('Todavía no confirmamos tu pago');
    await expect(page.locator('.t-lead')).not.toContainText('No se cobró nada');
    await expect(page.getByRole('link', { name: 'Actualizar estado' })).toBeVisible();
    await capture(page, `qa/r2/resultado-pendiente-de-pago-${testInfo.project.name}.png`);
    await page.getByRole('button', { name: 'Reintentar el pago' }).click();
    await page.getByRole('button', { name: 'Aprobar pago' }).click();

    await expect(page.locator('h1')).toHaveText('¡Tu lugar está reservado!');
  });

  test('the second client who picks the same turn is told it was just taken and the grid refreshes', async ({ browser, page }) => {
    const second = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': uniqueAddress() } });
    const other = await second.newPage();
    await openForm(page);
    await openForm(other);
    await chooseSession(page, 'marca-personal');
    await chooseSession(other, 'marca-personal');
    const windows = await advanceToFreeWindow(page);
    await advanceWindows(other, windows);
    const days = page.locator('[data-day]:not([disabled])');
    const dayIndex = randomIndex(await days.count());
    const dayValue = (await days.nth(dayIndex).getAttribute('data-day')) ?? '';
    await days.nth(dayIndex).click();
    await expect(page.locator('[data-slot-grid] label').first()).toBeVisible();
    const slotIndex = randomIndex(await page.locator('[data-slot-grid] label').count());
    const slotValue = await page.locator('[data-slot-grid] label').nth(slotIndex).locator('input').inputValue();
    await page.locator('[data-slot-grid] label').nth(slotIndex).click();
    await expect(other.locator(`[data-day="${dayValue}"]:not([disabled])`)).toBeVisible();
    await other.locator(`[data-day="${dayValue}"]`).click();
    await other.locator(`[data-slot-grid] input[value="${slotValue}"]`).locator('xpath=..').click();
    await fillCustomer(page);
    await fillCustomer(other);

    await submit(page);
    await expect(page).toHaveURL(/\/reservas\/simulador\//);
    await submit(other);

    await expect(other.locator('#reserva-slot-error')).toHaveText('Ese horario se acaba de ocupar, elegí otro.');
    await expect(other.locator(`[data-slot-grid] input[value="${slotValue}"]`)).toHaveCount(0);
    await second.close();
  });

  test('falls back to a proposed date when the agenda cannot be loaded and validates the date', async ({ page }) => {
    await page.route('**/api/bookings/slots*', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"calendar_unavailable"}' }));
    await openForm(page);
    await chooseSession(page, 'maternidad');

    await expect(page.locator('[data-request-notice]')).toContainText('No pude cargar la agenda');
    await expect(page.locator('[data-request-notice]')).toBeVisible();
    await expect(page.locator('[data-panel="request"]')).toBeVisible();
    await page.locator('#reserva-fecha').fill(dateInDays(1));
    await fillCustomer(page);
    await submit(page);

    await expect(page.locator('#reserva-fecha-error')).toHaveText('Elegí una fecha a partir de pasado mañana.');
    await expect(page.locator('#reserva-fecha')).toBeFocused();
  });
});

test.describe('booking validation', () => {
  test('shows a message under every empty field and focuses the first one', async ({ page }) => {
    await openForm(page);

    await submit(page);

    await expect(page.locator('#reserva-sesion-error')).toHaveText('Elegí una sesión.');
    await expect(page.locator('#reserva-nombre-error')).toHaveText('Contame cómo te llamás.');
    await expect(page.locator('#reserva-email-error')).toHaveText('Revisá el email.');
    await expect(page.locator('#reserva-telefono-error')).toHaveText('Dejame un teléfono o WhatsApp para coordinar.');
    await expect(page.locator('#reserva-acepto-error')).toHaveText('Necesito que aceptes las condiciones de la reserva.');
    await expect(page.locator('[data-form-status]')).toContainText('Revisá los campos marcados');
    await expect(page.locator('[data-field="sesion"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('input[name="sesion"]:not(:disabled)').first()).toBeFocused();
  });

  test('asks for a turn when none is chosen', async ({ page }) => {
    await openForm(page);
    await chooseSession(page, 'maternidad');
    await advanceToFreeWindow(page);
    await fillCustomer(page);

    await submit(page);

    await expect(page.locator('#reserva-slot-error')).toHaveText('Elegí un horario.');
  });

  test('reports the missing turn in the first round together with the other errors', async ({ page }) => {
    await openForm(page);
    await chooseSession(page, 'maternidad');
    await advanceToFreeWindow(page);

    await submit(page);

    await expect(page.locator('#reserva-slot-error')).toHaveText('Elegí un horario.');
    await expect(page.locator('#reserva-nombre-error')).toHaveText('Contame cómo te llamás.');
    await expect(page.locator('#reserva-slot-error')).not.toContainText('ocupar');
  });

  test('asks for a date, never says the turn was taken, when the agenda failed and no date is proposed', async ({ page }) => {
    await page.route('**/api/bookings/slots*', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"calendar_unavailable"}' }));
    await openForm(page);
    await chooseSession(page, 'maternidad');
    await expect(page.locator('[data-request-notice]')).toBeVisible();
    await fillCustomer(page);

    await submit(page);

    await expect(page.locator('#reserva-fecha-error')).toBeVisible();
    await expect(page.locator('#reserva-fecha-error')).not.toContainText('ocupar');
    await expect(page.locator('#reserva-fecha')).toBeFocused();
  });

  test('clears an error as soon as the client fixes the field', async ({ page }) => {
    await openForm(page);
    await submit(page);
    await expect(page.locator('#reserva-sesion-error')).toBeVisible();

    await chooseSession(page, 'maternidad');
    await page.locator('#reserva-nombre').fill('Camila Ríos');

    await expect(page.locator('#reserva-sesion-error')).toBeHidden();
    await expect(page.locator('[data-field="sesion"]')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#reserva-nombre-error')).toBeHidden();
    await expect(page.locator('[data-form-status]')).toBeVisible();
  });
});

test.describe('booking day strip', () => {
  test('shows every day of the window in a grid without horizontal scroll, with its month range', async ({ page }) => {
    await openForm(page);
    await chooseSession(page, 'maternidad');
    await settled(page);

    const days = page.locator('[data-day]');
    await expect(days).toHaveCount(14);
    const inside = await days.evaluateAll((buttons) =>
      buttons.every((button) => {
        const box = button.getBoundingClientRect();
        return box.left >= 0 && box.right <= window.innerWidth && box.width > 0;
      }),
    );
    expect(inside).toBe(true);
    const strip = await page.locator('[data-slot-days]').evaluate((element) => element.scrollWidth <= element.clientWidth);
    expect(strip).toBe(true);
    await expect(page.locator('[data-days-caption]')).toHaveText(/\d{1,2}.*\d{4}/);
  });

  test('names every day with its visible text and passes the label-in-name rule', async ({ page }) => {
    await openForm(page);
    await chooseSession(page, 'maternidad');
    await settled(page);

    const results = await new AxeBuilder({ page }).options({ runOnly: ['label-content-name-mismatch'] }).analyze();
    expect(results.violations).toEqual([]);
    const first = page.locator('[data-day]').first();
    await expect(first).toHaveAccessibleName(/^\S+ \d{1,2} de \S+$/);
  });

  test('stops the next-days arrow at the horizon and tells so', async ({ page }) => {
    await openForm(page);
    await chooseSession(page, 'maternidad');
    const next = page.locator('[data-days-next]');
    for (let step = 0; step < 8 && (await next.isEnabled()); step += 1) {
      await settled(page);
      await next.click();
    }
    await settled(page);

    await expect(next).toBeDisabled();
    await expect(page.locator('[data-slot-status]')).not.toContainText('Probá más adelante');
  });
});

test.describe('booking without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('proposes a date, pays in the simulator and lands on the confirmation', async ({ page }) => {
    await page.goto('/es/reservas');
    await expect(page.locator('.no-js-note')).toBeVisible();
    await page.locator('label[for="reserva-sesion-maternidad"]').click();
    await page.locator('#reserva-fecha').fill(dateInDays(10));
    await page.locator('label.pill', { hasText: 'Tarde' }).click();
    await page.locator('#reserva-nombre').fill(customer.nombre);
    await page.locator('#reserva-email').fill(customer.email);
    await page.locator('#reserva-telefono').fill(customer.telefono);
    await page.locator('label.accept-label').click();

    await page.locator('[data-booking-form] button[type="submit"]').click();

    await expect(page).toHaveURL(/\/reservas\/simulador\/sim_\d+/);
    await page.getByRole('button', { name: 'Aprobar pago' }).click();

    await expect(page.locator('h1')).toHaveText('¡Tu lugar está reservado!');
    await expect(page.locator('.t-lead')).toContainText('Te escribo dentro de las próximas 48 horas');
    await expect(page.locator('.summary')).toContainText('Tarde');
  });

  test('explains which fields to fix when the server rejects the booking', async ({ page, request }) => {
    const response = await request.post('/reservas/iniciar', {
      headers: { 'x-forwarded-for': uniqueAddress() },
      form: { sesion: 'maternidad', nombre: 'C', email: 'roto', telefono: '1' },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(303);
    const location = response.headers()['location'] ?? '';
    expect(location).toMatch(/^\/reservas\/error\?campos=.*nombre.*email.*telefono.*acepto/);

    await page.goto(location);
    await expect(page.locator('h1')).toHaveText('No se pudo reservar');
    await expect(page.locator('.result-problems li')).toHaveCount(5);
  });

  test('explains a date that is too close', async ({ page, request }) => {
    const response = await request.post('/reservas/iniciar', {
      headers: { 'x-forwarded-for': uniqueAddress() },
      form: { sesion: 'maternidad', fecha: dateInDays(1), nombre: customer.nombre, email: customer.email, telefono: customer.telefono, acepto: 'on' },
      maxRedirects: 0,
    });

    expect(response.headers()['location']).toBe('/reservas/error?motivo=fecha');
    await page.goto('/reservas/error?motivo=fecha');
    await expect(page.locator('.t-lead')).toHaveText('Elegí una fecha a partir de pasado mañana.');
  });
});

test.describe('booking rate limit', () => {
  test('sends a visitor who books too many times to the limit page', async ({ request }) => {
    const headers = { 'x-forwarded-for': uniqueAddress() };
    const send = () => request.post('/reservas/iniciar', { headers, form: { sesion: 'maternidad' }, maxRedirects: 0 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await send()).status()).toBe(303);
    }
    const blocked = await send();

    expect(blocked.status()).toBe(303);
    expect(blocked.headers()['location']).toBe('/reservas/error?motivo=limite');
  });

  test('also limits the booking action called through a query string on any page', async ({ request }) => {
    const headers = { 'x-forwarded-for': uniqueAddress() };
    const send = () => request.post('/reservas/error?_action=booking', { headers, form: { sesion: 'maternidad' }, maxRedirects: 0 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await send()).headers()['location']).not.toBe('/reservas/error?motivo=limite');
    }
    const blocked = await send();

    expect(blocked.status()).toBe(303);
    expect(blocked.headers()['location']).toBe('/reservas/error?motivo=limite');
  });

  test('tells the visitor to wait when the connection already sent too many bookings', async ({ page, request }) => {
    const headers = { 'x-forwarded-for': uniqueAddress() };
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request.post('/reservas/iniciar', { headers, form: { sesion: 'maternidad' }, maxRedirects: 0 });
    }
    await page.setExtraHTTPHeaders(headers);
    await openForm(page);

    await submit(page);

    await expect(page.locator('[data-form-status]')).toHaveText('Recibimos muchas reservas desde tu conexión. Probá de nuevo en unos minutos.');
  });
});

test.describe('payment endpoints', () => {
  test('rejects a notification for an unknown provider', async ({ request }) => {
    const response = await request.post('/api/payments/webhook/desconocido', { data: {} });

    expect(response.status()).toBe(404);
  });

  test('rejects a simulated notification for a payment that does not exist', async ({ request }) => {
    const response = await request.post('/api/payments/webhook/simulado', { data: { paymentId: 'inexistente' } });

    expect(response.status()).toBe(401);
  });

  test('rejects a body that is too large', async ({ request }) => {
    const response = await request.post('/api/payments/webhook/simulado', { data: { paymentId: 'x'.repeat(70_000) } });

    expect(response.status()).toBe(413);
  });

  test('lists turns for a session and refuses an invalid range', async ({ request }) => {
    const from = dateInDays(3);
    const ok = await request.get(`/api/bookings/slots?session=maternidad&from=${from}&to=${dateInDays(16)}`);
    const invalid = await request.get(`/api/bookings/slots?session=maternidad&from=${from}&to=${dateInDays(60)}`);
    const unknown = await request.get(`/api/bookings/slots?session=nada&from=${from}&to=${dateInDays(5)}`);

    expect(ok.status()).toBe(200);
    expect(ok.headers()['cache-control']).toBe('no-store');
    expect((await ok.json()).mode).toBe('slots');
    expect(invalid.status()).toBe(400);
    expect(unknown.status()).toBe(404);
  });
});

test.describe('booking result', () => {
  test('answers 404 for an id that does not exist or is not a uuid', async ({ request }) => {
    expect((await request.get('/reservas/00000000-0000-4000-8000-000000000000')).status()).toBe(404);
    expect((await request.get('/reservas/no-es-un-uuid')).status()).toBe(404);
  });

  test('answers 404 for a simulator checkout that does not exist', async ({ request }) => {
    expect((await request.get('/reservas/simulador/sim_9999')).status()).toBe(404);
  });
});
