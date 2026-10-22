import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const slug = searchParams.get('slug');

    let whereClause = 'WHERE pr.is_approved = TRUE';
    const params: any[] = [];

    if (productId) {
      params.push(productId);
      whereClause += ` AND pr.product_id = $${params.length}`;
    } else if (slug) {
      params.push(slug);
      whereClause += ` AND p.slug = $${params.length}`;
    }

    const rows = await query(
      `SELECT pr.*, p.title as product_title, p.slug as product_slug 
       FROM product_reviews pr
       JOIN products p ON pr.product_id = p.id
       ${whereClause}
       ORDER BY pr.created_at DESC`,
      params
    );

    // Calculate rating metrics
    const totalCount = rows.length;
    const ratingSum = rows.reduce((acc: number, r: any) => acc + Number(r.rating || 0), 0);
    const averageRating = totalCount > 0 ? parseFloat((ratingSum / totalCount).toFixed(1)) : 5.0;

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    rows.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      count: totalCount,
      average_rating: averageRating,
      rating_breakdown: breakdown,
      reviews: rows
    });
  } catch (error: any) {
    console.error('API Error in /api/reviews (GET):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_id,
      customer_name,
      customer_phone,
      customer_email,
      rating,
      title,
      comment
    } = body;

    if (!product_id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is mandatory' },
        { status: 400 }
      );
    }

    const name = String(customer_name || '').trim();
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Reviewer name is required' },
        { status: 400 }
      );
    }

    const starRating = parseInt(String(rating), 10);
    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const cleanComment = String(comment || '').trim();
    if (cleanComment.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Review comment must be at least 5 characters long' },
        { status: 400 }
      );
    }

    const cleanTitle = title?.trim() || null;
    const cleanPhone = customer_phone ? String(customer_phone).replace(/\D/g, '').slice(-10) : null;
    const cleanEmail = customer_email?.trim() || null;

    // Check if product exists
    const prodCheck = await query(`SELECT id, title FROM products WHERE id = $1`, [product_id]);
    if (prodCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Referenced agricultural product not found' },
        { status: 404 }
      );
    }

    const inserted = await query(
      `INSERT INTO product_reviews (
        product_id, customer_name, customer_phone, customer_email,
        rating, title, comment, is_verified_buyer, is_approved, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE, NOW(), NOW())
      RETURNING *`,
      [product_id, name, cleanPhone, cleanEmail, starRating, cleanTitle, cleanComment]
    );

    const newReview = inserted[0];

    // Log in audit logs
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('PRODUCT_REVIEW_SUBMITTED', 'product_reviews', $1, $2)`,
      [
        newReview.id,
        JSON.stringify({
          product_id,
          product_title: prodCheck[0].title,
          customer_name: name,
          rating: starRating,
          timestamp: new Date().toISOString()
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        ...newReview,
        product_title: prodCheck[0].title
      }
    });
  } catch (error: any) {
    console.error('API Error in /api/reviews (POST):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required for deletion' },
        { status: 400 }
      );
    }

    const deleted = await query(
      `DELETE FROM product_reviews WHERE id = $1 RETURNING id, product_id, customer_name, rating`,
      [id]
    );

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review not found or already deleted' },
        { status: 404 }
      );
    }

    const row = deleted[0];

    // Log deletion in audit logs for transparency
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details)
       VALUES ('PRODUCT_REVIEW_DELETED', 'product_reviews', $1, $2)`,
      [
        id,
        JSON.stringify({
          product_id: row.product_id,
          author: row.customer_name,
          rating: row.rating,
          deleted_at: new Date().toISOString()
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Product rating & review deleted successfully',
      deleted_id: id
    });
  } catch (error: any) {
    console.error('API Error in /api/reviews (DELETE):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review', details: error.message },
      { status: 500 }
    );
  }
}
