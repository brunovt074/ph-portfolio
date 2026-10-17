export const resolveClientKey = (forwardedFor: string | null, clientAddress: string, trustProxy: boolean): string => {
  if (!trustProxy || forwardedFor === null) {
    return clientAddress;
  }
  const first = forwardedFor.split(',')[0]?.trim();
  return first ? first : clientAddress;
};
