/**
 * Device / Visitor IDs excluded from FreshRoots Portal Visitor Analytics.
 * Internal team and admin devices that should never pollute live customer metrics.
 */
export const EXCLUDED_VISITOR_IDS = [
  'vis_1793293039223_176pi8t',
  'vis_1793330526977_lyo4z6x',
] as const;

export const EXCLUDED_VISITOR_SET = new Set<string>(EXCLUDED_VISITOR_IDS);

export const EXCLUDED_VISITOR_SQL = EXCLUDED_VISITOR_IDS.map((id) => `'${id}'`).join(', ');

export function isExcludedVisitor(visitorId?: string | null): boolean {
  if (!visitorId) return false;
  return EXCLUDED_VISITOR_SET.has(visitorId.trim());
}
