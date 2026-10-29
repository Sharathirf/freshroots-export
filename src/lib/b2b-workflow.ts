import { query } from './db';
import {
  ActivityVisibility,
  StaffRole
} from '@/types';

export * from './b2b-constants';

// Server-side Activity Logger Helper (requires db query)
export async function logRfqActivity(params: {
  rfqId: string;
  orderId?: string | null;
  quotationRevision?: number;
  activityType: string;
  activityTitle: string;
  description?: string | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  comments?: string | null;
  reason?: string | null;
  communicationSource?: string | null;
  actingUser?: string;
  actorRole?: StaffRole;
  visibility?: ActivityVisibility;
  metadata?: Record<string, any>;
}) {
  const {
    rfqId,
    orderId = null,
    quotationRevision = 1,
    activityType,
    activityTitle,
    description = null,
    previousStatus = null,
    newStatus = null,
    comments = null,
    reason = null,
    communicationSource = null,
    actingUser = 'Admin / Commercial Desk',
    actorRole = 'sales',
    visibility = 'internal_note',
    metadata = {}
  } = params;

  // Insert into dedicated rfq_activities table
  const inserted = await query(
    `INSERT INTO rfq_activities (
      rfq_id, order_id, quotation_revision, activity_type, activity_title,
      description, previous_status, new_status, comments, reason,
      communication_source, acting_user, actor_role, visibility, metadata, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
    RETURNING *`,
    [
      rfqId,
      orderId,
      quotationRevision,
      activityType,
      activityTitle,
      description,
      previousStatus,
      newStatus,
      comments,
      reason,
      communicationSource,
      actingUser,
      actorRole,
      visibility,
      JSON.stringify(metadata)
    ]
  );

  // Also write to audit_logs for system-wide auditing
  await query(
    `INSERT INTO audit_logs (action, entity_type, entity_id, details)
     VALUES ($1, 'wholesale_quotations', $2, $3)`,
    [
      activityType.toUpperCase(),
      rfqId,
      JSON.stringify({
        title: activityTitle,
        acting_user: actingUser,
        role: actorRole,
        previous_status: previousStatus,
        new_status: newStatus,
        reason: reason,
        comments: comments,
        visibility: visibility
      })
    ]
  );

  return inserted[0];
}
