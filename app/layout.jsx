import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import RevealObserver from '../components/RevealObserver';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://runa-cyber.ru'),
  title: {
    default: 'RUNA Cyber Club',
    template: '%s | RUNA Cyber Club',
  },
  description:
    'Официальный информационный сайт сети RUNA Cyber Club: клубы в разных городах, турниры, новости, контакты и франшиза.',
  openGraph: {
    title: 'RUNA Cyber Club',
    description:
      'Официальный информационный сайт сети RUNA Cyber Club: клубы в разных городах, турниры, новости, контакты и франшиза.',
    url: 'https://runa-cyber.ru',
    siteName: 'RUNA Cyber Club',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <RevealObserver />
      </body>
    </html>
  );
}
