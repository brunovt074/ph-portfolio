import type { Hotspot } from './Hotspot';

export interface PhotoAsset { provider: 'local' | 'sanity'; ref: string; hotspot?: Hotspot }
