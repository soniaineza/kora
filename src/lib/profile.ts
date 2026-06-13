export const DEFAULT_AVATAR_SVG =
  'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=User';
export type UserProfile = {
  name: string;
  avatarUrl: string;
};
export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem('kora-profile');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed?.name || !parsed?.avatarUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}
export function storeProfile(profile: UserProfile) {
  localStorage.setItem('kora-profile', JSON.stringify(profile));
}
export function getAvatarForSeed(seed: string) {
  const safeSeed = String(seed || 'User').trim() || 'User';
  return `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(safeSeed)}`;
}