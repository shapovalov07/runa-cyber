import SiteFooter from '../components/SiteFooter';
import SiteHeader from '../components/SiteHeader';
import RevealObserver from '../components/RevealObserver';
import YandexMetrika from '../components/YandexMetrika';
import { headers } from 'next/headers';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://runa-cyber.ru'),
  title: {
    default: 'RUNA Cyber Club',
    template: '%s | RUNA Cyber Club',
  },
  description:
    'Официальный информационный сайт сети RUNA Cyber Club: клубы в разных городах, турниры, новости и контакты.',
  openGraph: {
    title: 'RUNA Cyber Club',
    description:
      'Официальный информационный сайт сети RUNA Cyber Club: клубы в разных городах, турниры, новости и контакты.',
    url: 'https://runa-cyber.ru',
    siteName: 'RUNA Cyber Club',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') || '';
  const isFranchiseHost = host.split(':')[0] === 'franchise.runa-cyber.ru';

  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <YandexMetrika />
        {!isFranchiseHost && <SiteHeader />}
        {children}
        {!isFranchiseHost && <SiteFooter />}
        <RevealObserver />
      </body>
    </html>
  );
}
