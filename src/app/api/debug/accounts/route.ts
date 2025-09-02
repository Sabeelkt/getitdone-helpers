import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query = db.select({
      id: account.id,
      accountId: account.accountId,
      providerId: account.providerId,
      userId: account.userId,
      hasPassword: account.password,
      userEmail: user.email,
      userName: user.name,
      accountCreatedAt: account.createdAt,
      userCreatedAt: user.createdAt,
      userEmailVerified: user.emailVerified
    })
    .from(account)
    .leftJoin(user, eq(account.userId, user.id));

    // Filter by email if provided
    if (email) {
      query = query.where(eq(user.email, email));
    }

    // Order by account creation date (newest first)
    query = query.orderBy(desc(account.createdAt));

    const results = await query;

    // Transform results to include hasPassword as boolean and format data
    const transformedResults = results.map(record => ({
      id: record.id,
      accountId: record.accountId,
      providerId: record.providerId,
      userId: record.userId,
      hasPassword: record.hasPassword !== null && record.hasPassword !== undefined && record.hasPassword !== '',
      userEmail: record.userEmail,
      userName: record.userName,
      accountCreatedAt: record.accountCreatedAt,
      userCreatedAt: record.userCreatedAt,
      userEmailVerified: record.userEmailVerified,
      debugInfo: {
        accountExists: true,
        userExists: record.userEmail !== null,
        isCredentialAccount: record.providerId === 'credential',
        canLogin: record.userEmail !== null && (
          record.providerId !== 'credential' || 
          (record.hasPassword !== null && record.hasPassword !== undefined && record.hasPassword !== '')
        )
      }
    }));

    return NextResponse.json(transformedResults, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}