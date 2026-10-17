export const preselectContactForm = (form: HTMLFormElement): void => {
  const params = new URLSearchParams(location.search);
  const tipos: Record<string, string> = JSON.parse(form.dataset.tipos ?? '{}');
  const tipo = params.get('tipo');
  const copia = params.get('copia');
  const typeSelect = form.querySelector<HTMLSelectElement>('select[name="tipo"]');
  const copySelect = form.querySelector<HTMLSelectElement>('select[name="copia"]');
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="mensaje"]');
  if (tipo && typeSelect && tipos[tipo]) {
    typeSelect.value = tipos[tipo];
  }
  if (copia && copySelect) {
    copySelect.value = copia;
    if (copySelect.value === copia && message && !message.value) {
      message.value = `Hola, me interesa la copia "${copia}".`;
    }
  }
};
