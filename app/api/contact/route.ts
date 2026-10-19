import { NextRequest, NextResponse } from "next/server";
import { CONTACT_DATA } from "@/data/contact";

// Simple in-memory rate limiting map: ip -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter out timestamps older than the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. Rate Limiting Check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, message, honeypot } = body;

    // 2. Honeypot check (anti-bot trap)
    // If bot filled the hidden honeypot field, pretend success without sending
    if (honeypot && String(honeypot).trim().length > 0) {
      return NextResponse.json({ success: true, note: "Filtered" });
    }

    // 3. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter a valid name (at least 2 characters)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a message (at least 5 characters)." },
        { status: 400 }
      );
    }

    // Sanitize lengths
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().slice(0, 120);
    const cleanMessage = message.trim().slice(0, 3000);

    const apiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.CONTACT_RECEIVER_EMAIL || CONTACT_DATA.email;

    // 4. Send via Resend if API key is present
    if (apiKey) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Portfolio <onboarding@resend.dev>",
          to: [recipientEmail],
          reply_to: cleanEmail,
          subject: `Portfolio Message from ${cleanName}`,
          text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #222; background-color: #0c0c0c; color: #f0f0f0; border-radius: 8px;">
              <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 12px; color: #ffffff;">New Portfolio Inquiry</h2>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${cleanName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${cleanEmail}" style="color: #38bdf8;">${cleanEmail}</a></p>
              <p style="margin: 16px 0 8px 0;"><strong>Message:</strong></p>
              <div style="background-color: #161616; padding: 16px; border-radius: 6px; border-left: 3px solid #38bdf8; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${cleanMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
              <p style="margin-top: 24px; font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: 0.1em;">Transmitted from Editorial Portfolio Contact Form</p>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json().catch(() => ({}));
        console.error("Resend API Error:", errorData);
        return NextResponse.json(
          { error: "Failed to dispatch email via Resend provider." },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // 5. Development Fallback (when RESEND_API_KEY is not configured yet)
    console.log("==> [PORTFOLIO CONTACT FORM - DEV SIMULATION] <==");
    console.log(`From: ${cleanName} <${cleanEmail}>`);
    console.log(`Message:\n${cleanMessage}`);
    console.log("To configure live email delivery, set RESEND_API_KEY in .env");

    return NextResponse.json({
      success: true,
      simulated: true,
      message: "Message received (dev simulation mode, configure RESEND_API_KEY for live delivery).",
    });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
