import { Exo_2, Orbitron } from 'next/font/google';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import RevealObserver from '@/components/RevealObserver';
import './globals.css';

const exo = Exo_2({
  variable: '--font-exo',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['500', '700', '800'],
});

export const metadata = {
  title: {
    default: 'RUNA Cyber Club',
    template: '%s | RUNA Cyber Club',
  },
  description:
    'Официальный информационный сайт RUNA Cyber Club в Ростове-на-Дону: залы, железо, тарифы, акции, кибертурниры и контакты.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${exo.variable} ${orbitron.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
