import type { Metadata } from "next";
import { PrintJobProvider } from "@/context/PrintJobContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MPrnt - Print Now",
  description: "Quick self-service printing from your phone",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PrintJobProvider>
          {children}
        </PrintJobProvider>
      </body>
    </html>
  );
}
