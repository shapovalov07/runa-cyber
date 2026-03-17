import Link from 'next/link';
import { contactLinks, footerDescription, navLinks } from './site-config';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-top">
          <div className="footer-brand-block">
            <Link className="footer-brand" href="/" aria-label="На главную">
              <img className="footer-brand-logo" src="/images/runa-logo-provided-crop.png" alt="RUNA Cyber Club" />
            </Link>
            <p>{footerDescription}</p>
          </div>

          <div className="footer-col">
            <h3>Разделы</h3>
            <div className="footer-links">
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h3>Связь</h3>
            <div className="footer-links">
              {contactLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {year} RUNA Cyber Club.</div>
          <div className="footer-source">RUNA Cyber Club</div>
        </div>
      </div>
    </footer>
  );
}
