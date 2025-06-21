// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Acarte",
  description: "AI-powered multilingual menus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <head>
        {/* ensure proper mobile scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* preconnect & fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="m-0">
        {children}
      </body>
    </html>
  );
}
