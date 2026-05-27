import { getSession } from "./authLocal";

export function resolveOwnerEmail(explicit?: string | null): string | undefined {
  const fromParam = explicit?.trim().toLowerCase();
  if (fromParam) return fromParam;
  const fromLogin = getSession()?.email?.trim().toLowerCase();
  return fromLogin || undefined;
}

export function ownerEmailHeader(ownerEmail?: string | null): Record<string, string> {
  const email = resolveOwnerEmail(ownerEmail);
  return email ? { "X-Pia-User-Email": email } : {};
}
