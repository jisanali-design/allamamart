import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { STORE_UPI_CONFIG, buildUpiPaymentUri } from '../utils/upi';
import { QrCode, CheckCircle2, Copy, ExternalLink, ShieldCheck, Smartphone, AlertCircle, Clock } from 'lucide-react';

interface UpiQrCodeProps {
  amount: number;
  orderNumber?: string;
  isPaid?: boolean;
  utrNumber?: string;
  onUtrChange?: (utr: string) => void;
  showUtrInput?: boolean;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  amount,
  orderNumber,
  isPaid = false,
  utrNumber = '',
  onUtrChange,
  showUtrInput = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const upiUri = buildUpiPaymentUri(amount, orderNumber);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#020617', // Slate 950
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate UPI QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri]);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(STORE_UPI_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
      {/* Payee Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Payee / Merchant Name:</span>
            <span className="font-bold text-white font-['Outfit']">{STORE_UPI_CONFIG.merchantName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-400">Store UPI ID:</span>
            <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 select-all">
              {STORE_UPI_CONFIG.upiId}
            </span>
            <button
              type="button"
              onClick={handleCopyUpiId}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] flex items-center gap-1 px-1.5"
              title="Copy UPI ID"
            >
              <Copy className="w-3 h-3 text-amber-400" />
              <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[11px] text-slate-400">Payable to Bank</div>
          <div className="font-black text-emerald-400 text-lg sm:text-xl flex items-center sm:justify-end gap-1">
            <span>₹{amount}</span>
            <button
              type="button"
              onClick={handleCopyAmount}
              className="text-[10px] text-slate-400 hover:text-slate-200 transition-colors p-1"
              title="Copy exact amount"
            >
              {copiedAmount ? '✓' : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Graphic & Instructions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/80">
        {/* QR image container */}
        <div className="relative p-2.5 bg-white rounded-xl shadow-lg shrink-0 flex items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`UPI QR for ${STORE_UPI_CONFIG.merchantName} (${STORE_UPI_CONFIG.upiId})`}
              className="w-40 h-40 object-contain rounded-lg"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded-lg">
              <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
            </div>
          )}

          {isPaid && (
            <div className="absolute inset-0 bg-emerald-950/85 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-emerald-400 font-bold p-2 text-center animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 mb-1 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider">Payment Verified</span>
              <span className="text-[10px] text-emerald-300/80 font-mono mt-0.5">Direct to Bank</span>
            </div>
          )}
        </div>

        {/* Scan details & App support */}
        <div className="flex-1 space-y-2 text-left w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Scan with any UPI App</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Open <strong className="text-white">Google Pay</strong>, <strong className="text-white">PhonePe</strong>, <strong className="text-white">Paytm</strong>, or <strong className="text-white">BHIM</strong> and point your camera to transfer <span className="text-emerald-400 font-bold">₹{amount}</span> directly to <strong className="text-white">{STORE_UPI_CONFIG.merchantName}</strong> ({STORE_UPI_CONFIG.upiId}).
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">Google Pay</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">PhonePe</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">Paytm</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">BHIM</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">Any Bank App</span>
          </div>

          {/* Deep link button for mobile devices */}
          <div className="pt-1.5">
            <a
              href={upiUri}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Pay directly on this device</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Payment Verification / UTR Input Section */}
      <div className="pt-1 space-y-3">
        {showUtrInput && !isPaid && (
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="upi-utr-input" className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>12-Digit UPI Reference / UTR Number</span>
                <span className="text-amber-400 text-[10px]">(Optional but speeds verification)</span>
              </label>
              {utrNumber && utrNumber.length === 12 && (
                <span className="text-[10px] text-emerald-400 font-bold">12 digits entered ✓</span>
              )}
            </div>
            <input
              id="upi-utr-input"
              type="text"
              maxLength={12}
              value={utrNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (onUtrChange) onUtrChange(val);
              }}
              placeholder="e.g. 427819827361"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-400 tracking-wider"
            />
            <p className="text-[10px] text-slate-500">
              Found under the transaction details on Google Pay, PhonePe, or Paytm receipt.
            </p>
          </div>
        )}

        {/* Verification Status Banner */}
        {isPaid ? (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">UPI Payment Verified by Admin Hub</span>
            </div>
            <span className="font-mono font-bold text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">PAID</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-200">Payment Status: Awaiting Admin Verification</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Pantry admin will confirm the bank credit for <strong className="text-white">₹{amount}</strong> on the dashboard before runner dispatch.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bank security badge */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Direct bank settlement • Verified NPCI UPI ID: <strong className="text-slate-300">{STORE_UPI_CONFIG.upiId}</strong></span>
      </div>
    </div>
  );
};
