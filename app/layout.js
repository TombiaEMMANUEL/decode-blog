import { Geist } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: {
    default: "Decode — Learn, Grow, Build",
    template: "%s | Decode",
  },
  description: "Decode is where curious minds come to read, learn, and build. Explore articles, courses, and ideas that make the complex feel simple.",
  keywords: ["blog", "learning", "technology", "programming", "courses", "web development"],
  authors: [{ name: "Decode" }],
  creator: "Decode",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://decode-blog-eight.vercel.app",
    siteName: "Decode",
    title: "Decode — Learn, Grow, Build",
    description: "Decode is where curious minds come to read, learn, and build.",
    images: [
      {
        url: "https://decode-blog-eight.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Decode",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Decode — Learn, Grow, Build",
    description: "Decode is where curious minds come to read, learn, and build.",
    images: ["https://decode-blog-eight.vercel.app/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-[#080412]`}>
        <AuthSessionProvider>
          <Navbar />
          {children}
          <ScrollToTop />
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}