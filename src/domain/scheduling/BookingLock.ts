export interface BookingLock {
  runExclusive<T>(task: () => Promise<T>): Promise<T>;
}
