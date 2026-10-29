import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { logRfqActivity } from '@/lib/b2b-workflow';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAdmin(request, true);
  if (auth) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      action_type, // 'procurement' | 'quality_inspection' | 'dispatch' | 'delivery'
      actor_name = 'Operations Lead',
      // Procurement fields
      procurement_status,
      procurement_source,
      procurement_expected_readiness,
      procurement_notes,
      // Quality inspection fields
      quality_status,
      quality_inspector,
      quality_inspected_quantity,
      quality_observations,
      // Dispatch fields
      dispatched_quantity,
      transporter_name,
      vehicle_number,
      driver_name,
      driver_phone,
      lr_number,
      tracking_reference,
      bag_or_box_count,
      dispatch_notes,
      // Delivery fields
      delivery_status,
      delivered_quantity,
      recipient_name,
      delivery_remarks,
      delivery_exception_notes
    } = body;

    const rfqRows = await query(`SELECT * FROM wholesale_quotations WHERE id = $1`, [id]);
    if (rfqRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
    }
    const rfq = rfqRows[0];

    // Ensure a b2b_fulfilments row exists for this rfq
    let fRow = await query(`SELECT * FROM b2b_fulfilments WHERE rfq_id = $1 LIMIT 1`, [id]);
    if (fRow.length === 0) {
      const createdF = await query(
        `INSERT INTO b2b_fulfilments (
          rfq_id, procurement_status, quality_status, dispatch_status, delivery_status, created_at, updated_at
        ) VALUES ($1, 'not_started', 'pending', 'pending', 'pending', NOW(), NOW())
        RETURNING *`,
        [id]
      );
      fRow = createdF;
    }
    const currentF = fRow[0];

    if (action_type === 'procurement') {
      const pStatus = procurement_status || 'in_progress';
      const updated = await query(
        `UPDATE b2b_fulfilments
         SET procurement_status = $1,
             procurement_source = COALESCE($2, procurement_source),
             procurement_expected_readiness = COALESCE($3, procurement_expected_readiness),
             procurement_notes = COALESCE($4, procurement_notes),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [pStatus, procurement_source || null, procurement_expected_readiness || null, procurement_notes || null, currentF.id]
      );

      await query(
        `UPDATE wholesale_quotations SET fulfilment_status = 'procurement_in_progress', updated_at = NOW() WHERE id = $1`,
        [id]
      );

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'procurement_updated',
        activityTitle: `Procurement updated: ${pStatus.replace(/_/g, ' ')}`,
        description: `Source: ${procurement_source || 'Mandi Yard'}. Target Date: ${procurement_expected_readiness || 'Standard'}.`,
        comments: procurement_notes || null,
        actingUser: actor_name,
        actorRole: 'operations',
        visibility: 'ops_update'
      });

      return NextResponse.json({ success: true, fulfilment: updated[0] });
    }

    if (action_type === 'quality_inspection') {
      if (!quality_status) {
        return NextResponse.json({ success: false, error: 'Quality inspection status (passed/failed) is required' }, { status: 400 });
      }

      const qQty = quality_inspected_quantity ? Number(quality_inspected_quantity) : rfq.requested_quantity;
      const updated = await query(
        `UPDATE b2b_fulfilments
         SET quality_status = $1,
             quality_inspector = $2,
             quality_inspected_quantity = $3,
             quality_inspection_date = NOW(),
             quality_observations = $4,
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [quality_status, quality_inspector || actor_name, qQty, quality_observations || 'Standard moisture and grade inspection verified.', currentF.id]
      );

      await query(
        `UPDATE wholesale_quotations
         SET fulfilment_status = CASE WHEN $1 = 'passed' THEN 'ready_for_dispatch' ELSE 'quality_check' END,
             updated_at = NOW()
         WHERE id = $2`,
        [quality_status, id]
      );

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: quality_status === 'passed' ? 'quality_inspection_passed' : 'quality_inspection_failed',
        activityTitle: `Quality inspection ${quality_status.toUpperCase()} (${qQty} ${rfq.unit})`,
        description: `Inspector: ${quality_inspector || actor_name}. Observations: ${quality_observations || 'Compliant with Grade A requirements.'}`,
        actingUser: actor_name,
        actorRole: 'operations',
        visibility: 'ops_update'
      });

      return NextResponse.json({ success: true, fulfilment: updated[0] });
    }

    if (action_type === 'dispatch') {
      if (!vehicle_number || !vehicle_number.trim()) {
        return NextResponse.json({ success: false, error: 'Vehicle number is required for dispatch logging' }, { status: 400 });
      }
      if (!transporter_name || !transporter_name.trim()) {
        return NextResponse.json({ success: false, error: 'Transporter name is required' }, { status: 400 });
      }

      const dQty = dispatched_quantity ? Number(dispatched_quantity) : rfq.requested_quantity;
      if (dQty > rfq.requested_quantity && !dispatch_notes) {
        return NextResponse.json({
          success: false,
          error: 'Dispatched quantity exceeds confirmed quantity; an explanatory note is required.'
        }, { status: 400 });
      }

      const updated = await query(
        `UPDATE b2b_fulfilments
         SET dispatch_status = 'dispatched',
             dispatched_quantity = $1,
             dispatch_date = NOW(),
             transporter_name = $2,
             vehicle_number = $3,
             driver_name = $4,
             driver_phone = $5,
             lr_number = $6,
             tracking_reference = $7,
             bag_or_box_count = $8,
             delivery_status = 'in_transit',
             updated_at = NOW()
         WHERE id = $9
         RETURNING *`,
        [
          dQty,
          transporter_name.trim(),
          vehicle_number.trim(),
          driver_name || null,
          driver_phone || null,
          lr_number || null,
          tracking_reference || `VRL-B2B-${Date.now().toString().slice(-6)}`,
          bag_or_box_count || Math.ceil(dQty / 25),
          currentF.id
        ]
      );

      await query(
        `UPDATE wholesale_quotations SET fulfilment_status = 'dispatched', updated_at = NOW() WHERE id = $1`,
        [id]
      );

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: 'dispatch_recorded',
        activityTitle: `Consignment dispatched via ${transporter_name} (${vehicle_number})`,
        description: `Dispatched: ${dQty} ${rfq.unit}. LR: ${lr_number || 'Surface Note'}. Driver: ${driver_name || 'Assigned'} (${driver_phone || 'Contact on file'}).`,
        comments: dispatch_notes || null,
        actingUser: actor_name,
        actorRole: 'operations',
        visibility: 'buyer_visible'
      });

      return NextResponse.json({ success: true, fulfilment: updated[0] });
    }

    if (action_type === 'delivery') {
      const dStatus = delivery_status || 'delivered';
      const delQty = delivered_quantity ? Number(delivered_quantity) : (currentF.dispatched_quantity || rfq.requested_quantity);

      const updated = await query(
        `UPDATE b2b_fulfilments
         SET delivery_status = $1,
             delivered_quantity = $2,
             delivery_date = CASE WHEN $1 = 'delivered' THEN NOW() ELSE delivery_date END,
             recipient_name = $3,
             delivery_remarks = $4,
             delivery_exception_notes = $5,
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          dStatus,
          delQty,
          recipient_name || rfq.contact_person,
          delivery_remarks || null,
          delivery_exception_notes || null,
          currentF.id
        ]
      );

      await query(
        `UPDATE wholesale_quotations
         SET fulfilment_status = CASE WHEN $1 = 'delivered' THEN 'delivered' ELSE 'delivery_exception' END,
             updated_at = NOW()
         WHERE id = $2`,
        [dStatus, id]
      );

      await logRfqActivity({
        rfqId: id,
        quotationRevision: rfq.revision_number || 1,
        activityType: dStatus === 'delivered' ? 'delivery_confirmed' : 'delivery_exception',
        activityTitle: dStatus === 'delivered' ? `Delivery confirmed by ${recipient_name || rfq.contact_person}` : `Delivery exception reported`,
        description: dStatus === 'delivered' ? `Delivered quantity: ${delQty} ${rfq.unit}. Remarks: ${delivery_remarks || 'Consignment verified at buyer unloading dock.'}` : delivery_exception_notes,
        comments: delivery_remarks || delivery_exception_notes || null,
        actingUser: actor_name,
        actorRole: 'operations',
        visibility: 'buyer_visible'
      });

      return NextResponse.json({ success: true, fulfilment: updated[0] });
    }

    return NextResponse.json({ success: false, error: 'Invalid fulfilment action type' }, { status: 400 });
  } catch (error: any) {
    console.error('API Error in /api/admin/rfqs/[id]/fulfilment (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update fulfilment record', details: error.message },
      { status: 500 }
    );
  }
}
