import { describe, expect, it } from 'vitest';
import { GetPrintsPage } from '@/application/GetPrintsPage';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { aPrint } from '../fixtures/aPrint';

describe('GetPrintsPage', () => {
  it('shows only the prints that Sarah keeps active for sale', async () => {
    const repository = new FakeContentRepository({
      prints: [aPrint('copia-au01', 'oficios'), aPrint('copia-au03', 'geometrias', false)],
    });

    const page = await new GetPrintsPage(repository).execute();

    expect(page.prints.map((print) => print.id)).toEqual(['copia-au01']);
    expect(page.content.cta).toBe('Consultar esta copia');
    expect(page.settings.email).toBe('[EMAIL]');
  });
});
