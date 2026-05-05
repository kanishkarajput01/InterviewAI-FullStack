import type { Metadata } from "next";
import { Rubik } from "next/font/google";

import { getUser } from "@/_shared/utils/getUser";
import { Footer } from "@/app/_shared-components/Footer";
import { Navbar } from "@/app/_shared-components/Navbar";
import { UserProvider } from "@/app/contexts/UserContext";

import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "IntervueAI",
  description: "Ace your next interview with AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" className={`${rubik.variable} h-full antialiased`}>
      <body className={`${rubik.className} flex min-h-full flex-col`}>
        <UserProvider user={user}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
