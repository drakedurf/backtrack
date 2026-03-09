import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64') },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  return response.json();
}
export async function GET(request) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('spotify_access_token')?.value;
  const refreshToken = cookieStore.get('spotify_refresh_token')?.value;
  if (!accessToken && !refreshToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!accessToken && refreshToken) {
    const tokenData = await refreshAccessToken(refreshToken);
    if (tokenData.error) return NextResponse.json({ error: 'Token refresh failed' }, { status: 401 });
    accessToken = tokenData.access_token;
  }
  try {
    let allAlbums = [];
    let url = 'https://api.spotify.com/v1/me/albums?limit=50';
    while (url) {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      if (response.status === 401 && refreshToken) {
        const tokenData = await refreshAccessToken(refreshToken);
        if (!tokenData.error) { accessToken = tokenData.access_token; continue; }
        return NextResponse.json({ error: 'Authentication expired' }, { status: 401 });
      }
      const data = await response.json();
      allAlbums = allAlbums.concat(data.items || []);
      url = data.next;
      if (allAlbums.length >= 500) break;
    }
    const albumsByYear = {};
    allAlbums.forEach(item => {
      const album = item.album;
      const releaseYear = parseInt(album.release_date.substring(0, 4));
      if (!albumsByYear[releaseYear]) albumsByYear[releaseYear] = [];
      albumsByYear[releaseYear].push({
        id: album.id, title: album.name, artist: album.artists.map(a => a.name).join(', '),
        cover: album.images[0]?.url || null, coverMedium: album.images[1]?.url || null,
        uri: album.uri, releaseDate: album.release_date, totalTracks: album.total_tracks,
        tracks: album.tracks?.items?.map(t => ({ id: t.id, name: t.name, number: t.track_number, duration: t.duration_ms, uri: t.uri })) || [],
      });
    });
    Object.keys(albumsByYear).forEach(year => { albumsByYear[year].sort((a, b) => a.title.localeCompare(b.title)); });
    return NextResponse.json({ albums: albumsByYear, totalAlbums: allAlbums.length });
  } catch (err) { console.error('Albums error:', err); return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 }); }
}
