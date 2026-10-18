import { at, defineMigration, set } from 'sanity/migrate';
import { localizeFieldPatches } from './localizeFieldPatches';
import { localizedFieldSpecs } from './localizedFieldSpecs';

export default defineMigration({
  title: 'Mover los textos existentes al español de los campos con idiomas',
  documentTypes: Object.keys(localizedFieldSpecs),
  migrate: {
    document: (document) => localizeFieldPatches(document).map(({ path, value }) => at(path, set(value))),
  },
});
