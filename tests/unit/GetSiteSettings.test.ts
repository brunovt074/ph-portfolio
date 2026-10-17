import { describe, expect, it } from 'vitest';
import { GetSiteSettings } from '@/application/GetSiteSettings';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

describe('GetSiteSettings', () => {
  it('returns the contact data every footer needs', async () => {
    const settings = await new GetSiteSettings(new FakeContentRepository()).execute('es');

    expect(settings.instagram).toEqual(['@laravischi.fotografia']);
    expect(settings.portrait.id).toBe('retrato-lara');
  });
});
