import { expect, test } from '@playwright/test';
import { defaultSiteTexts } from '../../src/infrastructure/texts/defaults/defaultSiteTexts';

const validInquiry = {
  nombre: 'Sofía Paredes',
  email: 'sofia@marca.com',
  mensaje: 'Necesito fotos de producto para el lanzamiento de mi tienda online.',
};

const uniqueAddress = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

test.beforeEach(async ({ page }) => {
  const address = uniqueAddress();
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': address });
});

test.describe('contact form with JavaScript', () => {
  test('shows a message under every required field that is empty', async ({ page }) => {
    await page.goto('/es/#contacto');
    await page.locator('#contacto-nombre').waitFor();
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');

    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page.locator('#contacto-nombre-error')).toContainText('Escribí tu nombre');
    await expect(page.locator('#contacto-email-error')).toContainText('email válido');
    await expect(page.locator('#contacto-mensaje-error')).toContainText('entre 10 y 2000');
    await expect(page.locator('#contacto-nombre')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contacto-nombre')).toBeFocused();
    await expect(page.locator('#contacto [data-form-status]')).toContainText('Revisá los campos marcados');
  });

  test('flags an invalid email without losing what was typed', async ({ page }) => {
    await page.goto('/es/#contacto');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#contacto-nombre').fill(validInquiry.nombre);
    await page.locator('#contacto-email').fill('no-es-un-email');
    await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);

    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page.locator('#contacto-email-error')).toContainText('email válido');
    await expect(page.locator('#contacto-email')).toHaveAttribute('aria-describedby', 'contacto-email-error');
    await expect(page.locator('#contacto-nombre')).toHaveValue(validInquiry.nombre);
  });

  test('confirms a valid inquiry inline and clears the form', async ({ page }) => {
    await page.goto('/es/#contacto');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#contacto-nombre').fill(validInquiry.nombre);
    await page.locator('#contacto-email').fill(validInquiry.email);
    await page.locator('#contacto-tipo').selectOption({ index: 1 });
    await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);

    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page.locator('#contacto [data-form-status]')).toHaveText('¡Gracias! Te respondo dentro de las próximas 48 horas.');
    await expect(page.locator('#contacto-nombre')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Enviar consulta' })).toBeEnabled();
  });

  test('pretends success to a bot that fills the hidden field', async ({ page }) => {
    await page.goto('/es/#contacto');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#contacto-nombre').fill(validInquiry.nombre);
    await page.locator('#contacto-email').fill(validInquiry.email);
    await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);
    await page.locator('#contacto-sitio-web').evaluate((input: HTMLInputElement) => {
      input.value = 'http://spam.example';
    });

    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page.locator('#contacto [data-form-status]')).toContainText('¡Gracias!');
  });

  test('keeps the honeypot out of the tab order and away from screen readers', async ({ page }) => {
    await page.goto('/es/');

    const trap = page.locator('.trap input[name="sitio_web"]');

    await expect(trap).toHaveAttribute('tabindex', '-1');
    await expect(trap).toHaveAttribute('autocomplete', 'off');
    await expect(page.locator('.trap')).toHaveAttribute('aria-hidden', 'true');
  });

  test('preselects the work type coming from a page about brands', async ({ page }) => {
    await page.goto('/es/?tipo=marcas#contacto');

    await expect(page.locator('#contacto-tipo')).toHaveValue('Marca / producto');
  });

  test('preselects the work type when arriving from another page', async ({ page }) => {
    await page.goto('/es/marcas');
    await page.locator('a[href="/es/?tipo=marcas#contacto"]:visible').first().click();

    await expect(page).toHaveURL(/tipo=marcas/);
    await expect(page.locator('#contacto-tipo')).toHaveValue('Marca / producto');
  });
});

test.describe('print inquiry in Obra', () => {
  test('lets a collector ask about a print without leaving Obra', async ({ page }) => {
    await page.goto('/es/obra/copias');
    const firstCard = page.locator('.print-card').first();
    const title = (await firstCard.locator('h2').innerText()).trim();

    await firstCard.getByRole('link').click();

    await expect(page).toHaveURL(/\/es\/obra\/copias\/?\?copia=.*#consulta/);
    await expect(page.locator('#consulta-copia')).toHaveValue(title);
    await expect(page.locator('#consulta-mensaje')).toHaveValue(`Hola, me interesa la copia "${title}".`);
    await expect(page.locator('#consulta select[name="tipo"]')).toHaveCount(0);
    await expect(page.locator('#consulta input[name="tipo"]')).toHaveValue('Copia de autor');
  });

  test('sends the print inquiry and confirms it', async ({ page }) => {
    await page.goto('/es/obra/copias?copia=Sin%20t%C3%ADtulo#consulta');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('#consulta [data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#consulta-nombre').fill(validInquiry.nombre);
    await page.locator('#consulta-email').fill(validInquiry.email);
    await page.locator('#consulta-copia').selectOption({ index: 1 });
    await page.locator('#consulta-mensaje').fill('Quisiera saber si queda disponible el tamaño más grande.');

    await page.getByRole('button', { name: 'Consultar esta copia' }).click();

    await expect(page.locator('#consulta [data-form-status]')).toContainText('¡Gracias!');
  });

  test('asks to pick a print when none is chosen', async ({ page }) => {
    await page.goto('/es/obra/copias#consulta');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('#consulta [data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#consulta-nombre').fill(validInquiry.nombre);
    await page.locator('#consulta-email').fill(validInquiry.email);
    await page.locator('#consulta-mensaje').fill(validInquiry.mensaje);

    await page.getByRole('button', { name: 'Consultar esta copia' }).click();

    await expect(page.locator('#consulta-copia-error')).toContainText('Elegí una copia');
  });
});

test.describe('contact form without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('sends the inquiry and lands on the thank-you page', async ({ page }) => {
    await page.goto('/es/');
    await page.locator('#contacto-nombre').fill(validInquiry.nombre);
    await page.locator('#contacto-email').fill(validInquiry.email);
    await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);

    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page).toHaveURL(/\/es\/contacto\/enviado$/);
    await expect(page.locator('h1')).toHaveText('¡Gracias por escribir!');
  });

  test('explains which fields to fix when the server rejects the inquiry', async ({ page, request }) => {
    const response = await request.post('/contacto/enviar', {
      headers: { 'x-forwarded-for': uniqueAddress() },
      form: { nombre: 'S', email: 'roto', mensaje: 'corto' },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(303);
    const location = response.headers().location ?? '';
    expect(location).toBe('/es/contacto/error?campos=nombre,email,mensaje');

    await page.goto(location);
    await expect(page.locator('h1')).toHaveText('No se pudo enviar');
    await expect(page.locator('.result-problems li')).toHaveCount(3);
  });

  test('sends a visitor who writes too many times to the limit page', async ({ page, request }) => {
    const headers = { 'x-forwarded-for': uniqueAddress() };
    const send = () => request.post('/contacto/enviar', { headers, form: { nombre: 'S', email: 'roto', mensaje: 'corto' }, maxRedirects: 0 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await send()).status()).toBe(303);
    }
    const blocked = await send();

    expect(blocked.status()).toBe(303);
    expect(blocked.headers().location).toBe('/es/contacto/error?motivo=limite');

    await page.setExtraHTTPHeaders(headers);
    await page.goto('/es/contacto/error?motivo=limite');
    await expect(page.locator('.t-lead')).toHaveText('Recibimos muchas consultas desde tu conexión. Probá de nuevo en unos minutos.');
  });
});

test.describe('contact action called through a query string', () => {
  test('is limited on any page like the contact form', async ({ request }) => {
    const headers = { 'x-forwarded-for': uniqueAddress() };
    const send = () => request.post('/es/contacto/error?_action=contact', { headers, form: { nombre: 'S', email: 'roto', mensaje: 'corto' }, maxRedirects: 0 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect((await send()).headers().location).not.toBe('/es/contacto/error?motivo=limite');
    }
    const blocked = await send();

    expect(blocked.status()).toBe(303);
    expect(blocked.headers().location).toBe('/es/contacto/error?motivo=limite');
  });
});

test.describe('contact form rate limit with JavaScript', () => {
  test('tells the visitor to wait when the connection already sent too many inquiries', async ({ page, request }) => {
    const headers = { 'x-forwarded-for': uniqueAddress() };
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request.post('/contacto/enviar', { headers, form: { nombre: 'S', email: 'roto', mensaje: 'corto' }, maxRedirects: 0 });
    }
    await page.setExtraHTTPHeaders(headers);
    await page.goto('/es/#contacto');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#contacto-nombre').fill(validInquiry.nombre);
    await page.locator('#contacto-email').fill(validInquiry.email);
    await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);

    await page.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(page.locator('#contacto [data-form-status]')).toHaveText('Recibimos muchas consultas desde tu conexión. Probá de nuevo en unos minutos.');
  });
});

test.describe.skip('contact form in English and Portuguese', () => {
  test('English visitor sees validation errors in English', async ({ page }) => {
    await page.goto('/en/#contacto');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#contacto-nombre').fill('S');
    await page.locator('#contacto-email').fill(validInquiry.email);
    await page.locator('#contacto-mensaje').fill('short');

    await page.getByRole('button', { name: defaultSiteTexts.en.contact.submit }).click();

    await expect(page.locator('[data-error-for="nombre"]')).toHaveText(defaultSiteTexts.en.contact.errorNombre);
    await expect(page.locator('[data-error-for="mensaje"]')).toHaveText(defaultSiteTexts.en.contact.errorMensaje);
    await expect(page.locator('#contacto [data-form-status]')).toHaveText(defaultSiteTexts.en.contact.fieldErrors);
  });

  test('Portuguese visitor confirms an inquiry in Portuguese', async ({ page }) => {
    await page.goto('/pt/#contacto');
    await page.waitForFunction(() => document.querySelector<HTMLFormElement>('[data-contact-form]')?.dataset.ready === 'true');
    await page.locator('#contacto-nombre').fill(validInquiry.nombre);
    await page.locator('#contacto-email').fill(validInquiry.email);
    await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);

    await page.getByRole('button', { name: defaultSiteTexts.pt.contact.submit }).click();

    await expect(page.locator('#contacto [data-form-status]')).toHaveText(defaultSiteTexts.pt.contact.success);
  });

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('Portuguese visitor lands on the Portuguese result page', async ({ page }) => {
      await page.goto('/pt/');
      await page.locator('#contacto-nombre').fill(validInquiry.nombre);
      await page.locator('#contacto-email').fill(validInquiry.email);
      await page.locator('#contacto-mensaje').fill(validInquiry.mensaje);

      await page.getByRole('button', { name: defaultSiteTexts.pt.contact.submit }).click();

      await expect(page).toHaveURL(/\/pt\/contacto\/enviado$/);
      await expect(page.locator('h1')).toHaveText(defaultSiteTexts.pt.contact.sentTitle);
      await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    });

    test('rate limited English visitor sees the English message', async ({ page, request }) => {
      const headers = { 'x-forwarded-for': uniqueAddress(), referer: 'http://localhost:4321/en/' };
      const send = () => request.post('/contacto/enviar', { headers, form: { nombre: 'S', email: 'roto', mensaje: 'corto', idioma: 'en' }, maxRedirects: 0 });
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await send();
      }
      const blocked = await send();

      expect(blocked.headers().location).toBe('/en/contacto/error?motivo=limite');

      await page.goto('/en/contacto/error?motivo=limite');
      await expect(page.locator('.t-lead')).toHaveText(defaultSiteTexts.en.contact.rateLimited);
    });
  });
});
