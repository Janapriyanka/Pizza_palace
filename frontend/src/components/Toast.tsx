/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div 
      id="toast-container" 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-gray-900 border-gray-800 text-white';
          let icon = <Info className="w-5 h-5 text-amber-500" />;

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-emerald-950/95 border border-emerald-500/30 text-emerald-100';
              icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
              break;
            case 'error':
              bgColor = 'bg-rose-950/95 border border-rose-500/30 text-rose-100';
              icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
              break;
            case 'warning':
              bgColor = 'bg-amber-950/95 border border-amber-500/30 text-amber-100';
              icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
              break;
            case 'info':
              bgColor = 'bg-sky-950/95 border border-sky-500/30 text-sky-100';
              icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
              break;
          }

          return (
            <motion.div
              id={`toast-${toast.id}`}
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              layout
              className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto ${bgColor}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium">{toast.text}</div>
              <button
                id={`dismiss-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5 rounded-full hover:bg-white/10 shrink-0"
                aria-label="Close message"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
