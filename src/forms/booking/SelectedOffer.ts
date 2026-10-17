export interface SelectedOffer {
  slug: string;
  totalCents: number;
  depositCents: number;
  depositPercent: number;
  scheduling: 'slots' | 'request';
}
