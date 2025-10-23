export const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** randomized human-like delay */
export const humanDelay = async (minMs = 800, maxMs = 2200) => {
  const jitter = Math.floor(minMs + Math.random() * (maxMs - minMs));
  await delay(jitter);
};
