export interface IncomingNotification {
  headers: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
}
