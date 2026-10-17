import type { Result } from './Result';

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
