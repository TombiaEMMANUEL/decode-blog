import { Geist } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Decode",
  description: "Learn, Grow, Build",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased bg-[#080412]`}>
        <AuthSessionProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}