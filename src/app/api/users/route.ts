import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Helper function to generate unique ID
function generateId(): string {
  return randomBytes(16).toString('hex');
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Find user by email
    if (email) {
      const users = await db.select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(users[0]);
    }

    // List users with optional search
    let query = db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }).from(user);

    if (search) {
      query = query.where(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      );
    }

    const users = await query
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(users);

  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ 
        error: "Email is required",
        code: "MISSING_EMAIL" 
      }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL" 
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ 
        error: "Password is required",
        code: "MISSING_PASSWORD" 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: "Password must be at least 6 characters",
        code: "PASSWORD_TOO_SHORT" 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        error: "User with this email already exists",
        code: "EMAIL_ALREADY_EXISTS" 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique IDs
    const userId = generateId();
    const accountId = generateId();
    const now = new Date();

    // Create user
    const newUser = await db.insert(user).values({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      emailVerified: false,
      image: null,
      createdAt: now,
      updatedAt: now
    }).returning();

    // Create associated account for credential authentication
    await db.insert(account).values({
      id: accountId,
      accountId: email.toLowerCase().trim(),
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      accessToken: null,
      refreshToken: null,
      idToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: null,
      createdAt: now,
      updatedAt: now
    });

    // Return created user without sensitive data
    const createdUser = {
      id: newUser[0].id,
      name: newUser[0].name,
      email: newUser[0].email,
      emailVerified: newUser[0].emailVerified,
      image: newUser[0].image,
      createdAt: newUser[0].createdAt,
      updatedAt: newUser[0].updatedAt
    };

    return NextResponse.json({
      message: "User created successfully",
      user: createdUser
    }, { status: 201 });

  } catch (error) {
    console.error('POST users error:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "User with this email already exists",
        code: "EMAIL_ALREADY_EXISTS" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}