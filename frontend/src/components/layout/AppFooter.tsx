'use client';

import React from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import { useI18n } from '@/i18n/I18nContext';

export interface AppFooterProps {
  ecoSummaryText?: string;
}

export function AppFooter({ ecoSummaryText }: AppFooterProps) {
  const { t } = useI18n();
  const summary = ecoSummaryText || t('footer.defaultEcoSummary');

  return (
    <footer className="border-t border-coastal-line bg-gradient-to-b from-coastal-mist/70 via-coastal-bg to-coastal-sand/40 text-coastal-ink">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Meta Astryx Bento Grid Footer */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
          {/* Col 1: Brand & Mission Bento Card (5 cols) */}
          <div className="rounded-3xl border border-coastal-line bg-coastal-card p-6 shadow-coastal lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-coastal-kelp via-coastal-gold to-coastal-rust text-coastal-card shadow-coastal">
                <AppIcon name="anchor" className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-serif text-lg font-bold text-coastal-ink">
                  {t('header.brandTitle')}{' '}
                  <span className="italic text-coastal-kelp">{t('header.brandHighlight')}</span>
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-coastal-slate">
                  {t('header.brandSubtitle')}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-coastal-slate">
              {summary}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-coastal-border bg-coastal-stone/80 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-coastal-deep">
              <span className="h-2 w-2 rounded-full bg-coastal-rust" />
              <AppIcon name="recycle" className="h-3.5 w-3.5 text-coastal-rust-hover" />
              {t('footer.traceableBadge')}
            </div>
          </div>

          {/* Col 2: Product Categories Bento Card (2 cols) */}
          <div className="rounded-3xl border border-coastal-line bg-coastal-card p-6 shadow-coastal lg:col-span-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-coastal-kelp">
              {t('footer.categoriesHeading')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs font-medium text-coastal-slate">
              <li>
                <Link
                  href="/shop?category=bag"
                  className="inline-flex items-center gap-1.5 hover:text-coastal-kelp transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-coastal-line" />
                  {t('footer.catBag')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=basket"
                  className="inline-flex items-center gap-1.5 hover:text-coastal-kelp transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-coastal-line" />
                  {t('footer.catBasket')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=wallet"
                  className="inline-flex items-center gap-1.5 hover:text-coastal-kelp transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-coastal-line" />
                  {t('footer.catWallet')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=apparel"
                  className="inline-flex items-center gap-1.5 hover:text-coastal-kelp transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-coastal-line" />
                  {t('footer.catApparel')}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=bracelet"
                  className="inline-flex items-center gap-1.5 hover:text-coastal-kelp transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-coastal-rust" />
                  {t('footer.catBracelet')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: 3D Customizer & Order Tracking (2 cols — Strictly NO CMS link!) */}
          <div className="rounded-3xl border border-coastal-line bg-coastal-card p-6 shadow-coastal lg:col-span-2">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-coastal-kelp">
              {t('footer.experienceHeading')}
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs font-medium text-coastal-slate">
              <li>
                <Link
                  href="/customizer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-coastal-border bg-coastal-stone/70 px-3 py-1 font-semibold text-coastal-deep hover:bg-coastal-rust hover:text-coastal-card transition-all"
                >
                  <AppIcon name="compass" className="h-3.5 w-3.5" />
                  {t('footer.linkStudio')}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="block pt-1 hover:text-coastal-kelp transition-colors">
                  {t('footer.linkOrders')}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="block hover:text-coastal-kelp transition-colors">
                  {t('footer.linkCart')}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="block hover:text-coastal-kelp transition-colors">
                  {t('header.navShop')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Craftsmanship Guarantee Bento Card (3 cols) */}
          <div className="rounded-3xl border border-coastal-line bg-coastal-card p-6 shadow-coastal lg:col-span-3">
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-widest text-coastal-kelp">
              {t('footer.guaranteeHeading')}
            </h3>
            <div className="mt-4 space-y-3 text-xs text-coastal-slate">
              <div className="flex items-start gap-2.5 rounded-2xl border border-coastal-line/60 bg-coastal-mist/60 p-3">
                <AppIcon name="shieldCheck" className="h-4 w-4 text-coastal-kelp shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t('footer.guaranteeStitch')}</span>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl border border-coastal-border/80 bg-coastal-stone/50 p-3">
                <AppIcon name="heartHandshake" className="h-4 w-4 text-coastal-rust shrink-0 mt-0.5" />
                <span className="leading-relaxed">{t('footer.guaranteeWarranty')}</span>
              </div>
              <p className="pt-1 font-mono text-[11px] text-coastal-muted">
                {t('footer.workshopAddress')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Tech Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-coastal-line/70 bg-coastal-card/80 px-5 py-3.5 text-xs text-coastal-muted">
          <p className="font-medium">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <p className="font-mono text-[11px] text-coastal-slate">{t('footer.techNote')}</p>
        </div>
      </div>
    </footer>
  );
}
