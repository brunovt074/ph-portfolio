export interface ResendEmailPayload {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

export interface ResendEmailClient {
  emails: {
    send(payload: ResendEmailPayload): Promise<{ error: { message: string } | null }>;
  };
}
