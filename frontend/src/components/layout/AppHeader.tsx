'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { AppIcon } from '@/components/ui/AppIcon';
import type { IconName } from '@/config/icons';
import { useI18n } from '@/i18n/I18nContext';
import { ENV } from '@/config/env';
import { pingServerKeepAlive } from '@/lib/api';

export interface AppHeaderProps {
  variant?: 'default' | 'store' | 'studio' | 'admin' | 'cms';
  studioTitle?: string;
  backHref?: string;
}

export function AppHeader({
  variant = 'default',
  studioTitle,
  backHref = '/shop',
}: AppHeaderProps) {
  const pathname = usePathname();
  const { totalItemsCount } = useCart();
  const { locale, setLocale, t } = useI18n();

  // Keep-Alive Heartbeat: Wake up Render backend immediately and ping every 8 minutes
  useEffect(() => {
    pingServerKeepAlive();
    const intervalMs = (ENV.KEEP_ALIVE_MINUTES || 8) * 60 * 1000;
    const timerId = window.setInterval(() => {
      pingServerKeepAlive();
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const effectiveStudioTitle = studioTitle || t('header.studioDefaultTitle');
  const isCmsVariant = variant === 'admin' || variant === 'cms';

  // Meta Astryx Segmented Pill Control for Language Switch (VI | EN)
  const renderLanguageSwitch = () => (
    <div
      className="inline-flex items-center rounded-full border border-coastal-line bg-coastal-mist/90 p-0.5 font-mono text-[11px] shadow-coastal"
      role="group"
      aria-label={t('common.switchLangLabel')}
    >
      <button
        type="button"
        onClick={() => setLocale('vi')}
        className={`rounded-full px-2.5 py-1 transition-all duration-150 ${
          locale === 'vi'
            ? 'bg-coastal-kelp text-coastal-card font-semibold shadow-coastal'
            : 'text-coastal-slate hover:text-coastal-ink'
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`rounded-full px-2.5 py-1 transition-all duration-150 ${
          locale === 'en'
            ? 'bg-coastal-kelp text-coastal-card font-semibold shadow-coastal'
            : 'text-coastal-slate hover:text-coastal-ink'
        }`}
      >
        EN
      </button>
    </div>
  );

  // Meta Astryx Compact Topbar for 3D Customizer Studio Shell
  if (variant === 'studio') {
    return (
      <header className="sticky top-0 z-40 h-14 border-b border-coastal-line/80 bg-coastal-card/85 px-4 backdrop-blur-xl">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-coastal-line bg-coastal-bg px-3.5 py-1.5 text-xs font-semibold text-coastal-ink shadow-coastal hover:border-coastal-kelp hover:bg-coastal-mist transition-all"
            >
              <AppIcon name="arrowLeft" className="h-3.5 w-3.5 text-coastal-kelp" />
              {t('header.backToShop')}
            </Link>
            <div className="hidden sm:flex items-center gap-2.5">
              <span className="h-4 w-[1px] bg-coastal-line" />
              <span className="inline-flex items-center gap-2 rounded-full border border-coastal-border bg-coastal-stone/60 px-3 py-1 font-serif text-sm font-semibold text-coastal-ink">
                <AppIcon name="compass" className="h-4 w-4 text-coastal-rust" />
                {effectiveStudioTitle}
              </span>
            </div>
          </div>

          <nav aria-label={t('header.studioNavAria')} className="flex items-center gap-2.5">
            {renderLanguageSwitch()}
            <Link
              href="/orders"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-coastal-line/70 bg-coastal-card px-3.5 py-1.5 text-xs font-medium text-coastal-slate hover:border-coastal-kelp hover:bg-coastal-mist hover:text-coastal-ink transition-all"
            >
              <AppIcon name="packageSearch" className="h-3.5 w-3.5 text-coastal-kelp" />
              {t('header.lookupOrder')}
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-coastal-kelp to-coastal-gold px-4 py-1.5 text-xs font-semibold text-coastal-card shadow-coastal hover:opacity-95 transition-all"
            >
              <AppIcon name="shoppingBag" className="h-3.5 w-3.5" />
              <span>{t('header.cart')}</span>
              <span className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-coastal-card px-1.5 font-mono text-[11px] font-bold text-coastal-ink">
                {totalItemsCount}
              </span>
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  // Meta Astryx CMS Workstation Header (ONLY rendered when inside CMS app / admin variant)
  if (isCmsVariant) {
    return (
      <header className="sticky top-0 z-40 border-b border-coastal-line/80 bg-coastal-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-coastal-kelp to-coastal-rust text-coastal-card shadow-coastal">
              <AppIcon name="layoutDashboard" className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-serif text-lg font-bold tracking-tight text-coastal-ink">
                {t('header.brandTitle')}{' '}
                <span className="italic text-coastal-kelp">CMS Portal</span>
              </span>
              <span className="block font-mono text-[10px] font-medium uppercase tracking-wider text-coastal-slate">
                {t('cms.dashboardHeading')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {renderLanguageSwitch()}
            <a
              href={ENV.STORE_URL || '/'}
              className="inline-flex items-center gap-1.5 rounded-full border border-coastal-kelp bg-coastal-mist px-4 py-1.5 text-xs font-semibold text-coastal-kelp hover:bg-coastal-kelp hover:text-coastal-card transition-all"
            >
              <AppIcon name="store" className="h-3.5 w-3.5" />
              {t('header.navShop')}
            </a>
          </div>
        </div>
      </header>
    );
  }

  // Meta Astryx Floating Glass Pill Header for Web Store (Strictly NO CMS link!)
  const navLinks: Array<{
    href: string;
    label: string;
    icon?: IconName;
    highlight?: boolean;
  }> = [
    { href: '/', label: t('header.navStory'), icon: 'waves' },
    { href: '/shop', label: t('header.navShop'), icon: 'store' },
    { href: '/customizer', label: t('header.navStudio'), icon: 'compass', highlight: true },
    { href: '/orders', label: t('header.navOrders'), icon: 'packageSearch' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-coastal-line/70 bg-coastal-card/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo with Astryx Squircle Icon Badge */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-coastal-kelp via-coastal-gold to-coastal-rust text-coastal-card shadow-coastal group-hover:scale-105 transition-transform duration-200">
            <AppIcon name="anchor" className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-serif text-lg font-bold tracking-tight text-coastal-ink">
              {t('header.brandTitle')}{' '}
              <span className="italic text-coastal-kelp">{t('header.brandHighlight')}</span>
            </span>
            <span className="block font-mono text-[10px] font-medium uppercase tracking-widest text-coastal-slate">
              {t('header.brandSubtitle')}
            </span>
          </div>
        </Link>

        {/* Main Navigation — Astryx Segmented Floating Pill Bar (Customer-facing only) */}
        <nav
          aria-label={t('header.mainNavAria')}
          className="hidden md:flex items-center gap-1 rounded-full border border-coastal-line bg-coastal-mist/75 p-1 shadow-coastal"
        >
          {navLinks.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  item.highlight
                    ? isActive
                      ? 'bg-coastal-rust text-coastal-card shadow-coastal'
                      : 'border border-coastal-border bg-coastal-stone/80 text-coastal-deep hover:bg-coastal-rust hover:text-coastal-card'
                    : isActive
                    ? 'bg-coastal-card text-coastal-kelp shadow-coastal'
                    : 'text-coastal-slate hover:bg-coastal-card/70 hover:text-coastal-ink'
                }`}
              >
                {item.icon && <AppIcon name={item.icon} className="h-3.5 w-3.5" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Language Switch + Cart + Mobile Customizer CTA */}
        <div className="flex items-center gap-2.5">
          {renderLanguageSwitch()}

          <Link
            href="/customizer"
            className="md:hidden inline-flex items-center gap-1 rounded-full border border-coastal-border bg-coastal-stone px-3 py-1.5 text-xs font-semibold text-coastal-deep"
          >
            <AppIcon name="compass" className="h-3.5 w-3.5 text-coastal-rust" />
            {t('header.studioMobile')}
          </Link>

          <Link
            href="/cart"
            aria-label={`${t('header.cart')} (${totalItemsCount})`}
            className="relative inline-flex items-center gap-2 rounded-full bg-coastal-kelp px-4 py-2 text-xs font-semibold text-coastal-card shadow-coastal hover:bg-coastal-kelp-hover transition-all"
          >
            <AppIcon name="shoppingBag" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('header.cart')}</span>
            <span className="inline-flex h-4 min-w-[18px] items-center justify-center rounded-full bg-coastal-card px-1.5 font-mono text-[11px] font-bold text-coastal-kelp">
              {totalItemsCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
