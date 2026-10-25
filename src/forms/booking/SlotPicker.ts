import type { AvailableSlots } from '@/application/results/AvailableSlots';
import type { SlotView } from '@/application/results/SlotView';
import { addDays, todayIn } from './dayMath';
import type { SlotPickerOptions } from './SlotPickerOptions';

const WINDOW_DAYS = 14;

export class SlotPicker {
  private offerSlug = '';
  private windowStart = '';
  private selectedDay = '';
  private slotsByDay = new Map<string, SlotView[]>();
  private requestToken = 0;

  private readonly days: HTMLElement;
  private readonly grid: HTMLElement;
  private readonly status: HTMLElement;
  private readonly caption: HTMLElement;
  private readonly previous: HTMLButtonElement;
  private readonly next: HTMLButtonElement;
  private readonly dayTemplate: HTMLTemplateElement;
  private readonly slotTemplate: HTMLTemplateElement;

  constructor(
    private readonly panel: HTMLElement,
    private readonly options: SlotPickerOptions,
  ) {
    this.days = this.part('[data-slot-days]');
    this.grid = this.part('[data-slot-grid]');
    this.status = this.part('[data-slot-status]');
    this.caption = this.part('[data-days-caption]');
    this.previous = this.part('[data-days-previous]');
    this.next = this.part('[data-days-next]');
    this.dayTemplate = this.part('[data-day-template]');
    this.slotTemplate = this.part('[data-slot-template]');
    this.previous.addEventListener('click', () => this.move(-WINDOW_DAYS));
    this.next.addEventListener('click', () => this.move(WINDOW_DAYS));
    this.days.addEventListener('click', (event) => this.pickDay(event));
  }

  start(offerSlug: string): void {
    this.offerSlug = offerSlug;
    this.windowStart = todayIn(this.options.timeZone);
    void this.load();
  }

  reload(): void {
    void this.load();
  }

  currentOffer(): string {
    return this.offerSlug;
  }

  private part<T extends HTMLElement>(selector: string): T {
    const element = this.panel.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Missing ${selector}`);
    }
    return element;
  }

  private move(delta: number): void {
    const today = todayIn(this.options.timeZone);
    const target = addDays(this.windowStart, delta);
    this.windowStart = target < today ? today : target;
    void this.load();
  }

  private async load(): Promise<void> {
    const token = ++this.requestToken;
    const from = this.windowStart;
    this.panel.setAttribute('aria-busy', 'true');
    this.status.textContent = this.options.texts.slotsLoading;
    this.slotsByDay = new Map();
    this.selectedDay = '';
    this.renderDays(from);
    this.renderSlots();
    this.updateArrows();
    try {
      const query = new URLSearchParams({ session: this.offerSlug, from, to: addDays(from, WINDOW_DAYS - 1) });
      const response = await fetch(`${this.options.endpoint}?${query.toString()}`, { headers: { Accept: 'application/json' } });
      if (token !== this.requestToken) {
        return;
      }
      if (!response.ok) {
        throw new Error(`Slots responded ${response.status}`);
      }
      const body = (await response.json()) as AvailableSlots;
      if (token !== this.requestToken) {
        return;
      }
      if (body.mode === 'request') {
        this.options.onFallback('');
        return;
      }
      const freeDays = body.days
        .map((day) => ({ date: day.date, slots: day.slots.filter((slot) => !this.options.isTaken(slot.start)) }))
        .filter((day) => day.slots.length > 0);
      this.slotsByDay = new Map(freeDays.map((day) => [day.date, day.slots]));
      this.show(from);
    } catch {
      if (token === this.requestToken) {
        this.options.onFallback(this.options.texts.slotsError);
      }
    } finally {
      if (token === this.requestToken) {
        this.panel.removeAttribute('aria-busy');
      }
    }
  }

  private show(from: string): void {
    const firstFree = Array.from({ length: WINDOW_DAYS }, (_, index) => addDays(from, index)).find((date) => this.slotsByDay.has(date));
    const emptyText = this.beyondHorizon() ? this.options.texts.slotsBeyondHorizon : this.options.texts.slotsEmpty;
    this.status.textContent = firstFree ? '' : emptyText;
    this.selectedDay = firstFree ?? '';
    this.renderDays(from);
    this.renderSlots();
  }

  private renderDays(from: string): void {
    const labelFormat = new Intl.DateTimeFormat(this.options.localeTag, { weekday: 'short', timeZone: 'UTC' });
    const monthFormat = new Intl.DateTimeFormat(this.options.localeTag, { day: 'numeric', month: 'long', timeZone: 'UTC' });
    const rangeFormat = new Intl.DateTimeFormat(this.options.localeTag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    this.caption.textContent = rangeFormat.formatRange(new Date(`${from}T12:00:00Z`), new Date(`${addDays(from, WINDOW_DAYS - 1)}T12:00:00Z`));
    this.days.replaceChildren(
      ...Array.from({ length: WINDOW_DAYS }, (_, index) => {
        const date = addDays(from, index);
        const instant = new Date(`${date}T12:00:00Z`);
        const fragment = this.dayTemplate.content.cloneNode(true) as DocumentFragment;
        const button = fragment.querySelector<HTMLButtonElement>('[data-day]');
        const weekday = fragment.querySelector<HTMLElement>('[data-weekday]');
        const number = fragment.querySelector<HTMLElement>('[data-number]');
        const before = fragment.querySelector<HTMLElement>('[data-month-before]');
        const after = fragment.querySelector<HTMLElement>('[data-month-after]');
        if (!button || !weekday || !number || !before || !after) {
          return fragment;
        }
        const parts = monthFormat.formatToParts(instant);
        const dayIndex = parts.findIndex((part) => part.type === 'day');
        button.dataset['day'] = date;
        button.disabled = !this.slotsByDay.has(date);
        button.setAttribute('aria-pressed', date === this.selectedDay ? 'true' : 'false');
        weekday.textContent = labelFormat.format(instant);
        number.textContent = String(Number(date.slice(8, 10)));
        before.textContent = parts.slice(0, dayIndex).map((part) => part.value).join('');
        after.textContent = parts.slice(dayIndex + 1).map((part) => part.value).join('');
        return fragment;
      }),
    );
  }

  private renderSlots(): void {
    const slots = this.slotsByDay.get(this.selectedDay) ?? [];
    this.grid.removeAttribute('aria-invalid');
    this.grid.replaceChildren(
      ...slots.map((slot) => {
        const fragment = this.slotTemplate.content.cloneNode(true) as DocumentFragment;
        const input = fragment.querySelector<HTMLInputElement>('input');
        const time = fragment.querySelector<HTMLElement>('[data-time]');
        if (input && time) {
          input.value = slot.start;
          time.textContent = slot.label;
        }
        return fragment;
      }),
    );
  }

  private pickDay(event: Event): void {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-day]');
    const date = button?.dataset['day'];
    if (!button || !date || button.disabled) {
      return;
    }
    this.selectedDay = date;
    this.days.querySelectorAll<HTMLButtonElement>('[data-day]').forEach((candidate) => {
      candidate.setAttribute('aria-pressed', candidate.dataset['day'] === date ? 'true' : 'false');
    });
    this.renderSlots();
  }

  private updateArrows(): void {
    this.previous.disabled = this.windowStart <= todayIn(this.options.timeZone);
    this.next.disabled = this.beyondHorizon();
  }

  private beyondHorizon(): boolean {
    const lastDay = addDays(todayIn(this.options.timeZone), this.options.horizonDays);
    return addDays(this.windowStart, WINDOW_DAYS) > lastDay;
  }
}
