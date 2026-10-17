export const localized = <T>(spanish: T) => ({ es: spanish });

export const localizedSlug = (current: string) => ({ es: { _type: 'slug', current } });
