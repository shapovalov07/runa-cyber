'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navLinks } from './site-config';

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container header-row">
        <Link className="brand" href="/" aria-label="На главную">
          <img className="brand-logo" src="/images/runa-logo-header-wordmark.png" alt="RUNA Cyber Club" />
        </Link>

        <button
          className="menu-toggle"
          aria-label="Открыть меню"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          ☰
        </button>

        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Основная навигация">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'active' : ''}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
