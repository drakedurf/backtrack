import { NextResponse } from 'next/server';

export async function GET(request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/`);
  
  response.cookies.set('spotify_access_token', '', {
    httpOnly: true,
    secure: origin.startsWith('https'),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  response.cookies.set('spotify_refresh_token', '', {
    httpOnly: true,
    secure: origin.startsWith('https'),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}
