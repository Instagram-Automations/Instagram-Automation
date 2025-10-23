export function loadSettings() {
  const MOCK_MODE = String(process.env.MOCK_MODE || 'true').toLowerCase() === 'true';
  const HEADLESS = String(process.env.HEADLESS || 'true').toLowerCase() === 'true';
  const PROXY_URL = process.env.PROXY_URL || '';
  return { MOCK_MODE, HEADLESS, PROXY_URL };
}
