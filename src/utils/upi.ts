/**
 * Store UPI & Merchant Payment Configuration
 * Centralized store financial settings for direct-to-bank UPI transfers.
 */

export const STORE_UPI_CONFIG = {
  // UPI ID connected to your bank account:
  upiId: '9749528677@ibl',
  // Official Merchant / Payee display name:
  merchantName: 'Allama Mart',
  // Transaction note / description:
  transactionNote: 'Allama Mart Packaged Food Order',
  // Currency code:
  currency: 'INR',
};

/**
 * Generate a standard NPCI / UPI payment URI (spec-compliant for GPay, PhonePe, Paytm, BHIM, etc.)
 * format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
 */
export function buildUpiPaymentUri(amount: number, orderId?: string, note?: string): string {
  const params = new URLSearchParams();
  params.set('pa', STORE_UPI_CONFIG.upiId);
  params.set('pn', STORE_UPI_CONFIG.merchantName);
  
  if (amount > 0) {
    params.set('am', amount.toFixed(2));
  }
  
  params.set('cu', STORE_UPI_CONFIG.currency);
  
  const orderRef = orderId ? `Order #${orderId}` : '';
  const fullNote = [note || STORE_UPI_CONFIG.transactionNote, orderRef].filter(Boolean).join(' - ');
  params.set('tn', fullNote);

  return `upi://pay?${params.toString()}`;
}
