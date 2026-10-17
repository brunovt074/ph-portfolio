import type { Result } from './Result';

export const fail = <E>(error: E): Result<never, E> => ({ ok: false, error });
