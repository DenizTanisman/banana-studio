/** Cloud routes forward validated HTTPS references. The native build replaces
 * this module with a local-file reader so providers never receive loopback URLs. */
export const isReferenceUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
};
export const isSecureReferenceUrl = (url: URL): boolean => url.protocol === 'https:';
export const providerImageUrl = async (_db: unknown, value: string): Promise<string> => value;
