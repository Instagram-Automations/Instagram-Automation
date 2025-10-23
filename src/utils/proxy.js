export function getLaunchArgs(proxyUrl) {
  if (!proxyUrl) return [];
  try {
    const url = new URL(proxyUrl);
    if (url.protocol.startsWith('http')) {
      return [`--proxy-server=${url.protocol}//${url.hostname}:${url.port || 80}`];
    }
    // SOCKS proxy
    if (url.protocol.startsWith('socks')) {
      return [`--proxy-server=${url.protocol}//${url.hostname}:${url.port || 1080}`];
    }
  } catch {
    // ignore invalid proxy
  }
  return [];
}
