const ANON_KEY = 'busTalkAnonId';

const fallbackId = () => `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const getAnonymousId = (): string => {
  if (typeof window === 'undefined') return fallbackId();
  try {
    const existing = window.localStorage.getItem(ANON_KEY);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `anon_${crypto.randomUUID()}`
      : fallbackId();
    window.localStorage.setItem(ANON_KEY, id);
    return id;
  } catch (error) {
    console.error('Failed to access localStorage for anon id', error);
    return fallbackId();
  }
};
