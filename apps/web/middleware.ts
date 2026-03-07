  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
  import { NextResponse } from 'next/server';
  import { getRoleFromClaims, roleAtLeast } from './lib/role';

  const isPublicRoute = createRouteMatcher([
    '/marketing',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
  ]);
  const isAdminRoute = createRouteMatcher(['/admin(.*)']);

  function redirectByRole(req: Request, role?: string) {
    const url = new URL(req.url);
    const target = roleAtLeast((role as any) ?? 'user', 'staff') ? '/admin/dashboard' : '/';
    url.pathname = target;
    url.search = '';
    return NextResponse.redirect(url);
  }
  export default clerkMiddleware(async (auth, req) => {
    const { isAuthenticated, sessionClaims } = await auth();
    const role = getRoleFromClaims(sessionClaims);
    const pathname = new URL(req.url).pathname;
    if (isPublicRoute(req)) {
      if (isAuthenticated) {
        return redirectByRole(req, role);
      }
      return NextResponse.next();
    }

    if (!isAuthenticated)
      return NextResponse.redirect(new URL('/marketing', req.url));

  if (isAdminRoute(req) && !roleAtLeast(role ?? 'user', 'staff')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (roleAtLeast(role ?? 'user', 'staff') && pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  if (roleAtLeast(role ?? 'user', 'staff') && pathname === '/') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

    return NextResponse.next();
  });

  export const config = {
    matcher: [
      // Skip Next.js internals and all static files, unless found in search params
      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      // Always run for API routes
      '/(api|trpc)(.*)',
    ],
  };
