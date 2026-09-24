import React from 'react';
import { useOrders } from '../context/OrderContext';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export const DatabaseSyncErrorBanner: React.FC = () => {
  const { firestoreError, clearFirestoreError } = useOrders();

  if (!firestoreError) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] px-4 py-3 bg-rose-950/95 border-b border-rose-500/50 backdrop-blur-md text-rose-100 shadow-2xl transition-all animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Supabase Real-Time Diagnostic Alert
            </div>
            <div className="text-xs font-mono text-rose-100 break-all select-all font-medium mt-0.5">
              {firestoreError}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload App</span>
          </button>
          <button
            onClick={clearFirestoreError}
            title="Dismiss error banner"
            className="p-1 rounded-lg hover:bg-rose-900/60 text-rose-300 hover:text-white transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Backwards-compatible alias
export const FirestoreErrorBanner = DatabaseSyncErrorBanner;
