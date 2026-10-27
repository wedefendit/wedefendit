import type { NextApiRequest, NextApiResponse } from "next";
import {
  CONTACT_LIMITS,
  ContactTopicValue,
  contactTopicMessageLabel,
  contactTopicRecipient,
  isValidContactEmail,
} from "../../../lib/contact-topics";
import { ProtectedFormStatusValue, verifyRecaptcha } from "../../../lib/recaptcha";

const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";

enum ContactRequestMethodValue { Post = "POST" }
enum ContactErrorValue { UnsupportedMethod = "Method not allowed", InvalidEmail = "Enter a valid email address.", ShortMessage = "Enter at least 10 characters in your message.", LongMessage = "Keep your message under 5,000 characters.", CaptchaRequired = "Complete the CAPTCHA.", CaptchaRejected = "We could not verify the CAPTCHA. Please try again.", TooManyRequests = "Too many requests. Please try again in a minute.", DeliveryFailed = "We could not send your message. Please try again." }

type Body = {
  email?: string;
  name?: string;
  topic?: string;
  message?: string;
  captchaToken?: string;
};

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\n", "<br/>");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== ContactRequestMethodValue.Post) {
    return res.status(ProtectedFormStatusValue.MethodNotAllowed).json({ error: ContactErrorValue.UnsupportedMethod });
  }

  const {
    email,
    name,
    topic = ContactTopicValue.General,
    message,
    captchaToken,
  } = req.body as Body;

  if (!email || !isValidContactEmail(email)) {
    return res.status(ProtectedFormStatusValue.BadRequest).json({ error: ContactErrorValue.InvalidEmail });
  }

  if (!message || message.trim().length < CONTACT_LIMITS.messageMin) {
    return res.status(ProtectedFormStatusValue.BadRequest).json({ error: ContactErrorValue.ShortMessage });
  }

  if (message.length > CONTACT_LIMITS.messageMax) {
    return res.status(ProtectedFormStatusValue.BadRequest).json({ error: ContactErrorValue.LongMessage });
  }

  if (!captchaToken) {
    return res.status(ProtectedFormStatusValue.BadRequest).json({ error: ContactErrorValue.CaptchaRequired });
  }

  const captchaValid = await verifyRecaptcha(captchaToken);
  if (!captchaValid) {
    return res.status(ProtectedFormStatusValue.Forbidden).json({ error: ContactErrorValue.CaptchaRejected });
  }

  const toEmail = contactTopicRecipient(topic);
  const topicLabel = contactTopicMessageLabel(topic);
  const senderName = name?.trim() || "Website Visitor";

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Defend I.T. Website",
          email: "noreply@wedefendit.com",
        },
        to: [{ email: toEmail }],
        replyTo: { email, name: senderName },
        subject: `[${topicLabel}] from ${senderName}`,
        htmlContent: `<!DOCTYPE html><html><head><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><style>:root{color-scheme:dark}</style></head><body style="margin:0;padding:16px;background:#0b1121;"><div data-ogsb="rgb(15,23,42)" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f172a;border:1px solid #1e3a5f;border-radius:8px;overflow:hidden;"><div data-ogsb="rgb(15,23,42)" style="padding:24px 24px 16px;background:#0f172a;border-bottom:1px solid #1e3a5f;"><h2 style="margin:0 0 4px;font-size:20px;color:#38bdf8;">${escapeHtml(topicLabel)}</h2><p style="margin:0;font-size:12px;color:#64748b;">via wedefendit.com contact form</p></div><div data-ogsb="rgb(15,23,42)" style="padding:20px 24px;background:#0f172a;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:8px 0;font-size:13px;font-weight:600;color:#94a3b8;vertical-align:top;width:80px;">From</td><td style="padding:8px 0;font-size:14px;color:#e2e8f0;">${escapeHtml(senderName)}</td></tr><tr><td style="padding:8px 0;font-size:13px;font-weight:600;color:#94a3b8;vertical-align:top;">Email</td><td style="padding:8px 0;font-size:14px;"><a href="mailto:${escapeHtml(email)}" style="color:#38bdf8;text-decoration:none;">${escapeHtml(email)}</a></td></tr><tr><td style="padding:8px 0;font-size:13px;font-weight:600;color:#94a3b8;vertical-align:top;">Topic</td><td style="padding:8px 0;font-size:14px;color:#e2e8f0;">${escapeHtml(topicLabel)}</td></tr></table></div><div style="margin:0 24px 20px;padding:16px;background:#1e293b;border:1px solid #334155;border-radius:6px;"><p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.6;">${escapeHtml(message.trim())}</p></div><div data-ogsb="rgb(15,23,42)" style="padding:12px 24px;background:#0f172a;border-top:1px solid #1e3a5f;text-align:center;"><p style="margin:0;font-size:11px;color:#475569;">Defend I.T. Solutions &middot; wedefendit.com</p></div></div></body></html>`,
      }),
    });

    if (brevoRes.status === ProtectedFormStatusValue.RateLimited) {
      return res.status(ProtectedFormStatusValue.RateLimited).json({ error: ContactErrorValue.TooManyRequests });
    }

    if (!brevoRes.ok) {
      const err = await brevoRes.text();
      console.error("Brevo SMTP error:", err);
      return res.status(ProtectedFormStatusValue.ServerError).json({ error: ContactErrorValue.DeliveryFailed });
    }

    return res.status(ProtectedFormStatusValue.Ok).json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(ProtectedFormStatusValue.ServerError).json({ error: ContactErrorValue.DeliveryFailed });
  }
}
