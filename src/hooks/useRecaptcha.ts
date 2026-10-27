import { useCallback, useEffect } from "react";

const SITE_KEY = "6LfvzMEsAAAAACyzkpFbs-35xE6jRYengttmVunn";
const SCRIPT_ID = "recaptcha-v3";
const RECAPTCHA_NOT_LOADED_MESSAGE = "reCAPTCHA not loaded";
const FUNCTION_TYPE = "function";

type RecaptchaApi = Readonly<{
  ready: (callback: () => void) => void;
  execute: (
    siteKey: string,
    options: Readonly<{ action: string }>,
  ) => Promise<string>;
}>;

function isRecaptchaApi(value: unknown): value is RecaptchaApi {
  if (typeof value !== "object" || value === null) return false;
  return (
    typeof Reflect.get(value, "ready") === FUNCTION_TYPE &&
    typeof Reflect.get(value, "execute") === FUNCTION_TYPE
  );
}

export function useRecaptcha() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const execute = useCallback(async (action: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const recaptcha: unknown = Reflect.get(window, "grecaptcha");
      if (!isRecaptchaApi(recaptcha)) {
        reject(new Error(RECAPTCHA_NOT_LOADED_MESSAGE));
        return;
      }
      recaptcha.ready(() => {
        recaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject);
      });
    });
  }, []);

  return { execute };
}
