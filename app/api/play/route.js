import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export async function POST(request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('spotify_access_token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const body = await request.json();
    const { album_uri, device_id, track_uri } = body;
    const playBody = {};
    if (album_uri) { playBody.context_uri = album_uri; if (track_uri) playBody.offset = { uri: track_uri }; }
    const url = device_id ? `https://api.spotify.com/v1/me/player/play?device_id=${device_id}` : 'https://api.spotify.com/v1/me/player/play';
    const response = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(playBody) });
    if (response.status === 204 || response.status === 200) return NextResponse.json({ success: true });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json({ error: data.error?.message || 'Playback failed' }, { status: response.status });
  } catch (err) { console.error('Play error:', err); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
