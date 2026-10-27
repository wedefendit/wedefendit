const RECAPTCHA_SECRET = process.env.GOOGLE_CAPTCHA_SECRET ?? "";
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const RECAPTCHA_SCORE_THRESHOLD = 0.5;
const DEFAULT_RECAPTCHA_SCORE = 1;

export enum ProtectedFormStatusValue { Ok = 200, BadRequest = 400, Forbidden = 403, MethodNotAllowed = 405, RateLimited = 429, ServerError = 500 }

type RecaptchaResult = { success?: boolean; score?: number };

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch(
    `${RECAPTCHA_VERIFY_URL}?secret=${RECAPTCHA_SECRET}&response=${token}`,
    { method: "POST" },
  );
  const result: RecaptchaResult = await response.json();
  return result.success === true &&
    (result.score ?? DEFAULT_RECAPTCHA_SCORE) >= RECAPTCHA_SCORE_THRESHOLD;
}
