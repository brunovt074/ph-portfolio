export const toError = (thrown: unknown): Error => (thrown instanceof Error ? thrown : new Error(String(thrown)));
