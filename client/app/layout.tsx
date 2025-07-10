import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/providers/socket";
import { RoomIdProvider } from "@/providers/roomId";
import { PeerProvider } from "@/providers/peer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Playback",
  description: "Built by Rishi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SocketProvider>
          <PeerProvider>
            <RoomIdProvider>
              {children}
            </RoomIdProvider>
          </PeerProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
