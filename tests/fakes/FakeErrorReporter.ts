import type { ErrorReporter } from '@/domain/ErrorReporter';

export class FakeErrorReporter implements ErrorReporter {
  readonly reported: Error[] = [];

  report(error: Error): void {
    this.reported.push(error);
  }
}
