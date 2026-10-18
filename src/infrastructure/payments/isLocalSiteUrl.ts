const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

export const isLocalSiteUrl = (siteUrl: string): boolean => {
  try {
    return LOCAL_HOSTS.includes(new URL(siteUrl).hostname);
  } catch {
    return false;
  }
};
