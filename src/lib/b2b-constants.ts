import { StaffRole } from '@/types';

// 1. Rejection Reason Categories
export const REJECTION_CATEGORIES = [
  'Price not commercially viable',
  'Product unavailable',
  'Quantity below minimum order',
  'Delivery location unsupported',
  'Freight or logistics constraints',
  'Quality or specification mismatch',
  'Buyer unresponsive',
  'Incomplete or invalid information',
  'Compliance concern',
  'Duplicate enquiry',
  'Other'
] as const;

export type RejectionCategory = typeof REJECTION_CATEGORIES[number];

// 2. Valid Status Transitions Map (State Machine)
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  // Stage A: RFQ Intake and Review
  submitted: ['under_review', 'needs_information', 'ready_to_quote', 'on_hold', 'rejected', 'cancelled'],
  new_rfq: ['under_review', 'needs_information', 'ready_to_quote', 'on_hold', 'rejected', 'cancelled'],
  under_review: ['needs_information', 'ready_to_quote', 'quotation_draft', 'on_hold', 'rejected', 'cancelled'],
  needs_information: ['under_review', 'ready_to_quote', 'quotation_draft', 'rejected', 'cancelled'],
  on_hold: ['under_review', 'ready_to_quote', 'rejected', 'cancelled'],
  ready_to_quote: ['quotation_draft', 'quote_issued', 'under_review', 'rejected', 'cancelled'],
  
  // Stage B: Quotation and Negotiation
  quotation_draft: ['pending_approval', 'quote_issued', 'ready_to_quote', 'rejected', 'cancelled'],
  pending_approval: ['quote_issued', 'quotation_draft', 'rejected', 'cancelled'],
  quote_issued: ['discussion_in_progress', 'revision_requested', 'accepted', 'expired', 'rejected'],
  discussion_in_progress: ['revision_requested', 'quote_issued', 'accepted', 'on_hold', 'rejected', 'expired'],
  revision_requested: ['revised_quotation_issued', 'quotation_draft', 'quote_issued', 'rejected'],
  revised_quotation_issued: ['discussion_in_progress', 'accepted', 'revision_requested', 'expired', 'rejected'],
  
  // Terminal / Accepted States
  accepted: ['under_review', 'cancelled'], // Can only be cancelled with explicit approval
  rejected: ['under_review'], // Reopening requires explicit manager permission & mandatory reason
  cancelled: ['under_review'], // Reopening requires explicit reason
  expired: ['under_review', 'ready_to_quote', 'quotation_draft'] // Re-quoting allowed
};

// 3. Validation for State Transitions (Pure Function)
export function validateStatusTransition(
  currentStatus: string,
  targetStatus: string,
  userRole: StaffRole = 'admin',
  reopenReason?: string
): { valid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from "${currentStatus.replace(/_/g, ' ')}" to "${targetStatus.replace(/_/g, ' ')}". Allowed transitions: ${allowed ? allowed.join(', ') : 'none'}`
    };
  }

  // Governance check for reopening rejected or cancelled records
  if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
    if (!reopenReason || !reopenReason.trim()) {
      return {
        valid: false,
        error: `Reopening a ${currentStatus} RFQ strictly requires a mandatory reason.`
      };
    }
    // Only management or admin can reopen
    if (!['management', 'admin', 'quotation_manager'].includes(userRole)) {
      return {
        valid: false,
        error: 'Only Management or Administrator roles are authorized to reopen a rejected or cancelled RFQ.'
      };
    }
  }

  return { valid: true };
}

// 4. Generate Operational Handover Summary (Pure Function)
export function generateOperationalSummary(data: {
  rfq: any;
  latestDiscussion?: any;
  handover?: any;
  fulfilment?: any;
  latestFollowup?: any;
  balanceDue?: number;
}) {
  const { rfq, latestDiscussion, handover, fulfilment, latestFollowup, balanceDue = 0 } = data;

  // Current Situation
  let currentSituation = 'RFQ received and awaiting commercial desk evaluation.';
  if (rfq.status === 'under_review') {
    currentSituation = `Under active review by ${rfq.sales_owner_name || 'Commercial Desk'}. Verifying lot availability & Mandi rate corridor.`;
  } else if (rfq.status === 'needs_information') {
    currentSituation = 'Awaiting critical buyer specifications or consignment clarification.';
  } else if (rfq.status === 'ready_to_quote') {
    currentSituation = 'Feasibility verified. Ready to draft and issue commercial quotation.';
  } else if (rfq.status === 'quote_issued' || rfq.status === 'revised_quotation_issued') {
    currentSituation = `Quotation ${rfq.quote_number} (Rev ${rfq.revision_number || 1}) issued for ₹${Number(rfq.total_quote_inr || 0).toLocaleString('en-IN')}. Awaiting buyer confirmation.`;
  } else if (rfq.status === 'discussion_in_progress') {
    currentSituation = 'Commercial terms, freight, or moisture specifications actively being negotiated with buyer.';
  } else if (rfq.status === 'accepted') {
    if (handover && handover.handover_status === 'acknowledged') {
      currentSituation = `Quotation accepted. Operations handover acknowledged by ${handover.operations_owner}. Sourcing & fulfillment active.`;
    } else {
      currentSituation = 'Quotation accepted by buyer. Pending Sales-to-Operations handover acknowledgement.';
    }
  } else if (rfq.status === 'rejected') {
    currentSituation = `Enquiry closed as rejected: ${rfq.rejection_category || 'Commercial mismatch'}. Reason: ${rfq.rejection_reason || 'Not viable'}.`;
  } else if (rfq.status === 'expired') {
    currentSituation = 'Quotation validity period (48h) has elapsed. New pricing required to hedge Mandi spot rate.';
  }

  // Latest Discussion
  let discussionText = 'No recorded discussion yet.';
  if (latestDiscussion) {
    const channelLabel = latestDiscussion.communication_channel.toUpperCase();
    const dateFormatted = new Date(latestDiscussion.discussion_date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    discussionText = `[${channelLabel}] on ${dateFormatted} by ${latestDiscussion.employee_name}: "${latestDiscussion.discussion_summary}"`;
  }

  // Outstanding Issues
  const issues: string[] = [];
  if (rfq.status === 'needs_information') {
    issues.push('Missing buyer consignment specifications or destination logistics confirmation');
  }
  if (!rfq.contact_phone && !rfq.contact_email) {
    issues.push('Missing buyer direct contact details');
  }
  if (balanceDue > 0 && rfq.status === 'accepted') {
    issues.push(`Outstanding balance of ₹${balanceDue.toLocaleString('en-IN')} pending settlement`);
  }
  if (fulfilment && fulfilment.quality_status === 'failed') {
    issues.push('Quality inspection failed moisture / weight grade threshold; requires sorting');
  }
  if (fulfilment && fulfilment.delivery_status === 'delivery_exception') {
    issues.push(`Logistics Exception: ${fulfilment.delivery_exception_notes || 'Transporter delay reported'}`);
  }
  const outstandingIssues = issues.length > 0 ? issues.join(' • ') : 'None recorded';

  // Next Action & Due Date
  let nextAction = 'Review buyer inquiry specifications';
  let responsiblePerson = rfq.sales_owner_name || 'Commercial Desk';
  let dueDate = 'Within 2 hours';
  let isOverdue = false;

  if (rfq.status === 'under_review') {
    nextAction = 'Confirm harvest yard stock & compute freight quote';
    dueDate = 'Today, by 4:00 PM';
  } else if (rfq.status === 'needs_information') {
    nextAction = 'Follow up with buyer for missing details';
    responsiblePerson = rfq.sales_owner_name || 'Sales Desk';
  } else if (rfq.status === 'ready_to_quote') {
    nextAction = 'Draft and issue official quotation to buyer';
    responsiblePerson = 'Quotation Manager';
    dueDate = 'Within 4 business hours';
  } else if (rfq.status === 'quote_issued' || rfq.status === 'revised_quotation_issued') {
    nextAction = 'Follow up with buyer on quotation acceptance';
    dueDate = rfq.valid_until ? `Before ${new Date(rfq.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : 'Within 24 hours';
  } else if (rfq.status === 'accepted') {
    if (!handover || handover.handover_status !== 'acknowledged') {
      nextAction = 'Complete Sales-to-Operations handover checklist & assign ops owner';
      responsiblePerson = 'Sales & Operations Leads';
      dueDate = 'Immediate';
    } else if (fulfilment?.procurement_status !== 'sourced') {
      nextAction = 'Procure & weigh consignment at Tiptur / Kikkeri Mandi yard';
      responsiblePerson = handover.operations_owner || 'Yard Operations';
      dueDate = fulfilment?.procurement_expected_readiness ? `Target: ${fulfilment.procurement_expected_readiness}` : 'Next business day';
    } else if (fulfilment?.quality_status !== 'passed') {
      nextAction = 'Conduct moisture (<5.5%) & weight grading inspection';
      responsiblePerson = 'Quality Inspector';
      dueDate = 'Prior to bagging';
    } else if (fulfilment?.dispatch_status !== 'dispatched') {
      nextAction = 'Assign transporter vehicle, generate LR, and dispatch shipment';
      responsiblePerson = 'Logistics Lead';
      dueDate = 'Scheduled dispatch slot';
    } else if (fulfilment?.delivery_status !== 'delivered') {
      nextAction = 'Track transit with driver & obtain Proof of Delivery (POD)';
      responsiblePerson = 'Logistics Desk';
      dueDate = 'Upon truck arrival';
    } else {
      nextAction = 'Reconcile final payment and archive completed order';
      responsiblePerson = 'Finance & Accounts';
      dueDate = 'Within 48 hours of delivery';
    }
  }

  // Override with active follow-up if present
  if (latestFollowup && latestFollowup.status === 'pending') {
    nextAction = `Scheduled Follow-Up: ${latestFollowup.notes || latestFollowup.followup_type}`;
    responsiblePerson = latestFollowup.responsible_employee;
    const dueTime = new Date(latestFollowup.due_date);
    dueDate = dueTime.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    isOverdue = dueTime.getTime() < Date.now();
  }

  return {
    currentSituation,
    latestDiscussion: discussionText,
    outstandingIssues,
    nextAction,
    responsiblePerson,
    dueDate,
    riskOrDelay: isOverdue ? '⚠️ Overdue follow-up requires immediate attention' : (rfq.status === 'on_hold' ? 'Enquiry currently On Hold' : 'On Schedule')
  };
}
