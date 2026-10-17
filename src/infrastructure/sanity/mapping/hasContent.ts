export const hasContent = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasContent);
  if (typeof value === 'object' && value !== null) {
    const { children, text, current } = value as { children?: unknown; text?: unknown; current?: unknown };
    return hasContent(children) || hasContent(text) || hasContent(current);
  }
  return false;
};
