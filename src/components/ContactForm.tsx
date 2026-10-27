import { useState } from "react";
import { Check, Loader2, Mail, MessageSquare, Send, Tag, User } from "lucide-react";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { CONTACT_LIMITS, CONTACT_TOPICS, ContactTopicValue, isContactTopic, isValidContactEmail, type ContactTopic } from "../../lib/contact-topics";

// text-base at the base viewport prevents iOS Safari auto-zoom on focus.
const FIELD_BASE =
  "w-full pl-10 pr-4 py-3 rounded-lg bg-surface-inset text-ink placeholder-ink-dim text-base focus:outline-none focus:ring-1 transition-colors";
const FIELD_OK = "border border-hairline focus:border-accent focus:ring-accent";
const FIELD_ERROR =
  "border border-danger focus:border-danger focus:ring-danger";
const LABEL = "block text-sm font-medium text-ink-muted mb-1";
const FIELD_ICON =
  "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-dim pointer-events-none";
const FIELD_WRAPPER_CLASS = "relative";
const FIELD_ERROR_TEXT_CLASS = "mt-1 text-xs text-danger";
const SUCCESS_CLASS = "flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-lg bg-success/10 border border-success/40";
const CONTACT_FIELD = {
  topic: "contact-topic",
  name: "contact-name",
  nameError: "contact-name-error",
  email: "contact-email",
  emailError: "contact-email-error",
  message: "contact-message",
  messageError: "contact-message-error",
};
const CONTACT_VALUES: Readonly<{ alert: "alert"; button: "button" }> = { alert: "alert", button: "button" };

enum ContactFormStatusValue { Idle = "idle", Loading = "loading", Success = "success", Error = "error" }

type ContactFormProps = Readonly<{ defaultTopic?: ContactTopic; className?: string }>;

export function ContactForm({
  defaultTopic = ContactTopicValue.General,
  className = "",
}: ContactFormProps) {
  const [topic, setTopic] = useState(defaultTopic);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(ContactFormStatusValue.Idle);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { execute } = useRecaptcha();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!isValidContactEmail(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (!message.trim()) {
      errors.message = "Message is required.";
    } else if (message.trim().length < CONTACT_LIMITS.messageMin) {
      errors.message = "Enter at least 10 characters.";
    } else if (message.length > CONTACT_LIMITS.messageMax) {
      errors.message = "Message cannot exceed 5,000 characters.";
    }

    if (name.trim().length > CONTACT_LIMITS.nameLength) {
      errors.name = "Name cannot exceed 100 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus(ContactFormStatusValue.Loading);
    setErrorMsg("");

    try {
      const captchaToken = await execute("contact");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          topic,
          message: message.trim(),
          captchaToken,
        }),
      });

      if (res.ok) {
        setStatus(ContactFormStatusValue.Success);
        setEmail("");
        setName("");
        setMessage("");
        setFieldErrors({});
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "We could not send your message. Please try again.");
        setStatus(ContactFormStatusValue.Error);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus(ContactFormStatusValue.Error);
    }
  };

  if (status === ContactFormStatusValue.Success) {
    return (
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`${SUCCESS_CLASS} ${className}`}
      >
        <Check className="w-8 h-8 text-success" />
        <p className="text-success font-semibold">Message sent.</p>
        <p className="text-sm text-ink-muted">
          We will reply as soon as possible.
        </p>
        <button
          type={CONTACT_VALUES.button}
          onClick={() => setStatus(ContactFormStatusValue.Idle)}
          className="mt-2 text-sm text-accent hover:text-accent-hover hover:underline transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={CONTACT_FIELD.topic} className={LABEL}>
            Topic
          </label>
          <div className={FIELD_WRAPPER_CLASS}>
            <Tag className={FIELD_ICON} />
            <select
              id={CONTACT_FIELD.topic}
              value={topic}
              onChange={(event) => {
                if (isContactTopic(event.target.value)) {
                  setTopic(event.target.value);
                }
              }}
              className={`${FIELD_BASE} ${FIELD_OK} appearance-none`}
            >
              {Object.values(ContactTopicValue).map((value) => (
                <option key={value} value={value}>
                  {CONTACT_TOPICS[value].formLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={CONTACT_FIELD.name} className={LABEL}>
            Name <span className="text-ink-dim font-normal">(optional)</span>
          </label>
          <div className={FIELD_WRAPPER_CLASS}>
            <User className={FIELD_ICON} />
            <input
              id={CONTACT_FIELD.name}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="Your name"
              maxLength={CONTACT_LIMITS.nameLength}
              aria-invalid={fieldErrors.name ? true : undefined}
              aria-describedby={fieldErrors.name ? CONTACT_FIELD.nameError : undefined}
              className={`${FIELD_BASE} ${FIELD_OK}`}
            />
          </div>
          {fieldErrors.name && (
            <p id={CONTACT_FIELD.nameError} role={CONTACT_VALUES.alert} className={FIELD_ERROR_TEXT_CLASS}>
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={CONTACT_FIELD.email} className={LABEL}>
            Email
          </label>
          <div className={FIELD_WRAPPER_CLASS}>
            <Mail className={FIELD_ICON} />
            <input
              id={CONTACT_FIELD.email}
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: "" }));
                if (status === ContactFormStatusValue.Error) {
                  setStatus(ContactFormStatusValue.Idle);
                }
              }}
              placeholder="your@email.com"
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={
                fieldErrors.email ? CONTACT_FIELD.emailError : undefined
              }
              className={`${FIELD_BASE} ${
                fieldErrors.email ? FIELD_ERROR : FIELD_OK
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p id={CONTACT_FIELD.emailError} role={CONTACT_VALUES.alert} className={FIELD_ERROR_TEXT_CLASS}>
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={CONTACT_FIELD.message} className={LABEL}>
            Message
          </label>
          <div className={FIELD_WRAPPER_CLASS}>
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-ink-dim pointer-events-none" />
            <textarea
              id={CONTACT_FIELD.message}
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (fieldErrors.message)
                  setFieldErrors((p) => ({ ...p, message: "" }));
                if (status === ContactFormStatusValue.Error) {
                  setStatus(ContactFormStatusValue.Idle);
                }
              }}
              placeholder="Describe the problem and the help you need."
              rows={5}
              maxLength={CONTACT_LIMITS.messageMax}
              aria-invalid={fieldErrors.message ? true : undefined}
              aria-describedby={
                fieldErrors.message ? CONTACT_FIELD.messageError : undefined
              }
              className={`${FIELD_BASE} resize-y ${
                fieldErrors.message ? FIELD_ERROR : FIELD_OK
              }`}
            />
          </div>
          <div className="flex justify-between mt-1">
            {fieldErrors.message ? (
              <p id={CONTACT_FIELD.messageError} role={CONTACT_VALUES.alert} className="text-xs text-danger">
                {fieldErrors.message}
              </p>
            ) : (
              <span />
            )}
            <p className="text-xs text-ink-dim">{message.length}/{CONTACT_LIMITS.messageMax}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === ContactFormStatusValue.Loading}
          style={{ touchAction: "manipulation" }}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent-fill text-accent-contrast font-semibold shadow-lg hover:bg-accent-fill-hover hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {status === ContactFormStatusValue.Loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send Message
        </button>

        {status === ContactFormStatusValue.Error && (
          <p role={CONTACT_VALUES.alert} className="text-xs text-danger text-center">
            {errorMsg}
          </p>
        )}
      </form>
      <p className="mt-3 text-xs text-ink-dim text-center">
        Protected by reCAPTCHA. Never send passwords or security codes.
      </p>
    </div>
  );
}
