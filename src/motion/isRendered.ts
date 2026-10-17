export const isRendered = (element: Element): boolean => element.getClientRects().length > 0;
