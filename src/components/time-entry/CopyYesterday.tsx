import React, { useState } from 'react';
import { Copy, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { cn, getPhaseLabel } from '@/lib/utils';

interface CopyYesterdayProps {
  userId: string;
  onSuccess?: () => void;
}

export function CopyYesterday({ userId, onSuccess }: CopyYesterdayProps) {
  const { copyYesterday, loading } = useTimeEntries();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    setError(null);
    const { data, error: copyError } = await copyYesterday(userId);
    
    if (copyError) {
      setError(copyError as string || "Failed to copy entries.");
      // Auto-hide error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } else if (data && data.length > 0) {
      onSuccess?.();
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
        Copy Yesterday's Logs
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Copy Yesterday?</h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                This will duplicate all your entries from yesterday and log them for today. You can still edit them after copying.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopy}
                  disabled={loading}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Confirm Copy
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="w-full py-3 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
