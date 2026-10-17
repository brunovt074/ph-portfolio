export const preselectBookingForm = (form: HTMLFormElement): boolean => {
  const slug = new URLSearchParams(location.search).get('sesion');
  if (!slug) {
    return false;
  }
  const input = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="sesion"]')).find((candidate) => candidate.value === slug);
  if (!input || input.disabled) {
    return false;
  }
  input.checked = true;
  return true;
};
