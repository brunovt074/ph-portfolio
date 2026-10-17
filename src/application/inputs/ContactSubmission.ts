import type { ContactMessage } from '@/domain/ContactMessage';

export interface ContactSubmission extends ContactMessage {
  website: string;
}
