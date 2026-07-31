import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Level 23 | Interactive Commercial Building Portfolio",
  description: "A mobile-first interactive portfolio for Level 23 by Akshar and Bhagwati.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8f3ed",
};

import { EnquiryProvider } from "@/providers/EnquiryProvider";
import { EnquiryModal } from "@/components/common/EnquiryModal";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <EnquiryProvider>
          {children}
          <EnquiryModal />
        </EnquiryProvider>
      </body>
    </html>
  );
}
