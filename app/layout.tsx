import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const lora = Lora({ variable: '--font-lora', subsets: ['latin'], style: ['italic'] });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'Fármaco Brasil — Inteligência farmacêutica territorial',
  description: 'Mapa auditável do mercado de medicamentos e da oferta no SUS por estado e município.',
  openGraph: {
    title: 'Fármaco Brasil',
    description: 'Inteligência farmacêutica territorial: mercado, SUS e evidências em uma base auditável.',
    images: [{ url: '/og.png', width: 1680, height: 945, alt: 'Fármaco Brasil — inteligência farmacêutica territorial' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fármaco Brasil',
    description: 'Inteligência farmacêutica territorial: mercado, SUS e evidências em uma base auditável.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${inter.variable} ${lora.variable}`}>{children}</body></html>;
}
