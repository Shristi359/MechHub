import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mechub-be9ed';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'));

async function verifyFirebaseToken(token: string): Promise<{ role: string, uid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    
    return {
      uid: payload.sub as string,
      role: (payload.admin ? 'admin' : (payload.role as string)) || 'user'
    };
  } catch (err) {
    console.error('JWT Verification failed:', err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = await verifyFirebaseToken(token);
    if (!decoded) {
      // Invalid token, force re-login
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('auth_token');
      return res;
    }

    const role = decoded.role;
    const response = NextResponse.next();
    response.headers.set('x-mechhub-role', role);
    // Also set on the request headers so Server Components can read via next/headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-mechhub-role', role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Redirect authenticated users away from /login
  if (request.nextUrl.pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/dashboard/jobs', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
