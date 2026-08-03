import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-charcoal/5 dark:border-white/5 bg-surface-muted dark:bg-surface-dark-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading text-lg font-bold text-brand-gold-400 mb-3">
              {APP_NAME}
            </p>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 leading-relaxed">
              The premium peer-to-peer car rental marketplace. Drive luxury, own freedom.
            </p>
          </div>
          <div>
            <h2 className="font-medium text-sm mb-3 text-charcoal dark:text-cream">For Renters</h2>
            <ul className="space-y-2 text-sm text-charcoal/60 dark:text-cream/60">
              <li><Link href={ROUTES.VEHICLES} className="hover:text-brand-gold-400 transition-colors">Browse Cars</Link></li>
              <li><Link href={ROUTES.VEHICLE_MAP} className="hover:text-brand-gold-400 transition-colors">Nearby Cars</Link></li>
              <li><Link href={ROUTES.HOW_IT_WORKS} className="hover:text-brand-gold-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-medium text-sm mb-3 text-charcoal dark:text-cream">For Hosts</h2>
            <ul className="space-y-2 text-sm text-charcoal/60 dark:text-cream/60">
              <li><Link href={ROUTES.VEHICLE_NEW} className="hover:text-brand-gold-400 transition-colors">List Your Car</Link></li>
              <li><Link href={ROUTES.HOST_BOOKINGS} className="hover:text-brand-gold-400 transition-colors">Booking Requests</Link></li>
              <li><Link href={ROUTES.TRUST_SAFETY} className="hover:text-brand-gold-400 transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-medium text-sm mb-3 text-charcoal dark:text-cream">Company</h2>
            <ul className="space-y-2 text-sm text-charcoal/60 dark:text-cream/60">
              <li><Link href={ROUTES.ABOUT} className="hover:text-brand-gold-400 transition-colors">About</Link></li>
              <li><Link href={ROUTES.CONTACT} className="hover:text-brand-gold-400 transition-colors">Contact</Link></li>
              <li><Link href={ROUTES.PRIVACY} className="hover:text-brand-gold-400 transition-colors">Privacy</Link></li>
              <li><Link href={ROUTES.TERMS} className="hover:text-brand-gold-400 transition-colors">Terms of Service</Link></li>
              <li><Link href={ROUTES.REFUNDS} className="hover:text-brand-gold-400 transition-colors">Refunds</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-charcoal/5 dark:border-white/5 text-center text-xs text-charcoal/70 dark:text-cream/70">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
