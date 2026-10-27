import type { NextApiRequest, NextApiResponse } from "next";
import { isValidContactEmail } from "../../../lib/contact-topics";
import { ProtectedFormStatusValue, verifyRecaptcha } from "../../../lib/recaptcha";

const BREVO_API_KEY = process.env.BREVO_API_KEY ?? "";

enum WaitlistTierValue { Individual = "individual", Team = "team", Enterprise = "enterprise" }
type WaitlistTier = `${WaitlistTierValue}`;
enum BrevoResultValue { Ok = "ok", RateLimited = "rate_limited", Failed = "failed" }
enum WaitlistRequestMethodValue { Post = "POST" }

const LIST_IDS: Record<WaitlistTier, number> = {
  [WaitlistTierValue.Individual]: 4,
  [WaitlistTierValue.Team]: 5,
  [WaitlistTierValue.Enterprise]: 8,
};
const BREVO_STATUS = { contactExists: 400, rateLimited: 429 };
enum WaitlistErrorValue { UnsupportedMethod = "Method not allowed", InvalidEmail = "Enter a valid email address.", CaptchaRequired = "Complete the CAPTCHA.", CaptchaRejected = "We could not verify the CAPTCHA. Please try again.", TooManyRequests = "Too many requests. Please try again in a minute.", DeliveryFailed = "We could not add you to the list. Please try again." }

type Body = {
  email?: string;
  tier?: WaitlistTier;
  captchaToken?: string;
};

async function addToBrevo(email: string, listId: number): Promise<BrevoResultValue> {
  const createRes = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
    }),
  });

  if (createRes.ok) return BrevoResultValue.Ok;
  if (createRes.status === BREVO_STATUS.rateLimited) return BrevoResultValue.RateLimited;

  if (createRes.status === BREVO_STATUS.contactExists) {
    const updateRes = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listIds: [listId],
        }),
      },
    );

    if (updateRes.ok) return BrevoResultValue.Ok;
    if (updateRes.status === BREVO_STATUS.rateLimited) return BrevoResultValue.RateLimited;
    return BrevoResultValue.Failed;
  }

  return BrevoResultValue.Failed;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== WaitlistRequestMethodValue.Post) {
    return res.status(ProtectedFormStatusValue.MethodNotAllowed).json({ error: WaitlistErrorValue.UnsupportedMethod });
  }

  const { email, tier = WaitlistTierValue.Individual, captchaToken } = req.body as Body;

  if (!email || !isValidContactEmail(email)) {
    return res.status(ProtectedFormStatusValue.BadRequest).json({ error: WaitlistErrorValue.InvalidEmail });
  }

  if (!captchaToken) {
    return res.status(ProtectedFormStatusValue.BadRequest).json({ error: WaitlistErrorValue.CaptchaRequired });
  }

  const listId = LIST_IDS[tier] ?? LIST_IDS.individual;

  const captchaValid = await verifyRecaptcha(captchaToken);
  if (!captchaValid) {
    return res.status(ProtectedFormStatusValue.Forbidden).json({ error: WaitlistErrorValue.CaptchaRejected });
  }

  const result = await addToBrevo(email, listId);

  if (result === BrevoResultValue.RateLimited) {
    return res.status(ProtectedFormStatusValue.RateLimited).json({ error: WaitlistErrorValue.TooManyRequests });
  }

  if (result === BrevoResultValue.Failed) {
    return res.status(ProtectedFormStatusValue.ServerError).json({ error: WaitlistErrorValue.DeliveryFailed });
  }

  return res.status(ProtectedFormStatusValue.Ok).json({ ok: true });
}
