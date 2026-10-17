export interface GoogleAccessTokenSource {
  getAccessToken(): Promise<{ token?: string | null }>;
}
