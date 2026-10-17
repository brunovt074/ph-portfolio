import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';
import { deskStructure } from './sanity/structure/deskStructure';
import { singletonIds } from './sanity/structure/singletonIds';

const singletons: ReadonlySet<string> = new Set(singletonIds);

export default defineConfig({
  name: 'sarah-moreau',
  title: 'Sarah Moreau — Contenidos',
  basePath: '/admin',
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool({ structure: deskStructure }), ...(import.meta.env.DEV ? [visionTool()] : [])],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletons.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletons.has(schemaType)
        ? actions.filter(({ action }) => action === 'publish' || action === 'discardChanges' || action === 'restore')
        : actions,
  },
});
