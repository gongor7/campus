/** Enfriamiento entre intentos calificados (RF-24). Por defecto 10 minutos. */
export const DEFAULT_COOLDOWN_MINUTES = 10;

export function cooldownRemainingMs(lastGradedSubmittedAt: Date, now: Date, minutes = DEFAULT_COOLDOWN_MINUTES): number {
  const elapsed = now.getTime() - lastGradedSubmittedAt.getTime();
  const remaining = minutes * 60 * 1000 - elapsed;
  return remaining > 0 ? remaining : 0;
}
