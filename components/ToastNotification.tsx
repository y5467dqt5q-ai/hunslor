'use client';

import { useToastStore } from '@/lib/store';

export default function ToastNotification() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="animate-slide-up-fade"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-neon-green/50 shadow-lg p-4 min-w-[300px] max-w-[400px] flex items-center gap-3 backdrop-blur-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-neon-green">{toast.title}</div>
              <div className="text-xs text-text-muted truncate">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
