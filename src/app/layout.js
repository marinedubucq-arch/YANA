import './globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'YANA – You Are Not Alone',
  description: 'La plateforme des entrepreneurs solo qui veulent bosser ensemble.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
