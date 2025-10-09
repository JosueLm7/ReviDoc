import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ReviDocUC',
    template: '%s | ReviDocUC'
  },
  description: 'Plataforma especializada en revisión y gestión de documentos académicos. Herramientas avanzadas para estudiantes y profesionales. Creado por Jos7suu',
  keywords: [
    'revisión documental',
    'documentos académicos',
    'gestión documental', 
    'universidad',
    'análisis de textos',
    'herramientas educativas',
    'Jos7suu'
  ],
  authors: [
    { 
      name: 'Jos7suu', 
      url: 'https://github.com/JosueLm7' // Reemplaza con tu URL
    }
  ],
  creator: 'Jos7suu',
  publisher: 'ReviDocUC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Íconos
  icons: {
    icon: [
      { url: '/img/ReviDoc.png', sizes: '32x32', type: 'image/png' },
      { url: '/img/ReviDoc.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/img/ReviDoc.png',
    apple: [
      { url: '/img/ReviDoc.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Open Graph para redes sociales
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://tudominio.com', // Reemplaza con tu dominio
    siteName: 'ReviDocUC',
    title: 'ReviDocUC - Plataforma de Revisión Documental',
    description: 'Plataforma especializada en revisión y gestión de documentos académicos',
    images: [
      {
        url: '/img/ReviDoc.png',
        width: 1200,
        height: 630,
        alt: 'ReviDocUC - Plataforma de Revisión Documental',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'ReviDocUC - Plataforma de Revisión Documental',
    description: 'Plataforma especializada en revisión y gestión de documentos académicos',
    images: ['/img/ReviDoc.png'],
    creator: '@Jos7suu', // Reemplaza con tu handle de Twitter
    site: '@ReviDocUC', // Reemplaza con el handle de tu sitio
  },
  
  // Robots para SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}