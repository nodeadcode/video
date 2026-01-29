import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'StreamVP - Video Streaming MVP',
    description: 'A premium video streaming application',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Navbar />
                    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    )
}
