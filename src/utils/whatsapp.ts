import { Order } from '../types';

export const PANTRY_WHATSAPP_NUMBER = '919845123098'; // Allama Hostel Midnight Pantry Hub

export function generateWhatsAppOrderMessage(order: Order): string {
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.item.name} - ₹${item.item.price * item.quantity}`
    )
    .join('\n');

  const paymentText =
    order.payment.method === 'COD'
      ? 'Cash on Delivery (COD)'
      : `Online UPI (${order.payment.isPaid ? 'Paid' : 'Pending Verification'}) • UPI ID: 9749528677@ibl (Allama Mart)`;

  return `🌙 *ALLAMA MART - MIDNIGHT PACKAGED FOOD ORDER*
━━━━━━━━━━━━━━━━━━━━━━━
📦 *Order ID:* #${order.orderNumber}
⏳ *Status:* ${order.status}
🕒 *Time:* ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

👤 *STUDENT DETAILS:*
• *Name:* ${order.address.studentName}
• *WhatsApp:* ${order.address.whatsappNumber}
• *Location:* ${order.address.block}, ${order.address.floor}
• *Room Number:* ${order.address.roomNumber}
${order.address.deliveryInstructions ? `• *Note:* ${order.address.deliveryInstructions}` : ''}

🛒 *ITEMS BREAKDOWN:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━━━━
💵 *Subtotal:* ₹${order.subtotal}
🚚 *Room Delivery Fee:* ₹0 (Free for Allama Hostel)
💰 *Total Payable:* ₹${order.totalAmount}
💳 *Payment:* ${paymentText}
🔑 *Door Handover PIN:* ${order.deliveryCode}
━━━━━━━━━━━━━━━━━━━━━━━
_Room to room delivery in Block A & B only._`;
}

export function getWhatsAppOrderUrl(order: Order, recipientPhone?: string): string {
  const message = generateWhatsAppOrderMessage(order);
  const encoded = encodeURIComponent(message);
  if (recipientPhone) {
    const cleanPhone = recipientPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  // Generic share link (opens WhatsApp chat selector)
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export function getWhatsAppCustomerChatUrl(phone: string, customerName: string, orderNumber: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const greeting = encodeURIComponent(
    `Hi ${customerName}, this is Allama Mart runner regarding your order #${orderNumber}.`
  );
  return `https://wa.me/${cleanPhone}?text=${greeting}`;
}
