import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const BASE_URL = process.env.NEXTAUTH_URL || origin;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) return NextResponse.redirect(`${BASE_URL}/?error=access_denied`);
  if (!code) return NextResponse.redirect(`${BASE_URL}/?error=no_code`);

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token error:', tokenData);
      return NextResponse.redirect(`${BASE_URL}/?error=token_failed`);
    }

    const isProduction = BASE_URL.startsWith('https');
    const response = NextResponse.redirect(`${BASE_URL}/timeline`);

    response.cookies.set('spotify_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
      path: '/',
    });

    response.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.redirect(`${BASE_URL}/?error=server_error`);
  }
}
