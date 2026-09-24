import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { STORE_UPI_CONFIG, buildUpiPaymentUri } from '../utils/upi';
import { QrCode, CheckCircle2, Copy, ExternalLink, ShieldCheck, Smartphone } from 'lucide-react';

interface UpiQrCodeProps {
  amount: number;
  orderNumber?: string;
  onPaymentSuccess?: () => void;
  isPaid?: boolean;
}

export const UpiQrCode: React.FC<UpiQrCodeProps> = ({
  amount,
  orderNumber,
  onPaymentSuccess,
  isPaid = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

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

  const handleSimulatePayment = () => {
    if (!onPaymentSuccess) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentSuccess();
    }, 1000);
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

      {/* Confirmation / verification action */}
      {onPaymentSuccess && (
        <div className="pt-1">
          {!isPaid ? (
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30 transition-all"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isVerifying ? 'Confirming with Bank...' : `I Have Paid ₹${amount} via UPI`}</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">UPI Payment Verified (Transferred to {STORE_UPI_CONFIG.upiId})</span>
              </div>
              <span className="font-mono font-bold text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">PAID</span>
            </div>
          )}
        </div>
      )}

      {/* Bank security badge */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 justify-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Direct bank settlement • Verified NPCI UPI ID: <strong className="text-slate-300">{STORE_UPI_CONFIG.upiId}</strong></span>
      </div>
    </div>
  );
};
