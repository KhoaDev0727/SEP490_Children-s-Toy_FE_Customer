export const MAX_CHILDREN_PER_USER = 4;
export const MAX_CHILD_PROFILE_EDITS = 2;
export const MAX_CHILD_AGE_YEARS = 25;
export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 100;
export const NICK_NAME_MAX_LENGTH = 50;

export const ALLOWED_SEX_IDS = [1, 2, 3] as const;
export type AllowedSexId = (typeof ALLOWED_SEX_IDS)[number];

export const ALLOWED_SEX_OPTIONS = [
  { id: 1 as AllowedSexId, label: "Male", icon: "👦" },
  { id: 2 as AllowedSexId, label: "Female", icon: "👧" },
  { id: 3 as AllowedSexId, label: "Other", icon: "🧒" },
] as const;

export function getSexLabel(sexId?: number | null): string {
  return ALLOWED_SEX_OPTIONS.find((option) => option.id === sexId)?.label ?? "Other";
}

export function calculateAge(dobDate: Date, today: Date = new Date()): number {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const birthDate = new Date(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate());
  let age = todayDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = todayDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function getChildDobBounds(today: Date = new Date()) {
  const maxDob = today.toISOString().split("T")[0];
  const minDate = new Date(today.getFullYear() - MAX_CHILD_AGE_YEARS, today.getMonth(), today.getDate());
  const minDob = minDate.toISOString().split("T")[0];
  return { minDob, maxDob };
}
