// app/layout.tsx
import './globals.css';   // leave it even if the file is empty for now

export const metadata = {
  title: 'SmartMenu',
  description: 'AI-powered multilingual menus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{margin:0, fontFamily:'system-ui, sans-serif'}}>
        {children}
      </body>
    </html>
  );
}
