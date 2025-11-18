import { cookies } from 'next/headers';

/** Stores the current profile role in a cookie the middleware can read. */
export function setRoleCookie(role: string | null | undefined) {
  if (!role) return;
  cookies().set('sb-role', role, {
    path: '/',
    sameSite: 'lax'
  });
}
