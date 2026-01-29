import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "StreamMVP - Video Streaming Platform",
    description: "High quality video streaming platform built for MVP",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 min-h-screen pt-16`}>
                <AuthProvider>
                    <Navbar />
                    <main className="container mx-auto px-6 py-8">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}
