import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account, user } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const userIdFilter = searchParams.get('userId');
    const emailFilter = searchParams.get('email');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build the query with joins to get user email
    let query = db.select({
      id: account.id,
      accountId: account.accountId,
      providerId: account.providerId,
      userId: account.userId,
      hasPassword: account.password,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
      scope: account.scope,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      userEmail: user.email,
      userName: user.name
    })
    .from(account)
    .leftJoin(user, eq(account.userId, user.id));

    // Security: Always scope to authenticated user's accounts only
    let whereConditions = [eq(account.userId, currentUser.id)];

    // Add additional filters if provided
    if (userIdFilter) {
      whereConditions.push(eq(account.userId, userIdFilter));
    }

    if (emailFilter) {
      whereConditions.push(like(user.email, `%${emailFilter}%`));
    }

    // Apply where conditions
    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    // Apply sorting
    const sortField = sort === 'createdAt' ? account.createdAt : 
                     sort === 'updatedAt' ? account.updatedAt :
                     sort === 'providerId' ? account.providerId :
                     account.createdAt;

    query = order === 'asc' ? query.orderBy(sortField) : query.orderBy(desc(sortField));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    // Transform results to include debugging information
    const debugAccounts = results.map(account => ({
      id: account.id,
      accountId: account.accountId,
      providerId: account.providerId,
      userId: account.userId,
      userEmail: account.userEmail,
      userName: account.userName,
      accountType: account.providerId === 'credential' ? 'credential' : 'oauth',
      hasPassword: account.hasPassword ? true : false,
      hasAccessToken: account.accessToken ? true : false,
      hasRefreshToken: account.refreshToken ? true : false,
      scopes: account.scope ? account.scope.split(' ') : [],
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      isCredentialAccount: account.providerId === 'credential',
      isOAuthAccount: account.providerId !== 'credential'
    }));

    return NextResponse.json(debugAccounts);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}