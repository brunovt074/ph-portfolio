export type ScheduleMode = 'choose' | 'request' | 'slots';

const modes: readonly ScheduleMode[] = ['choose', 'request', 'slots'];

export const applyScheduleMode = (form: HTMLFormElement, mode: ScheduleMode): void => {
  form.dataset['scheduleMode'] = mode;
  modes.forEach((name) => {
    const panel = form.querySelector<HTMLElement>(`[data-panel="${name}"]`);
    if (!panel) {
      return;
    }
    panel.hidden = name !== mode;
    panel.querySelectorAll<HTMLInputElement>('input[name]').forEach((field) => {
      field.disabled = name !== mode;
    });
  });
};
