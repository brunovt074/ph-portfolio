export interface BookingDemoData {
  prices: Readonly<Record<string, number>>;
  durations: Readonly<Record<string, number>>;
  windows: ReadonlyArray<{ weekday: number; from: string; to: string }>;
}
