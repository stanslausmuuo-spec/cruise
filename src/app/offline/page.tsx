import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-gold-400/10 flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-brand-gold-400" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-charcoal/60 dark:text-cream/60 mb-6">
          It looks like you&apos;ve lost your internet connection. Some features may be limited while you&apos;re offline.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-charcoal/40 dark:text-cream/40">
            You can still browse previously loaded vehicles and view your saved information.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold-400 text-white rounded-xl font-medium hover:bg-brand-gold-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
