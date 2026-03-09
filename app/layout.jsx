import './globals.css';
export const metadata = { title: 'Backtrack', description: 'A digital ritual for intentional listening' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" /></head>
      <body style={{ fontFamily: "'DM Sans', sans-serif" }}>{children}</body>
    </html>
  );
}
