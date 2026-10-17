export const formatText = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, key: string) => (key in values ? String(values[key]) : placeholder));
