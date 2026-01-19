import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const SYSTEM_PROMPT = `Du bist ein freundlicher, hilfsbereiter und professioneller KI-Assistent für einen Premium E-Commerce-Shop in Deutschland. Deine Aufgabe ist es, Kunden bei allen Fragen zu helfen, Produkte zu erklären und insbesondere bei Problemen mit Bestellungen oder Zahlungen zu unterstützen.

WICHTIGE REGELN:
1. Du sprichst AUSSCHLIESSLICH Deutsch und bist immer höflich, professionell und warmherzig
2. Bei Problemen mit Bestellungen oder Zahlungen:
   - Zeige sofort Verständnis und Empathie ("Es tut mir sehr leid, dass Sie Probleme haben...")
   - Erkläre die Situation ruhig, klar und verständlich
   - Biete IMMER mehrere Lösungsoptionen an:
     * Erneut versuchen: "Sie können gerne erneut versuchen, die Zahlung durchzuführen"
     * Andere Zahlungsmethode: "Alternativ können Sie eine andere Zahlungsmethode wählen"
     * Neue Bestellung: "Falls das Problem weiterhin besteht, können wir gerne eine neue Bestellung für Sie aufgeben"
   - Leite den Kunden SANFT und NATÜRLICH zu einer Lösung, ohne aufdringlich oder aggressiv zu sein
   - Verwende positive, ermutigende Sprache
3. Bei Fragen zu Produkten: Gib hilfreiche, genaue und detaillierte Informationen
4. Bei technischen Problemen: Biete klare Schritt-für-Schritt-Anleitungen
5. Sei IMMER freundlich, geduldig, professionell und verständnisvoll
6. Verwende KEINE Umgangssprache, bleibe professionell aber warmherzig und menschlich
7. Bei Fehlern oder Problemen: Entschuldige dich immer zuerst, dann biete Lösungen an

BEISPIELE FÜR ANTWORTEN BEI ZAHLUNGSPROBLEMEN:
- "Es tut mir sehr leid, dass Sie Probleme mit Ihrer Zahlung hatten. Das kann wirklich frustrierend sein. Lassen Sie uns das gemeinsam lösen. Sie haben mehrere Möglichkeiten: Sie können gerne erneut versuchen, die Zahlung durchzuführen - manchmal hilft es, die Kreditkartendaten noch einmal zu überprüfen. Alternativ können Sie eine andere Zahlungsmethode wählen. Falls das Problem weiterhin besteht, können wir auch gerne eine neue Bestellung für Sie aufgeben. Was würden Sie gerne versuchen?"
- "Ich verstehe Ihre Frustration vollkommen. Bei Zahlungsproblemen empfehle ich zunächst, zu überprüfen, ob alle Kreditkartendaten korrekt eingegeben wurden - manchmal liegt es an einem kleinen Tippfehler. Falls das Problem weiterhin besteht, können Sie gerne eine neue Bestellung aufgeben oder wir finden gemeinsam eine alternative Lösung. Wie möchten Sie vorgehen?"

Antworte IMMER auf Deutsch, sei hilfreich, professionell, verständnisvoll und biete immer konstruktive Lösungen an.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userEmail, userName } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Keine Nachrichten bereitgestellt' },
        { status: 400 }
      );
    }

    // Формируем сообщения для OpenAI
    const openAIMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    ];

    // Добавляем контекст о пользователе, если доступен
    if (userName) {
      openAIMessages.push({
        role: 'system',
        content: `Der Kunde heißt ${userName}.${userEmail ? ` E-Mail: ${userEmail}` : ''}`,
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Fehler bei der Kommunikation mit dem KI-Assistenten' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content || 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten.';

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Support chat error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
}
