import type { Metadata } from "next"
import Script from "next/script"
import { Copse } from "next/font/google"
import "./globals.css"

const copse = Copse({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-copse",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I Don't Need It",
  description: "Are you richer than me? Prove it. Show off your wealth, if you really have it.",
  keywords: ["money", "ego", "luxury", "wealth", "flex", "rich", "challenge"],
  authors: [{ name: "qynea" }],
  creator: "qynea",
  metadataBase: new URL("https://idontneedit.org"),
  openGraph: {
    title: "I Don't Need It",
    description: "Are you richer than me? Prove it. Show off your wealth, if you really have it.",
    url: "https://idontneedit.org",
    siteName: "I Don't Need It",
    locale: "en_US",
    type: "website",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "I Don't Need It",
    description: "Are you richer than me? Prove it.",
    site: "@qynea",
    creator: "@qynea",
    images: ["/opengraph-image.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${copse.variable} antialiased`}>
        <Script
          async
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
