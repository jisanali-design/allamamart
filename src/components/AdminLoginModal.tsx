import React, { useState } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_PIN = '5829';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleKeypadPress = (val: string) => {
    if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === ADMIN_PIN) {
          soundFx.playSuccess();
          setTimeout(() => {
            setPin('');
            setError(false);
            onSuccess();
          }, 200);
        } else {
          soundFx.playTap();
          setError(true);
          setErrorMessage('Incorrect PIN. Access denied.');
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className={`relative w-full max-w-sm rounded-3xl bg-[#1e293b] border ${
          error ? 'border-rose-500/80' : 'border-white/[0.08]'
        } shadow-2xl p-6 space-y-5 transition-all text-[#f8fafc]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#f59e0b] flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f8fafc] font-['Outfit']">Hostel Admin Portal</h3>
              <p className="text-xs text-[#94a3b8]">Live Dispatch & Pantry Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94a3b8] hover:text-[#f8fafc] hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Enter the authorized 4-digit manager PIN to access delivery dispatch, manage inventory, and toggle store operating hours.
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-pulse'
                  : pin.length > index
                  ? 'border-[#f59e0b] bg-[#f59e0b] scale-110 shadow-sm shadow-amber-500/50'
                  : 'border-white/[0.1] bg-[#0b0f19]'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="text-rose-400 text-xs text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="py-3 rounded-2xl bg-[#0b0f19] hover:bg-slate-800 border border-white/[0.08] text-[#f8fafc] font-mono text-base font-bold transition-all active:scale-95 cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="py-3 rounded-2xl bg-[#0b0f19]/60 hover:bg-slate-800 text-[#94a3b8] text-xs font-semibold cursor-pointer border border-white/[0.05]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="py-3 rounded-2xl bg-[#0b0f19] hover:bg-slate-800 border border-white/[0.08] text-[#f8fafc] font-mono text-base font-bold transition-all active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-[#0b0f19]/60 hover:bg-slate-800 text-[#94a3b8] text-xs font-semibold cursor-pointer border border-white/[0.05]"
          >
            ⌫
          </button>
        </div>

        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>Protected Staff Area</span>
          <span className="font-medium text-slate-400">Allama Pantry Hub</span>
        </div>
      </div>
    </div>
  );
};
