export interface ErrorReporter {
  report(error: Error): void;
}
