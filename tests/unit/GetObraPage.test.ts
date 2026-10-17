import { describe, expect, it } from 'vitest';
import { GetObraPage } from '@/application/GetObraPage';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

describe('GetObraPage', () => {
  it('shows the manifesto and the four series in order', async () => {
    const page = await new GetObraPage(new FakeContentRepository()).execute();

    expect(page.obra.quote).toBe('Una bitácora de mi trabajo.');
    expect(page.series.map((item) => item.number)).toEqual(['I', 'II', 'III', 'IV']);
    expect(page.settings.quote).toContain('registro');
  });
});
