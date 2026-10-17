import { preselectContactForm } from './preselectContactForm';
import { submitContactForm } from './submitContactForm';

export const initContactForms = (): void => {
  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach((form) => {
    if (form.dataset.ready === 'true') {
      return;
    }
    form.dataset.ready = 'true';
    form.noValidate = true;
    preselectContactForm(form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void submitContactForm(form);
    });
  });
};
