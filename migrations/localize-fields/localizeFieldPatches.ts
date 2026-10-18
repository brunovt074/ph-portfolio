import { isLocalized } from '../../src/infrastructure/sanity/mapping/isLocalized';
import { localizedFieldSpecs } from './localizedFieldSpecs';

export type PathSegment = string | { _key: string };

export interface FieldPatch {
  path: PathSegment[];
  value: { es: unknown };
}

type Fields = Record<string, unknown>;

const needsWrapping = (value: unknown): boolean => value !== undefined && value !== null && !isLocalized(value);

const patchesFor = (fields: Fields, names: readonly string[], base: PathSegment[]): FieldPatch[] =>
  names
    .filter((name) => needsWrapping(fields[name]))
    .map((name) => ({ path: [...base, name], value: { es: fields[name] } }));

export const localizeFieldPatches = (document: Fields & { _type: string }): FieldPatch[] => {
  const spec = localizedFieldSpecs[document._type];
  if (!spec) return [];
  const itemPatches = Object.entries(spec.arrays ?? {}).flatMap(([arrayName, names]) => {
    const items = document[arrayName];
    return Array.isArray(items)
      ? (items as (Fields & { _key: string })[]).flatMap((item) => patchesFor(item, names, [arrayName, { _key: item._key }]))
      : [];
  });
  return [...patchesFor(document, spec.fields, []), ...itemPatches];
};
