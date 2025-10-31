// app/layout.jsx
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { ChatProvider } from '@/context/chat-context'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Smart Crop Disease Detection',
  description: 'Detect crop diseases instantly using AI',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo2.png', // favicon or tab icon
    shortcut: '/logo2.png', // optional shortcut icon
    apple: '/logo2.png', // for Apple devices
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              {/* <Footer /> */}
            </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  )
}